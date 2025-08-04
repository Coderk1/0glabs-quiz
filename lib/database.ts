import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  created_at: string
  source_url?: string
}

export interface Score {
  id: string
  name: string
  score: number
  total_questions: number
  percentage: number
  answers: (number | null)[]
  created_at: string
}

export interface LeaderboardEntry extends Score {
  rank: number
}

// Database operations
export const db = {
  // Questions
  async getQuestions(limit: number = 10): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Shuffle the questions randomly and take the first 'limit' questions
    const shuffledQuestions = (data || []).sort(() => Math.random() - 0.5)
    return shuffledQuestions.slice(0, limit)
  },

  async createQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert([question])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Scores
  async submitScore(score: Omit<Score, 'id' | 'created_at'>): Promise<Score> {
    const { data, error } = await supabase
      .from('scores')
      .insert([score])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    // Get scores from the last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // First, get the highest score for each person in the last 7 days
    const { data: highestScores, error: highestError } = await supabase
      .from('scores')
      .select('*')
      .gte('created_at', weekAgo.toISOString())
      .order('percentage', { ascending: false })
      .order('created_at', { ascending: true })

    if (highestError) throw highestError

    // Group by name and keep only the highest score for each person
    const scoreMap = new Map<string, any>()
    highestScores?.forEach(score => {
      const existing = scoreMap.get(score.name)
      if (!existing || score.percentage > existing.percentage) {
        scoreMap.set(score.name, score)
      }
    })

    // Convert back to array and sort by percentage
    const uniqueScores = Array.from(scoreMap.values())
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, limit)

    // Add rank to each entry
    return uniqueScores.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))
  },

  // Cleanup old data
  async cleanupOldData() {
    // Remove scores older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await supabase
      .from('scores')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())

    // Remove questions older than 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    await supabase
      .from('questions')
      .delete()
      .lt('created_at', weekAgo.toISOString())
  }
} 