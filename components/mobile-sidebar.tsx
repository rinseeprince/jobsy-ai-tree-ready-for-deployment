"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, FileText, User, Search, Bookmark, Settings, HelpCircle, MessageCircle, Menu, X } from "lucide-react"

const navigation = [
  {
    name: "Tools",
    items: [
      { name: "Home", href: "/dashboard", icon: Home },
      { name: "Cover Letter Generator", href: "/generator", icon: FileText },
      { name: "CV Builder", href: "/cv-builder", icon: User },
    ],
  },
  {
    name: "Jobs",
    items: [
      { name: "Search", href: "/search", icon: Search },
      { name: "Saved Jobs", href: "/saved-jobs", icon: Bookmark },
    ],
  },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Support", href: "/support", icon: MessageCircle },
]

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"
          >
            Jobsy
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"
              >
                Jobsy
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-8 overflow-y-auto">
              {navigation.map((section) => (
                <div key={section.name}>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.name}</h3>
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href
                      const IconComponent = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                          )}
                        >
                          <IconComponent
                            className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-blue-500" : "text-gray-400")}
                          />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="px-2 py-4 space-y-1 border-t border-gray-200">
              {bottomNavigation.map((item) => {
                const isActive = pathname === item.href
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <IconComponent
                      className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-blue-500" : "text-gray-400")}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
