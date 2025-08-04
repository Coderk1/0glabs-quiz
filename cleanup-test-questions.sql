-- Clean up test questions from the database
-- Run this in your Supabase SQL Editor

-- Remove the test question we inserted
DELETE FROM questions 
WHERE question LIKE '%Test question for database connection%';

-- Remove any other test questions
DELETE FROM questions 
WHERE question LIKE '%Test%' 
   OR question LIKE '%test%';

-- Remove sample questions from the original setup
DELETE FROM questions 
WHERE source_url = 'https://0glabs.io' 
  AND created_at < NOW() - INTERVAL '1 hour';

-- Show remaining questions
SELECT COUNT(*) as total_questions FROM questions; 