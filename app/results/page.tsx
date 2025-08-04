'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import Attribution from '@/components/Attribution'

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [userName, setUserName] = useState('')
  
  const score = parseInt(searchParams.get('score') || '0')
  const total = parseInt(searchParams.get('total') || '10')
  const percentage = Math.round((score / total) * 100)

  useEffect(() => {
    const name = sessionStorage.getItem('quizUserName')
    if (name) setUserName(name)
  }, [])

  const getPerformanceMessage = () => {
    if (percentage >= 90) {
      return {
        message: "🎉 Outstanding! You're a 0G expert!",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    } else if (percentage >= 80) {
      return {
        message: "🌟 Excellent! You know your stuff!",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    } else if (percentage >= 70) {
      return {
        message: "👍 Good job! You have solid knowledge!",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      }
    } else if (percentage >= 60) {
      return {
        message: "📚 Not bad! Keep learning and improving!",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      }
    } else if (percentage >= 50) {
      return {
        message: "📖 You're on the right track! Study more!",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      }
    } else {
      return {
        message: "💪 Don't give up! Keep learning about 0G!",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      }
    }
  }

  const performance = getPerformanceMessage()

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%238B5CF6;stop-opacity:1" /><stop offset="50%" style="stop-color:%23A855F7;stop-opacity:1" /><stop offset="100%" style="stop-color:%23EC4899;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo size="lg" className="mr-3" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Quiz Complete!
            </h1>
          </div>
          <p className="text-purple-200 drop-shadow-md">
            @{userName}, here's how you performed
          </p>
        </div>

        {/* Results Card */}
        <div className="card bg-white bg-opacity-95 backdrop-blur-sm border border-purple-200 shadow-xl mb-6">
          {/* Score Display */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-purple-600">
                {score}/{total}
              </span>
            </div>
            <div className="text-4xl font-bold text-purple-800 mb-2">
              {percentage}%
            </div>
            <div className="text-sm text-purple-600">
              {score} out of {total} questions correct
            </div>
          </div>

          {/* Performance Message */}
          <div className={`p-4 rounded-lg border ${performance.bgColor} ${performance.borderColor} mb-6`}>
            <p className={`text-center font-semibold ${performance.color}`}>
              {performance.message}
            </p>
          </div>

          {/* Grade Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-purple-600">Correct Answers:</span>
              <span className="font-semibold text-green-600">{score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-600">Incorrect Answers:</span>
              <span className="font-semibold text-red-600">{total - score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-600">Accuracy:</span>
              <span className="font-semibold text-purple-600">{percentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-purple-600 mb-2">
              <span>Your Score</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/leaderboard" className="btn-primary bg-purple-600 hover:bg-purple-700 text-white w-full block text-center transition-colors duration-200 shadow-lg">
            View Leaderboard
          </Link>
          
          <Link href="/" className="btn-secondary bg-white bg-opacity-90 backdrop-blur-sm border border-purple-300 text-purple-600 hover:bg-purple-50 w-full block text-center transition-colors duration-200">
            Take Another Quiz
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-purple-200 drop-shadow-md">
          <p>Questions are updated regularly based on the latest 0G Labs news</p>
          <p className="mt-1">Come back next week for fresh challenges!</p>
        </div>
      </div>
      <Attribution />
    </div>
  )
} 