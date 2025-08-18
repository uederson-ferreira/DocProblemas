-- Script para coordenadas no padrão brasileiro
-- Formato: "02° 30' 50\" S" (Graus° Minutos' Segundos" Direção)

-- 1. Adicionar campos de coordenadas no padrão brasileiro
ALTER TABLE public.problems 
ADD COLUMN IF NOT EXISTS latitude_gms TEXT,
ADD COLUMN IF NOT EXISTS longitude_gms TEXT;

-- 2. Atualizar a constraint do campo type para suportar múltiplos valores
-- Primeiro, vamos alterar o tipo para TEXT para permitir múltiplos tipos
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
COMMENT ON COLUMN public.problems.latitude_gms IS 'Latitude no formato brasileiro: "02° 30'' 50\" S"';
COMMENT ON COLUMN public.problems.longitude_gms IS 'Longitude no formato brasileiro: "47° 44'' 39\" W"';
COMMENT ON COLUMN public.problems.type IS 'Tipos do problema (separados por vírgula: meio_ambiente,saude,seguranca,outros)';

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_problems_coordinates_gms ON public.problems(latitude_gms, longitude_gms);
CREATE INDEX IF NOT EXISTS idx_problems_type ON public.problems USING gin(string_to_array(type, ','));

-- 7. Função para validar formato brasileiro de coordenadas
CREATE OR REPLACE FUNCTION validate_brazilian_coordinate(coord TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Valida formato: "02° 30' 50\" S" ou "47° 44' 39\" W"
  RETURN coord ~ '^\d{1,3}° \d{1,2}'' \d{1,2}(\.\d{1,3})?" [NS]$' OR
         coord ~ '^\d{1,3}° \d{1,2}'' \d{1,2}(\.\d{1,3})?" [EW]$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Função para converter coordenadas brasileiras para decimal
CREATE OR REPLACE FUNCTION brazilian_gms_to_decimal(gms_coord TEXT) 
RETURNS DECIMAL(10,6) AS $$
DECLARE
  parts TEXT[];
  degrees INTEGER;
  minutes INTEGER;
  seconds DECIMAL(6,3);
  direction TEXT;
  result DECIMAL(10,6);
BEGIN
  -- Extrair partes da coordenada: "02° 30' 50\" S"
  parts := string_to_array(gms_coord, ' ');
  
  -- Graus (remove o °)
  degrees := CAST(replace(parts[1], '°', '') AS INTEGER);
  
  -- Minutos (remove o ')
  minutes := CAST(replace(parts[2], '''', '') AS INTEGER);
  
  -- Segundos (remove o ")
  seconds := CAST(replace(parts[3], '"', '') AS DECIMAL(6,3));
  
  -- Direção
  direction := parts[4];
  
  -- Calcular decimal
  result := degrees + minutes/60.0 + seconds/3600.0;
  
  -- Aplicar direção
  IF direction IN ('S', 'W') THEN
    result := -result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Função para converter decimal para coordenadas brasileiras
CREATE OR REPLACE FUNCTION decimal_to_brazilian_gms(
  decimal_coord DECIMAL(10,6),
  is_latitude BOOLEAN DEFAULT true
) RETURNS TEXT AS $$
DECLARE
  abs_coord DECIMAL(10,6);
  degrees INTEGER;
  minutes INTEGER;
  seconds DECIMAL(6,3);
  direction TEXT;
  result TEXT;
BEGIN
  abs_coord := ABS(decimal_coord);
  degrees := FLOOR(abs_coord);
  minutes := FLOOR((abs_coord - degrees) * 60);
  seconds := ((abs_coord - degrees - minutes/60.0) * 3600);
  
  -- Determinar direção
  IF is_latitude THEN
    direction := CASE WHEN decimal_coord < 0 THEN 'S' ELSE 'N' END;
  ELSE
    direction := CASE WHEN decimal_coord < 0 THEN 'W' ELSE 'E' END;
  END IF;
  
  -- Formatar no padrão brasileiro
  result := degrees || '° ' || 
            minutes || ''' ' || 
            ROUND(seconds, 3) || '" ' || 
            direction;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Função para validar formato de tipos múltiplos
CREATE OR REPLACE FUNCTION validate_problem_types(types TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se todos os tipos são válidos
  RETURN types ~ '^(meio_ambiente|saude|seguranca|outros)(,(meio_ambiente|saude|seguranca|outros))*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 11. View para facilitar consultas com coordenadas formatadas
CREATE OR REPLACE VIEW problems_with_brazilian_coordinates AS
SELECT 
  p.*,
  p.latitude_gms,
  p.longitude_gms,
  CASE 
    WHEN p.latitude_gms IS NOT NULL THEN 
      brazilian_gms_to_decimal(p.latitude_gms)
    ELSE NULL 
  END as latitude_decimal,
  CASE 
    WHEN p.longitude_gms IS NOT NULL THEN 
      brazilian_gms_to_decimal(p.longitude_gms)
    ELSE NULL 
  END as longitude_decimal
FROM public.problems p;

-- 12. Exemplos de uso das funções:
-- SELECT validate_brazilian_coordinate('02° 30'' 50" S') as is_valid_lat;
-- SELECT validate_brazilian_coordinate('47° 44'' 39" W') as is_valid_lon;
-- SELECT brazilian_gms_to_decimal('02° 30'' 50" S') as latitude_decimal;
-- SELECT decimal_to_brazilian_gms(-2.513889, true) as latitude_brazilian;
-- SELECT validate_problem_types('meio_ambiente,saude') as is_valid;
