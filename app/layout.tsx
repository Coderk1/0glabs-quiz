import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '0G Labs Quiz - Test Your Knowledge',
  description: 'Take the 0G Labs quiz and test your knowledge about the latest developments in zero-knowledge technology.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-primary-50 to-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 