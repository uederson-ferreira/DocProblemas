-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('desmatamento', 'seguranca', 'poluicao', 'infraestrutura', 'licenciamento')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critico', 'alto', 'medio', 'baixo')),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'resolvido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Added problem_photos table for image storage
-- Create problem photos table
CREATE TABLE IF NOT EXISTS problem_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 5W2H plans table
CREATE TABLE IF NOT EXISTS w5h2_plans (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_severity ON problems(severity);
CREATE INDEX IF NOT EXISTS idx_problems_type ON problems(type);
CREATE INDEX IF NOT EXISTS idx_problems_user_id ON problems(user_id);
-- Added index for problem_photos
CREATE INDEX IF NOT EXISTS idx_problem_photos_problem_id ON problem_photos(problem_id);
CREATE INDEX IF NOT EXISTS idx_w5h2_plans_problem_id ON w5h2_plans(problem_id);

-- Enable Row Level Security
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
-- Added RLS for problem_photos table
ALTER TABLE problem_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE w5h2_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for problems table
CREATE POLICY "Users can view all problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Users can insert their own problems" ON problems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own problems" ON problems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own problems" ON problems FOR DELETE USING (auth.uid() = user_id);

-- Added policies for problem_photos table
-- Create policies for problem_photos table
CREATE POLICY "Users can view all photos" ON problem_photos FOR SELECT USING (true);
CREATE POLICY "Users can insert photos for problems they own" ON problem_photos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete photos for problems they own" ON problem_photos FOR DELETE USING (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);

-- Create policies for w5h2_plans table
CREATE POLICY "Users can view all plans" ON w5h2_plans FOR SELECT USING (true);
CREATE POLICY "Users can insert plans for problems they own" ON w5h2_plans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update plans for problems they own" ON w5h2_plans FOR UPDATE USING (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete plans for problems they own" ON w5h2_plans FOR DELETE USING (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
