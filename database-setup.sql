-- 0G Quiz Database Setup
-- Run this SQL in your Supabase SQL editor

-- Create questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  answers INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_scores_percentage ON scores(percentage DESC);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX idx_scores_name ON scores(name);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies for questions table
CREATE POLICY "Allow public read access to questions" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Allow API to insert questions" ON questions
    FOR INSERT WITH CHECK (true);

-- Create policies for scores table  
CREATE POLICY "Allow public read access to scores" ON scores
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to scores" ON scores
    FOR INSERT WITH CHECK (true);

-- Create a function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Remove scores older than 30 days
  DELETE FROM scores 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Remove questions older than 7 days
  DELETE FROM questions 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get weekly leaderboard
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
  id UUID,
  name TEXT,
  score INTEGER,
  total_questions INTEGER,
  percentage INTEGER,
  answers INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.score,
    s.total_questions,
    s.percentage,
    s.answers,
    s.created_at,
    ROW_NUMBER() OVER (ORDER BY s.percentage DESC, s.created_at ASC) as rank
  FROM scores s
  WHERE s.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY s.percentage DESC, s.created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Note: Questions will be generated automatically by the AI system
-- No sample questions needed as they will be created from 0G Labs news

-- Create a view for easy leaderboard access
CREATE VIEW weekly_leaderboard AS
SELECT 
  id,
  name,
  score,
  total_questions,
  percentage,
  answers,
  created_at,
  ROW_NUMBER() OVER (ORDER BY percentage DESC, created_at ASC) as rank
FROM scores
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY percentage DESC, created_at ASC; 