-- Add resolved and observations fields to w5h2_plans table
ALTER TABLE w5h2_plans 
ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS observations TEXT;

-- Create index for better performance on resolved field
CREATE INDEX IF NOT EXISTS idx_w5h2_plans_resolved ON w5h2_plans(resolved);

-- Update existing records to have resolved = false by default
UPDATE w5h2_plans SET resolved = FALSE WHERE resolved IS NULL;
