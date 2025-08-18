-- Script v8: Adiciona campos de coordenadas GMS (Graus, Minutos, Segundos)
-- Atualiza a tabela problems para suportar coordenadas SIRGAS 2000 no formato GMS

-- Adicionar novos campos de coordenadas GMS
ALTER TABLE problems 
ADD COLUMN IF NOT EXISTS latitude_degrees INTEGER CHECK (latitude_degrees >= 0 AND latitude_degrees <= 90),
ADD COLUMN IF NOT EXISTS latitude_minutes INTEGER CHECK (latitude_minutes >= 0 AND latitude_minutes <= 59),
ADD COLUMN IF NOT EXISTS latitude_seconds DECIMAL(6,3) CHECK (latitude_seconds >= 0 AND latitude_seconds < 60),
ADD COLUMN IF NOT EXISTS latitude_direction TEXT CHECK (latitude_direction IN ('N', 'S')),
ADD COLUMN IF NOT EXISTS longitude_degrees INTEGER CHECK (longitude_degrees >= 0 AND longitude_degrees <= 180),
ADD COLUMN IF NOT EXISTS longitude_minutes INTEGER CHECK (longitude_minutes >= 0 AND longitude_minutes <= 59),
ADD COLUMN IF NOT EXISTS longitude_seconds DECIMAL(6,3) CHECK (longitude_seconds >= 0 AND longitude_seconds < 60),
ADD COLUMN IF NOT EXISTS longitude_direction TEXT CHECK (longitude_direction IN ('E', 'W'));

-- Manter os campos antigos para compatibilidade (opcional)
-- ALTER TABLE problems DROP COLUMN IF EXISTS latitude;
-- ALTER TABLE problems DROP COLUMN IF EXISTS longitude;

-- Adicionar comentários para documentação
COMMENT ON COLUMN problems.latitude_degrees IS 'Graus da latitude (0-90)';
COMMENT ON COLUMN problems.latitude_minutes IS 'Minutos da latitude (0-59)';
COMMENT ON COLUMN problems.latitude_seconds IS 'Segundos da latitude (0-59.999)';
COMMENT ON COLUMN problems.latitude_direction IS 'Direção da latitude (N ou S)';
COMMENT ON COLUMN problems.longitude_degrees IS 'Graus da longitude (0-180)';
COMMENT ON COLUMN problems.longitude_minutes IS 'Minutos da longitude (0-59)';
COMMENT ON COLUMN problems.longitude_seconds IS 'Segundos da longitude (0-59.999)';
COMMENT ON COLUMN problems.longitude_direction IS 'Direção da longitude (E ou W)';

-- Criar índices para melhor performance nas consultas por coordenadas
CREATE INDEX IF NOT EXISTS idx_problems_coordinates ON problems(latitude_degrees, longitude_degrees);

-- Função para converter coordenadas GMS para decimal (opcional)
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

-- Função para converter decimal para GMS (opcional)
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

-- Exemplo de uso das funções:
-- SELECT gms_to_decimal(3, 13, 34.0, 'S') as latitude_decimal;
-- SELECT * FROM decimal_to_gms(-3.226111) as latitude_gms;
