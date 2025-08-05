import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobsyAI - AI-Powered Job Application Assistant',
  description: 'Create professional CVs, cover letters, and optimize your job applications with AI assistance.',
  keywords: 'CV builder, cover letter generator, job application, AI assistant, resume optimization',
  authors: [{ name: 'JobsyAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'JobsyAI - AI-Powered Job Application Assistant',
    description: 'Create professional CVs, cover letters, and optimize your job applications with AI assistance.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobsyAI - AI-Powered Job Application Assistant',
    description: 'Create professional CVs, cover letters, and optimize your job applications with AI assistance.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}