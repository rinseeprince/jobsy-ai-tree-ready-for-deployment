"use client"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AuthButton } from "./auth-button"
import { supabase } from "@/lib/supabase-client"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()

  // Check if we're on the homepage
  const isHomePage = pathname === "/"

  useEffect(() => {
    let mounted = true

    // Check auth status immediately and on mount
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (mounted) {
        setIsAuthenticated(!!data.session)
        console.log("Auth check:", !!data.session) // Debug log
      }
    }

    checkAuth()

    // Set up auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        console.log("Auth state changed:", event, !!session) // Debug log
        setIsAuthenticated(!!session)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"
            >
              Jobsy
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={isHomePage ? "#features" : "/#features"}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href={isHomePage ? "#how-it-works" : "/#how-it-works"}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it Works
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/generator" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cover Letter Generator
            </Link>

            {isAuthenticated && (
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                Dashboard
              </Link>
            )}

            <AuthButton />
          </nav>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-2 space-y-2">
            <Link
              href={isHomePage ? "#features" : "/#features"}
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href={isHomePage ? "#how-it-works" : "/#how-it-works"}
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </Link>
            <Link href="/pricing" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/generator" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
              Cover Letter Generator
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="block py-2 text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            <div className="pt-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
