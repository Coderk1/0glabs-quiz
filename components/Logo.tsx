import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        {/* Purple background circle */}
        <div className="w-full h-full bg-purple-600 rounded-lg flex items-center justify-center">
          {/* 0G text in white */}
          <span className="text-white font-bold text-lg tracking-tight">
            0G
          </span>
        </div>
      </div>
    </div>
  )
} 