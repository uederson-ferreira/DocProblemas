-- Script para atualizar o schema atual com campos de coordenadas GMS
-- Baseado no schema real fornecido pelo usuário

-- 1. Adicionar campos de coordenadas GMS à tabela problems
ALTER TABLE public.problems 
ADD COLUMN IF NOT EXISTS latitude_degrees INTEGER CHECK (latitude_degrees >= 0 AND latitude_degrees <= 90),
ADD COLUMN IF NOT EXISTS latitude_minutes INTEGER CHECK (latitude_minutes >= 0 AND latitude_minutes <= 59),
ADD COLUMN IF NOT EXISTS latitude_seconds DECIMAL(6,3) CHECK (latitude_seconds >= 0 AND latitude_seconds < 60),
ADD COLUMN IF NOT EXISTS latitude_direction TEXT CHECK (latitude_direction IN ('N', 'S')),
ADD COLUMN IF NOT EXISTS longitude_degrees INTEGER CHECK (longitude_degrees >= 0 AND longitude_degrees <= 180),
ADD COLUMN IF NOT EXISTS longitude_minutes INTEGER CHECK (longitude_minutes >= 0 AND longitude_minutes <= 59),
ADD COLUMN IF NOT EXISTS longitude_seconds DECIMAL(6,3) CHECK (longitude_seconds >= 0 AND longitude_seconds < 60),
ADD COLUMN IF NOT EXISTS longitude_direction TEXT CHECK (longitude_direction IN ('E', 'W'));

-- 2. Atualizar a constraint do campo type para suportar múltiplos valores
-- Primeiro, vamos alterar o tipo para TEXT para permitir arrays
ALTER TABLE public.problems 
ALTER COLUMN type TYPE TEXT;

-- 3. Remover a constraint antiga do type
ALTER TABLE public.problems 
DROP CONSTRAINT IF EXISTS problems_type_check;

-- 4. Adicionar nova constraint que permite múltiplos tipos
ALTER TABLE public.problems 
ADD CONSTRAINT problems_type_check 
CHECK (type ~ '^(meio_ambiente|saude|seguranca|outros)(,(meio_ambiente|saude|seguranca|outros))*$');

-- 5. Adicionar comentários para documentação
COMMENT ON COLUMN public.problems.latitude_degrees IS 'Graus da latitude (0-90)';
COMMENT ON COLUMN public.problems.latitude_minutes IS 'Minutos da latitude (0-59)';
COMMENT ON COLUMN public.problems.latitude_seconds IS 'Segundos da latitude (0-59.999)';
COMMENT ON COLUMN public.problems.latitude_direction IS 'Direção da latitude (N ou S)';
COMMENT ON COLUMN public.problems.longitude_degrees IS 'Graus da longitude (0-180)';
COMMENT ON COLUMN public.problems.longitude_minutes IS 'Minutos da longitude (0-59)';
COMMENT ON COLUMN public.problems.longitude_seconds IS 'Segundos da longitude (0-59.999)';
COMMENT ON COLUMN public.problems.longitude_direction IS 'Direção da longitude (E ou W)';
COMMENT ON COLUMN public.problems.type IS 'Tipos do problema (separados por vírgula: meio_ambiente,saude,seguranca,outros)';

-- 6. Criar índices para melhor performance nas consultas por coordenadas
CREATE INDEX IF NOT EXISTS idx_problems_coordinates ON public.problems(latitude_degrees, longitude_degrees);
CREATE INDEX IF NOT EXISTS idx_problems_type ON public.problems USING gin(string_to_array(type, ','));

-- 7. Função para converter coordenadas GMS para decimal
CREATE OR REPLACE FUNCTION gms_to_decimal(
  degrees INTEGER, 
  minutes INTEGER, 
  seconds DECIMAL(6,3), 
  direction TEXT
) RETURNS DECIMAL(10,6) AS $$
BEGIN
  RETURN CASE 
    WHEN direction IN ('S', 'W') THEN 
      -(degrees + minutes/60.0 + seconds/3600.0)
    ELSE 
      degrees + minutes/60.0 + seconds/3600.0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Função para converter decimal para GMS
CREATE OR REPLACE FUNCTION decimal_to_gms(
  decimal_coord DECIMAL(10,6)
) RETURNS TABLE(
  degrees INTEGER, 
  minutes INTEGER, 
  seconds DECIMAL(6,3), 
  direction TEXT
) AS $$
DECLARE
  abs_coord DECIMAL(10,6);
  deg INTEGER;
  min INTEGER;
  sec DECIMAL(6,3);
BEGIN
  abs_coord := ABS(decimal_coord);
  deg := FLOOR(abs_coord);
  min := FLOOR((abs_coord - deg) * 60);
  sec := ((abs_coord - deg - min/60.0) * 3600);
  
  RETURN QUERY SELECT 
    deg::INTEGER, 
    min::INTEGER, 
    ROUND(sec, 3), 
    CASE WHEN decimal_coord < 0 THEN 'S' ELSE 'N' END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Função para validar formato de tipos múltiplos
CREATE OR REPLACE FUNCTION validate_problem_types(types TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se todos os tipos são válidos
  RETURN types ~ '^(meio_ambiente|saude|seguranca|outros)(,(meio_ambiente|saude|seguranca|outros))*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Exemplos de uso das funções:
-- SELECT gms_to_decimal(3, 13, 34.0, 'S') as latitude_decimal;
-- SELECT * FROM decimal_to_gms(-3.226111) as latitude_gms;
-- SELECT validate_problem_types('meio_ambiente,saude') as is_valid;

-- 11. View para facilitar consultas com coordenadas formatadas
CREATE OR REPLACE VIEW problems_with_coordinates AS
SELECT 
  p.*,
  CASE 
    WHEN p.latitude_degrees IS NOT NULL THEN 
      p.latitude_degrees || '° ' || 
      COALESCE(p.latitude_minutes, 0) || "' " || 
      COALESCE(p.latitude_seconds, 0) || '" ' || 
      COALESCE(p.latitude_direction, 'S')
    ELSE NULL 
  END as latitude_formatted,
  CASE 
    WHEN p.longitude_degrees IS NOT NULL THEN 
      p.longitude_degrees || '° ' || 
      COALESCE(p.longitude_minutes, 0) || "' " || 
      COALESCE(p.longitude_seconds, 0) || '" ' || 
      COALESCE(p.longitude_direction, 'W')
    ELSE NULL 
  END as longitude_formatted,
  gms_to_decimal(
    p.latitude_degrees, 
    p.latitude_minutes, 
    p.latitude_seconds, 
    p.latitude_direction
  ) as latitude_decimal,
  gms_to_decimal(
    p.longitude_degrees, 
    p.longitude_minutes, 
    p.longitude_seconds, 
    p.longitude_direction
  ) as longitude_decimal
FROM public.problems p;
