-- Criando nova versão do script que verifica existência antes de criar
-- Sistema de Registro de Problemas para Obras
-- Versão 3 - Script seguro que verifica existência

-- Habilitar RLS se não estiver habilitado
ALTER TABLE IF EXISTS problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS problem_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS problem_5w2h ENABLE ROW LEVEL SECURITY;

-- Criar tabela de problemas se não existir
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('seguranca', 'ambiental', 'infraestrutura', 'licenciamento', 'outros')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critico', 'alto', 'medio', 'baixo')),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'resolvido')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de fotos se não existir
CREATE TABLE IF NOT EXISTS problem_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de planos 5W2H se não existir
CREATE TABLE IF NOT EXISTS problem_5w2h (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  what TEXT,
  why TEXT,
  when_plan TEXT,
  where_plan TEXT,
  who TEXT,
  how TEXT,
  how_much TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view all problems" ON problems;
DROP POLICY IF EXISTS "Users can insert their own problems" ON problems;
DROP POLICY IF EXISTS "Users can update their own problems" ON problems;
DROP POLICY IF EXISTS "Users can delete their own problems" ON problems;

DROP POLICY IF EXISTS "Users can view all problem photos" ON problem_photos;
DROP POLICY IF EXISTS "Users can insert photos for their problems" ON problem_photos;
DROP POLICY IF EXISTS "Users can delete photos for their problems" ON problem_photos;

DROP POLICY IF EXISTS "Users can view all 5w2h plans" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can insert 5w2h for their problems" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can update 5w2h for their problems" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can delete 5w2h for their problems" ON problem_5w2h;

-- Criar políticas RLS para problems
CREATE POLICY "Users can view all problems" ON problems
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own problems" ON problems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problems" ON problems
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own problems" ON problems
  FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para problem_photos
CREATE POLICY "Users can view all problem photos" ON problem_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can insert photos for their problems" ON problem_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM problems 
      WHERE problems.id = problem_photos.problem_id 
      AND problems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos for their problems" ON problem_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM problems 
      WHERE problems.id = problem_photos.problem_id 
      AND problems.user_id = auth.uid()
    )
  );

-- Criar políticas RLS para problem_5w2h
CREATE POLICY "Users can view all 5w2h plans" ON problem_5w2h
  FOR SELECT USING (true);

CREATE POLICY "Users can insert 5w2h for their problems" ON problem_5w2h
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM problems 
      WHERE problems.id = problem_5w2h.problem_id 
      AND problems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update 5w2h for their problems" ON problem_5w2h
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM problems 
      WHERE problems.id = problem_5w2h.problem_id 
      AND problems.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete 5w2h for their problems" ON problem_5w2h
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM problems 
      WHERE problems.id = problem_5w2h.problem_id 
      AND problems.user_id = auth.uid()
    )
  );

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_problems_user_id ON problems(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_type ON problems(type);
CREATE INDEX IF NOT EXISTS idx_problems_severity ON problems(severity);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at);

CREATE INDEX IF NOT EXISTS idx_problem_photos_problem_id ON problem_photos(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_5w2h_problem_id ON problem_5w2h(problem_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover triggers existentes se existirem
DROP TRIGGER IF EXISTS update_problems_updated_at ON problems;
DROP TRIGGER IF EXISTS update_problem_5w2h_updated_at ON problem_5w2h;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problem_5w2h_updated_at
    BEFORE UPDATE ON problem_5w2h
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
