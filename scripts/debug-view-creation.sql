-- Script para debugar o erro na criação da view
-- Execute este script para identificar o problema

-- 1. Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('simple_gms_to_decimal', 'validate_simple_coordinate', 'validate_problem_types');

-- 2. Verificar se as colunas existem
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'problems' 
AND table_schema = 'public'
AND column_name IN ('latitude_gms', 'longitude_gms');

-- 3. Testar a função simple_gms_to_decimal diretamente
SELECT simple_gms_to_decimal('02 30 50 S') as test_lat;

-- 4. Verificar se há erros de sintaxe na função
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'simple_gms_to_decimal';

-- 5. Tentar criar a view sem a função para isolar o problema
CREATE OR REPLACE VIEW problems_basic AS
SELECT 
  p.*,
  p.latitude_gms,
  p.longitude_gms
FROM public.problems p;

-- 6. Se a view básica funcionar, tentar criar a view completa
CREATE OR REPLACE VIEW problems_with_simple_coordinates AS
SELECT 
  p.*,
  p.latitude_gms,
  p.longitude_gms,
  CASE 
    WHEN p.latitude_gms IS NOT NULL AND p.latitude_gms != '' THEN 
      simple_gms_to_decimal(p.latitude_gms)
    ELSE NULL 
  END as latitude_decimal,
  CASE 
    WHEN p.longitude_gms IS NOT NULL AND p.longitude_gms != '' THEN 
      simple_gms_to_decimal(p.longitude_gms)
    ELSE NULL 
  END as longitude_decimal
FROM public.problems p;
