'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import Attribution from '@/components/Attribution'

export default function LandingPage() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartQuiz = async () => {
    if (!name.trim()) {
      alert('Please enter your name to continue')
      return
    }

    setIsLoading(true)
    
    // Store name in sessionStorage for the quiz
    sessionStorage.setItem('quizUserName', name.trim())
    
    // Navigate to quiz
    router.push('/quiz')
  }

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
              0G Quiz
            </h1>
          </div>
          <p className="text-purple-200 drop-shadow-md text-lg">
            Test your knowledge about the latest developments in decentralized AI technology
          </p>
        </div>

        {/* Main Card */}
        <div className="card bg-white bg-opacity-95 backdrop-blur-sm border border-purple-200 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-purple-800 mb-2">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-purple-600">
              Enter your X username below to start the quiz
            </p>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-purple-700 mb-2">
              Your X (Twitter) Username
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your X username (without @)"
              className="input-field border-purple-300 focus:border-purple-500 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
            />
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            disabled={isLoading || !name.trim()}
            className="btn-primary bg-purple-600 hover:bg-purple-700 text-white w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              'Take the Test'
            )}
          </button>

          {/* Leaderboard Link */}
          <div className="text-center">
            <Link href="/leaderboard" className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200">
              View Leaderboard →
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="flex items-center text-sm text-purple-200 drop-shadow-md">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
            10 challenging questions about 0G
          </div>
          <div className="flex items-center text-sm text-purple-200 drop-shadow-md">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
            15 seconds per question timer
          </div>
          <div className="flex items-center text-sm text-purple-200 drop-shadow-md">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
            Weekly leaderboard updates
          </div>
        </div>
      </div>
      <Attribution />
    </div>
  )
} 