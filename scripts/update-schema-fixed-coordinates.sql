-- Script CORRIGIDO para coordenadas simples (sem a view problemática)
-- Formato: "02 30 50 S" (Graus Minutos Segundos Direção)

-- 1. Verificar se as colunas já existem antes de criar
DO $$
BEGIN
  -- Adicionar latitude_gms apenas se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'problems' 
    AND table_schema = 'public' 
    AND column_name = 'latitude_gms'
  ) THEN
    ALTER TABLE public.problems ADD COLUMN latitude_gms TEXT;
    RAISE NOTICE 'Coluna latitude_gms criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna latitude_gms já existe, pulando...';
  END IF;

  -- Adicionar longitude_gms apenas se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'problems' 
    AND table_schema = 'public' 
    AND column_name = 'longitude_gms'
  ) THEN
    ALTER TABLE public.problems ADD COLUMN longitude_gms TEXT;
    RAISE NOTICE 'Coluna longitude_gms criada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna longitude_gms já existe, pulando...';
  END IF;
END $$;

-- 2. Atualizar a constraint do campo type para suportar múltiplos valores
-- Primeiro, vamos alterar o tipo para TEXT para permitir múltiplos tipos
ALTER TABLE public.problems 
ALTER COLUMN type TYPE TEXT;

-- 3. Remover a constraint antiga do type (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'problems' 
    AND table_schema = 'public' 
    AND constraint_name = 'problems_type_check'
  ) THEN
    ALTER TABLE public.problems DROP CONSTRAINT problems_type_check;
    RAISE NOTICE 'Constraint problems_type_check removida';
  ELSE
    RAISE NOTICE 'Constraint problems_type_check não existe, pulando...';
  END IF;
END $$;

-- 4. Adicionar nova constraint que permite múltiplos tipos
ALTER TABLE public.problems 
ADD CONSTRAINT problems_type_check 
CHECK (type ~ '^(meio_ambiente|saude|seguranca|outros)(,(meio_ambiente|saude|seguranca|outros))*$');

-- 5. Adicionar comentários para documentação
COMMENT ON COLUMN public.problems.latitude_gms IS 'Latitude no formato simples: "02 30 50 S"';
COMMENT ON COLUMN public.problems.longitude_gms IS 'Longitude no formato simples: "47 44 39 W"';
COMMENT ON COLUMN public.problems.type IS 'Tipos do problema (separados por vírgula: meio_ambiente,saude,seguranca,outros)';

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_problems_coordinates_gms ON public.problems(latitude_gms, longitude_gms);
CREATE INDEX IF NOT EXISTS idx_problems_type ON public.problems USING gin(string_to_array(type, ','));

-- 7. Função para validar formato simples de coordenadas
CREATE OR REPLACE FUNCTION validate_simple_coordinate(coord TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  -- Valida formato: "02 30 50 S" ou "47 44 39 W"
  RETURN coord ~ '^\d{1,3} \d{1,2} \d{1,2}(\.\d{1,3})? [NS]$' OR
         coord ~ '^\d{1,3} \d{1,2} \d{1,2}(\.\d{1,3})? [EW]$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Função para converter coordenadas simples para decimal
CREATE OR REPLACE FUNCTION simple_gms_to_decimal(gms_coord TEXT) 
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
  IF gms_coord IS NULL OR gms_coord = '' THEN
    RETURN NULL;
  END IF;
  
  -- Extrair partes da coordenada: "02 30 50 S"
  parts := string_to_array(gms_coord, ' ');
  
  -- Verificar se temos 4 partes
  IF array_length(parts, 1) != 4 THEN
    RETURN NULL;
  END IF;
  
  -- Graus
  degrees := CAST(parts[1] AS INTEGER);
  
  -- Minutos
  minutes := CAST(parts[2] AS INTEGER);
  
  -- Segundos
  seconds := CAST(parts[3] AS DECIMAL(6,3));
  
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

-- 9. Função para converter decimal para coordenadas simples
CREATE OR REPLACE FUNCTION decimal_to_simple_gms(
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
  IF decimal_coord IS NULL THEN
    RETURN NULL;
  END IF;
  
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
  
  -- Formatar no formato simples
  result := degrees || ' ' || 
            minutes || ' ' || 
            ROUND(seconds, 3) || ' ' || 
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

-- 11. Criar view básica (sem funções complexas)
CREATE OR REPLACE VIEW problems_basic_coordinates AS
SELECT 
  p.*,
  p.latitude_gms,
  p.longitude_gms
FROM public.problems p;

-- 12. Mensagem de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Script executado com sucesso!';
  RAISE NOTICE 'Verifique se as colunas latitude_gms e longitude_gms foram criadas';
  RAISE NOTICE 'Execute: SELECT * FROM problems_basic_coordinates LIMIT 1;';
  RAISE NOTICE 'Teste a função: SELECT simple_gms_to_decimal(''02 30 50 S'');';
END $$;
