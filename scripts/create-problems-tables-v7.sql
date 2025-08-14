-- Script v7: Modificação para permitir múltiplos planos 5W2H por problema
-- Adiciona campos resolved e observations à tabela problem_5w2h

-- Criar tabela de problemas se não existir
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_number SERIAL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendations TEXT,
  type TEXT NOT NULL CHECK (type IN ('desmatamento', 'seguranca', 'poluicao', 'infraestrutura', 'licenciamento')),
  severity TEXT NOT NULL CHECK (severity IN ('baixo', 'medio', 'alto', 'critico')),
  location TEXT NOT NULL,
  latitude TEXT,
  longitude TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'resolvido')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de fotos dos problemas se não existir
CREATE TABLE IF NOT EXISTS problem_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recriar tabela problem_5w2h com novos campos
DROP TABLE IF EXISTS problem_5w2h;

CREATE TABLE problem_5w2h (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  what TEXT NOT NULL,
  why TEXT NOT NULL,
  when_field TEXT NOT NULL,
  where_field TEXT NOT NULL,
  who_field TEXT NOT NULL,
  how TEXT NOT NULL,
  how_much TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  observations TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_5w2h ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para problems
DROP POLICY IF EXISTS "Users can view all problems" ON problems;
DROP POLICY IF EXISTS "Users can insert their own problems" ON problems;
DROP POLICY IF EXISTS "Users can update their own problems" ON problems;
DROP POLICY IF EXISTS "Users can delete their own problems" ON problems;

CREATE POLICY "Users can view all problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Users can insert their own problems" ON problems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own problems" ON problems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own problems" ON problems FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para problem_photos
DROP POLICY IF EXISTS "Users can view all problem photos" ON problem_photos;
DROP POLICY IF EXISTS "Users can insert problem photos" ON problem_photos;
DROP POLICY IF EXISTS "Users can delete problem photos" ON problem_photos;

CREATE POLICY "Users can view all problem photos" ON problem_photos FOR SELECT USING (true);
CREATE POLICY "Users can insert problem photos" ON problem_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete problem photos" ON problem_photos FOR DELETE USING (true);

-- Políticas de segurança para problem_5w2h
DROP POLICY IF EXISTS "Users can view all 5w2h plans" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can insert their own 5w2h plans" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can update their own 5w2h plans" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can delete their own 5w2h plans" ON problem_5w2h;

CREATE POLICY "Users can view all 5w2h plans" ON problem_5w2h FOR SELECT USING (true);
CREATE POLICY "Users can insert their own 5w2h plans" ON problem_5w2h FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own 5w2h plans" ON problem_5w2h FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own 5w2h plans" ON problem_5w2h FOR DELETE USING (auth.uid() = user_id);

-- Índices para melhor performance
DROP INDEX IF EXISTS idx_problems_user_id;
DROP INDEX IF EXISTS idx_problems_status;
DROP INDEX IF EXISTS idx_problems_created_at;
DROP INDEX IF EXISTS idx_problem_photos_problem_id;
DROP INDEX IF EXISTS idx_problem_5w2h_problem_id;
DROP INDEX IF EXISTS idx_problem_5w2h_resolved;

CREATE INDEX idx_problems_user_id ON problems(user_id);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_created_at ON problems(created_at DESC);
CREATE INDEX idx_problem_photos_problem_id ON problem_photos(problem_id);
CREATE INDEX idx_problem_5w2h_problem_id ON problem_5w2h(problem_id);
CREATE INDEX idx_problem_5w2h_resolved ON problem_5w2h(resolved);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_problems_updated_at ON problems;
DROP TRIGGER IF EXISTS update_problem_5w2h_updated_at ON problem_5w2h;

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problem_5w2h_updated_at BEFORE UPDATE ON problem_5w2h FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
