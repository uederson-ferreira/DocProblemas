-- Adicionando tabela para atividades do plano de ação
-- Versão 6: Adiciona tabela de atividades para planos 5W2H mais práticos

-- Criar tabelas se não existirem
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_number SERIAL UNIQUE,
  title TEXT,
  description TEXT NOT NULL,
  recommendations TEXT,
  type TEXT NOT NULL CHECK (type IN ('desmatamento', 'seguranca', 'poluicao', 'infraestrutura', 'licenciamento')),
  severity TEXT NOT NULL CHECK (severity IN ('baixo', 'medio', 'alto', 'critico')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'resolvido')),
  location TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_5w2h (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Nova tabela para atividades específicas do plano de ação
CREATE TABLE IF NOT EXISTS plan_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES problem_5w2h(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  responsible TEXT NOT NULL,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_5w2h ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_activities ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view all problems" ON problems;
DROP POLICY IF EXISTS "Users can insert problems" ON problems;
DROP POLICY IF EXISTS "Users can update problems" ON problems;
DROP POLICY IF EXISTS "Users can delete problems" ON problems;

DROP POLICY IF EXISTS "Users can view all photos" ON problem_photos;
DROP POLICY IF EXISTS "Users can insert photos" ON problem_photos;
DROP POLICY IF EXISTS "Users can update photos" ON problem_photos;
DROP POLICY IF EXISTS "Users can delete photos" ON problem_photos;

DROP POLICY IF EXISTS "Users can view all plans" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can insert plans" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can update plans" ON problem_5w2h;
DROP POLICY IF EXISTS "Users can delete plans" ON problem_5w2h;

DROP POLICY IF EXISTS "Users can view all activities" ON plan_activities;
DROP POLICY IF EXISTS "Users can insert activities" ON plan_activities;
DROP POLICY IF EXISTS "Users can update activities" ON plan_activities;
DROP POLICY IF EXISTS "Users can delete activities" ON plan_activities;

-- Criar políticas
CREATE POLICY "Users can view all problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Users can insert problems" ON problems FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update problems" ON problems FOR UPDATE USING (true);
CREATE POLICY "Users can delete problems" ON problems FOR DELETE USING (true);

CREATE POLICY "Users can view all photos" ON problem_photos FOR SELECT USING (true);
CREATE POLICY "Users can insert photos" ON problem_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update photos" ON problem_photos FOR UPDATE USING (true);
CREATE POLICY "Users can delete photos" ON problem_photos FOR DELETE USING (true);

CREATE POLICY "Users can view all plans" ON problem_5w2h FOR SELECT USING (true);
CREATE POLICY "Users can insert plans" ON problem_5w2h FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update plans" ON problem_5w2h FOR UPDATE USING (true);
CREATE POLICY "Users can delete plans" ON problem_5w2h FOR DELETE USING (true);

CREATE POLICY "Users can view all activities" ON plan_activities FOR SELECT USING (true);
CREATE POLICY "Users can insert activities" ON plan_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update activities" ON plan_activities FOR UPDATE USING (true);
CREATE POLICY "Users can delete activities" ON plan_activities FOR DELETE USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_type ON problems(type);
CREATE INDEX IF NOT EXISTS idx_problems_severity ON problems(severity);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at);
CREATE INDEX IF NOT EXISTS idx_problem_photos_problem_id ON problem_photos(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_5w2h_problem_id ON problem_5w2h(problem_id);
CREATE INDEX IF NOT EXISTS idx_plan_activities_plan_id ON plan_activities(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_activities_status ON plan_activities(status);
CREATE INDEX IF NOT EXISTS idx_plan_activities_due_date ON plan_activities(due_date);
