import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions } from '@/lib/question-generator'

export async function POST(request: NextRequest) {
  try {
    // Check for authorization (you might want to add a secret key)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await generateQuestions()

    return NextResponse.json({
      success: true,
      message: 'Successfully generated 20 new questions (20 questions every hour)',
      questionCount: 20
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

// Also allow GET for manual triggering (with proper auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    // Simple secret check (use environment variable in production)
    if (secret !== process.env.QUESTION_GENERATION_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await generateQuestions()

    return NextResponse.json({
      success: true,
      message: 'Successfully generated 20 new questions (20 questions every hour)',
      questionCount: 20
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
} 