import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions } from '@/lib/question-generator'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default_cron_secret'
    
    // Check if it's a Vercel cron job or has proper authorization
    const isVercelCron = request.headers.get('user-agent')?.includes('Vercel')
    const hasValidAuth = authHeader === `Bearer ${cronSecret}`
    
    if (!isVercelCron && !hasValidAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting automatic question generation...')
    
    await generateQuestions()
    
    console.log(`✅ Successfully generated 150 questions automatically`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Generated 150 questions (150 questions every 2 minutes)',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error in automatic question generation:', error)
    return NextResponse.json({ 
      error: 'Failed to generate questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 