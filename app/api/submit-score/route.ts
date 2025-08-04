import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, score, totalQuestions, answers } = body

    // Validate input
    if (!name || typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    // Calculate percentage
    const percentage = Math.round((score / totalQuestions) * 100)

    // Submit score to database
    const submittedScore = await db.submitScore({
      name: name.trim(),
      score,
      total_questions: totalQuestions,
      percentage,
      answers: answers || []
    })

    return NextResponse.json({
      success: true,
      score: submittedScore,
      message: 'Score submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting score:', error)
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    )
  }
} 