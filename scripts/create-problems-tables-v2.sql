-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('seguranca', 'ambiental', 'infraestrutura', 'licenciamento')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critico', 'alto', 'medio', 'baixo')),
  location VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'resolvido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create problem photos table
CREATE TABLE IF NOT EXISTS problem_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 5W2H plans table
CREATE TABLE IF NOT EXISTS w5h2_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  what TEXT NOT NULL,
  why TEXT NOT NULL,
  when_plan TEXT NOT NULL,
  where_plan TEXT NOT NULL,
  who TEXT NOT NULL,
  how TEXT NOT NULL,
  how_much TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE w5h2_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for problems
CREATE POLICY "Users can view all problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Users can insert their own problems" ON problems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own problems" ON problems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own problems" ON problems FOR DELETE USING (auth.uid() = user_id);

-- Create policies for problem photos
CREATE POLICY "Users can view all problem photos" ON problem_photos FOR SELECT USING (true);
CREATE POLICY "Users can insert photos for problems they own" ON problem_photos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete photos for problems they own" ON problem_photos FOR DELETE USING (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);

-- Create policies for 5W2H plans
CREATE POLICY "Users can view all 5W2H plans" ON w5h2_plans FOR SELECT USING (true);
CREATE POLICY "Users can insert 5W2H plans for problems they own" ON w5h2_plans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update 5W2H plans for problems they own" ON w5h2_plans FOR UPDATE USING (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete 5W2H plans for problems they own" ON w5h2_plans FOR DELETE USING (
  EXISTS (SELECT 1 FROM problems WHERE id = problem_id AND user_id = auth.uid())
);
