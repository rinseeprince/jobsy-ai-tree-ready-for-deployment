"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, FileText, User, Search, Bookmark, Settings, HelpCircle, MessageCircle } from "lucide-react"

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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
        <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"
            >
              Jobsy
            </Link>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-8">
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
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
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
          <div className="px-2 space-y-1">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
    </div>
  )
}
