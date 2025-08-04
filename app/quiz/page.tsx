'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import Link from 'next/link'
import Attribution from '@/components/Attribution'

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
}

export default function QuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [userName, setUserName] = useState('')

  // Load user name and questions on mount
  useEffect(() => {
    const name = sessionStorage.getItem('quizUserName')
    if (!name) {
      router.push('/')
      return
    }
    setUserName(name)
    loadQuestions()
  }, [router])

  // Timer effect
  useEffect(() => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - mark as wrong and move to next question
          handleAnswer(null)
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, questions.length])

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/get-questions')
      if (!response.ok) throw new Error('Failed to load questions')
      
      const data = await response.json()
      setQuestions(data.questions)
      setAnswers(new Array(data.questions.length).fill(null))
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading questions:', error)
      alert('Failed to load questions. Please try again.')
      router.push('/')
    }
  }

  const handleAnswer = useCallback(async (answerIndex: number | null) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    
    // Update answers array
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answerIndex
    setAnswers(newAnswers)

    // Wait a moment to show the selection
    await new Promise(resolve => setTimeout(resolve, 500))

    // Move to next question or finish quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(15)
      setIsSubmitting(false)
    } else {
      // Quiz finished - submit results
      await submitResults(newAnswers)
    }
  }, [currentQuestionIndex, questions.length, answers, isSubmitting])

  const submitResults = async (finalAnswers: (number | null)[]) => {
    try {
      const score = finalAnswers.reduce((total: number, answer, index) => {
        if (answer === questions[index]?.correct_answer) return total + 1
        return total
      }, 0)

      const response = await fetch('/api/submit-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          score,
          totalQuestions: questions.length,
          answers: finalAnswers,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit score')

      // Navigate to results page
      router.push(`/results?score=${score}&total=${questions.length || 0}`)
    } catch (error) {
      console.error('Error submitting results:', error)
      alert('Failed to submit results. Please try again.')
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%238B5CF6;stop-opacity:1" /><stop offset="50%" style="stop-color:%23A855F7;stop-opacity:1" /><stop offset="100%" style="stop-color:%23EC4899;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/></svg>')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200 drop-shadow-md">Loading your quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%238B5CF6;stop-opacity:1" /><stop offset="50%" style="stop-color:%23A855F7;stop-opacity:1" /><stop offset="100%" style="stop-color:%23EC4899;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/></svg>')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="text-center relative z-10">
          <p className="text-purple-200 drop-shadow-md mb-4">No questions available</p>
          <Link href="/" className="btn-primary bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{
        backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%238B5CF6;stop-opacity:1" /><stop offset="50%" style="stop-color:%23A855F7;stop-opacity:1" /><stop offset="100%" style="stop-color:%23EC4899;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo size="md" className="mr-3" />
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              0G Quiz
            </h1>
          </div>
          <div className="flex justify-between items-center text-sm text-purple-200 drop-shadow-md">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="font-medium">Player: @{userName}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className={`timer text-white drop-shadow-lg ${timeLeft <= 3 ? 'animate-pulse' : ''}`}>
            {timeLeft}s
          </div>
          <div className="w-full bg-gray-300 bg-opacity-50 rounded-full h-2 mt-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 15) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card bg-white bg-opacity-95 backdrop-blur-sm border border-purple-200 shadow-xl mb-6">
          <h2 className="text-xl font-semibold text-purple-800 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(index)}
                disabled={isSubmitting}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                } ${isSubmitting ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link href="/" className="btn-secondary bg-white bg-opacity-90 backdrop-blur-sm border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors duration-200">
            Exit Quiz
          </Link>
          
          <button
            onClick={() => handleAnswer(selectedAnswer)}
            disabled={selectedAnswer === null || isSubmitting}
            className="btn-primary bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </div>
            ) : (
              currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-purple-200 drop-shadow-md mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-300 bg-opacity-50 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      <Attribution />
    </div>
  )
} 