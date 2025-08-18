-- Script para verificar colunas existentes na tabela problems
-- Execute este script primeiro para ver o que já existe

-- 1. Verificar estrutura atual da tabela problems
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'problems' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints existentes
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
AND constraint_name LIKE '%problems%';

-- 3. Verificar se as colunas de coordenadas já existem
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'problems' 
AND table_schema = 'public'
AND column_name IN ('latitude_gms', 'longitude_gms', 'latitude', 'longitude');

-- 4. Verificar se as funções já existem
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%gms%';
