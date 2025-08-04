import React from 'react'

export default function Attribution() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a 
        href="https://x.com/coderkkk" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
      >
        <span>DONE BY</span>
        <span className="font-semibold text-primary-600 hover:text-primary-800">CODERK</span>
      </a>
    </div>
  )
} 