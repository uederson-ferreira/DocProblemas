-- Atualizar constraint de tipos de problema
ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_type_check;

-- Adicionar nova constraint com os novos tipos
ALTER TABLE problems ADD CONSTRAINT problems_type_check 
CHECK (type IN ('meio_ambiente', 'saude', 'seguranca', 'outros'));

-- Atualizar registros existentes para os novos tipos
UPDATE problems SET type = 'meio_ambiente' WHERE type IN ('desmatamento', 'poluicao');
UPDATE problems SET type = 'seguranca' WHERE type = 'seguranca';
UPDATE problems SET type = 'outros' WHERE type IN ('infraestrutura', 'licenciamento');
