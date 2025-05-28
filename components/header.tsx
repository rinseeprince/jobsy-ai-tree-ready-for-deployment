"use client"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on the homepage
  const isHomePage = pathname === "/"

  // Create links that either scroll or navigate+scroll
  const featuresLink = isHomePage ? "#features" : "/#features"
  const howItWorksLink = isHomePage ? "#how-it-works" : "/#how-it-works"

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
            <Link href={featuresLink} className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href={howItWorksLink} className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/generator" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Cover Letter Generator
            </Link>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              Login
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
              Get Started
            </Button>
          </nav>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-2 space-y-2">
            <Link href={featuresLink} className="block py-2 text-gray-600">
              Features
            </Link>
            <Link href={howItWorksLink} className="block py-2 text-gray-600">
              How it Works
            </Link>
            <Link href="/pricing" className="block py-2 text-gray-600">
              Pricing
            </Link>
            <Link href="/generator" className="block py-2 text-gray-600 font-medium">
              Cover Letter Generator
            </Link>
            <div className="pt-2 space-y-2">
              <Button variant="outline" className="w-full">
                Login
              </Button>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
