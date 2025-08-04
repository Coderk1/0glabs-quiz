import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Get 10 random questions from the database
    const questions = await db.getQuestions(10)
    
    // If we don't have enough questions, return what we have
    if (questions.length === 0) {
      return NextResponse.json({
        questions: [],
        message: 'No questions available at the moment. Please try again later.'
      })
    }

    // Shuffle the questions to randomize them
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5)

    return NextResponse.json({
      questions: shuffledQuestions.slice(0, 10),
      total: shuffledQuestions.length
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
} 