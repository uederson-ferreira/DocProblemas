-- Script APENAS para criar o trigger (colunas já existem)
-- Este script pode ser executado múltiplas vezes sem erro

-- 1. Função para converter GMS para decimal (se não existir)
CREATE OR REPLACE FUNCTION gms_to_decimal_safe(gms_coord TEXT) 
RETURNS DECIMAL(10,6) AS $$
DECLARE
  parts TEXT[];
  degrees INTEGER;
  minutes INTEGER;
  seconds DECIMAL(6,3);
  direction TEXT;
  result DECIMAL(10,6);
BEGIN
  -- Verificar se a coordenada é válida
  IF gms_coord IS NULL OR gms_coord = '' OR gms_coord = ' ' THEN
    RETURN NULL;
  END IF;
  
  -- Extrair partes da coordenada: "02 30 50 S"
  parts := string_to_array(trim(gms_coord), ' ');
  
  -- Verificar se temos 4 partes
  IF array_length(parts, 1) != 4 THEN
    RETURN NULL;
  END IF;
  
  -- Graus
  BEGIN
    degrees := CAST(parts[1] AS INTEGER);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  
  -- Minutos
  BEGIN
    minutes := CAST(parts[2] AS INTEGER);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  
  -- Segundos
  BEGIN
    seconds := CAST(parts[3] AS DECIMAL(6,3));
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  
  -- Direção
  direction := parts[4];
  
  -- Validar direção
  IF direction NOT IN ('N', 'S', 'E', 'W') THEN
    RETURN NULL;
  END IF;
  
  -- Calcular decimal
  result := degrees + minutes/60.0 + seconds/3600.0;
  
  -- Aplicar direção
  IF direction IN ('S', 'W') THEN
    result := -result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Função para atualizar coordenadas decimais (se não existir)
CREATE OR REPLACE FUNCTION update_coordinates_decimal()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar latitude decimal
  NEW.latitude_decimal := gms_to_decimal_safe(NEW.latitude_gms);
  
  -- Atualizar longitude decimal
  NEW.longitude_decimal := gms_to_decimal_safe(NEW.longitude_gms);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para INSERT e UPDATE (DROP IF EXISTS para evitar erro)
DROP TRIGGER IF EXISTS trigger_update_coordinates_decimal ON public.problems;

CREATE TRIGGER trigger_update_coordinates_decimal
  BEFORE INSERT OR UPDATE ON public.problems
  FOR EACH ROW
  EXECUTE FUNCTION update_coordinates_decimal();

-- 4. Atualizar registros existentes (se houver)
UPDATE public.problems 
SET 
  latitude_decimal = gms_to_decimal_safe(latitude_gms),
  longitude_decimal = gms_to_decimal_safe(longitude_gms)
WHERE (latitude_gms IS NOT NULL OR longitude_gms IS NOT NULL)
  AND (latitude_decimal IS NULL OR longitude_decimal IS NULL);

-- 5. Criar índices para as colunas decimais (se não existirem)
CREATE INDEX IF NOT EXISTS idx_problems_latitude_decimal ON public.problems(latitude_decimal);
CREATE INDEX IF NOT EXISTS idx_problems_longitude_decimal ON public.problems(longitude_decimal);
CREATE INDEX IF NOT EXISTS idx_problems_coordinates_decimal ON public.problems(latitude_decimal, longitude_decimal);

-- 6. Função para calcular distância entre dois pontos (exemplo de uso)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL(10,6), 
  lon1 DECIMAL(10,6), 
  lat2 DECIMAL(10,6), 
  lon2 DECIMAL(10,6)
) RETURNS DECIMAL(10,2) AS $$
BEGIN
  -- Fórmula de Haversine para calcular distância em km
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lon2) - radians(lon1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Mensagem de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Trigger criado com sucesso!';
  RAISE NOTICE 'As coordenadas decimais serão calculadas automaticamente';
  RAISE NOTICE 'Teste: INSERT INTO problems (title, description, type, severity, location, latitude_gms, longitude_gms) VALUES (''Teste'', ''Descrição'', ''meio_ambiente'', ''medio'', ''Local'', ''02 30 50 S'', ''47 44 39 W'');';
END $$;
