'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import Attribution from '@/components/Attribution'

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  total_questions: number
  percentage: number
  created_at: string
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 7

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (!response.ok) throw new Error('Failed to load leaderboard')
      
      const data = await response.json()
      setLeaderboard(data.leaderboard)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      setError('Failed to load leaderboard. Please try again.')
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (rank === 2) return 'text-gray-600 bg-gray-50 border-gray-200'
    if (rank === 3) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-gray-700 bg-white border-gray-100'
  }

  // Calculate pagination
  const totalPages = Math.ceil(leaderboard.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = leaderboard.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadLeaderboard}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen px-4 py-8 relative"
      style={{
        backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%238B5CF6;stop-opacity:1" /><stop offset="50%" style="stop-color:%23A855F7;stop-opacity:1" /><stop offset="100%" style="stop-color:%23EC4899;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo size="lg" className="mr-3" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Weekly Leaderboard
            </h1>
          </div>
          <p className="text-purple-200 drop-shadow-md">
            Top performers this week - Click usernames to visit their X profiles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center bg-white bg-opacity-90 backdrop-blur-sm border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {leaderboard.length}
            </div>
            <div className="text-sm text-purple-700">Total X Users</div>
          </div>
          <div className="card text-center bg-white bg-opacity-90 backdrop-blur-sm border border-purple-200">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {totalPages}
            </div>
            <div className="text-sm text-purple-700">Pages</div>
          </div>
          <div className="card text-center bg-white bg-opacity-90 backdrop-blur-sm border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {leaderboard.length > 0 ? leaderboard[0].score : 0}/10
            </div>
            <div className="text-sm text-purple-700">Highest Score</div>
          </div>
          <div className="card text-center bg-white bg-opacity-90 backdrop-blur-sm border border-purple-200">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {leaderboard.length > 0 ? Math.round(leaderboard.reduce((acc, entry) => acc + entry.percentage, 0) / leaderboard.length) : 0}%
            </div>
            <div className="text-sm text-purple-700">Average Score</div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="card bg-white bg-opacity-95 backdrop-blur-sm border border-purple-200 shadow-xl">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">No Scores Yet</h3>
              <p className="text-purple-600 mb-4">Be the first to take the quiz and claim the top spot!</p>
              <Link href="/" className="btn-primary">
                Take the Quiz
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-200">
                    <th className="text-left py-3 px-4 font-semibold text-purple-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-purple-700">X Username</th>
                    <th className="text-center py-3 px-4 font-semibold text-purple-700">Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-purple-700">Percentage</th>
                    <th className="text-center py-3 px-4 font-semibold text-purple-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((entry, index) => (
                    <tr 
                      key={entry.id} 
                      className={`border-b border-purple-100 hover:bg-purple-50 transition-colors ${getRankColor(entry.rank)}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <span className="text-lg font-bold mr-2">
                            {getRankIcon(entry.rank)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-purple-800">
                          <a 
                            href={`https://x.com/${entry.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
                          >
                            @{entry.name}
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-purple-800">
                          {entry.score}/{entry.total_questions}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-pink-600">
                          {entry.percentage}%
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-sm text-purple-600">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-purple-600 bg-white bg-opacity-90 backdrop-blur-sm border border-purple-300 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-600 bg-white bg-opacity-90 backdrop-blur-sm border border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-purple-600 bg-white bg-opacity-90 backdrop-blur-sm border border-purple-300 rounded-md hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <Link href="/" className="btn-primary bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg">
            Take the Quiz
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-purple-200 drop-shadow-md">
          <p>Leaderboard resets every Monday at 00:00 UTC</p>
          <p className="mt-1">Questions are updated regularly based on latest 0G Labs news</p>
          <p className="mt-1">Showing {usersPerPage} users per page</p>
        </div>
      </div>
      <Attribution />
    </div>
  )
} 