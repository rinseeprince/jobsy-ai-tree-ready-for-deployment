"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  User,
  Search,
  Bookmark,
  Settings,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface SubNavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  hasDropdown?: boolean
  subItems?: SubNavigationItem[]
}

interface NavigationSection {
  name: string
  items: NavigationItem[]
}

const navigation: NavigationSection[] = [
  {
    name: "Tools",
    items: [
      { name: "Home", href: "/dashboard", icon: Home },
      {
        name: "Cover Letter Generator",
        href: "/dashboard/cover-letter-generator",
        icon: FileText,
        hasDropdown: true,
        subItems: [{ name: "My Cover Letters", href: "/dashboard/my-cover-letters", icon: FileText }],
      },
      {
        name: "CV Builder",
        href: "/dashboard/cv-builder",
        icon: User,
        hasDropdown: true,
        subItems: [{ name: "My CVs", href: "/dashboard/my-cvs", icon: FileText }],
      },
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

const bottomNavigation: NavigationItem[] = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Support", href: "/support", icon: MessageCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    "Cover Letter Generator": false,
    "CV Builder": false,
  })

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }))
  }

  const isItemActive = (item: NavigationItem) => {
    if (pathname === item.href) return true
    if (item.subItems) {
      return item.subItems.some((subItem: SubNavigationItem) => pathname === subItem.href)
    }
    return false
  }

  const isSubItemActive = (subItem: SubNavigationItem) => {
    return pathname === subItem.href
  }

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
                    const isActive = isItemActive(item)
                    const IconComponent = item.icon
                    const isDropdownOpen = openDropdowns[item.name]

                    return (
                      <div key={item.name}>
                        {/* Main item */}
                        <div className="flex items-center">
                          <Link
                            href={item.href}
                            className={cn(
                              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1",
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
                          {/* Dropdown toggle button */}
                          {item.hasDropdown && (
                            <button
                              onClick={() => toggleDropdown(item.name)}
                              className={cn(
                                "p-1 rounded-md transition-colors mr-2",
                                isActive
                                  ? "text-blue-700 hover:bg-blue-100"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                              )}
                            >
                              {isDropdownOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Sub-items */}
                        {item.hasDropdown && isDropdownOpen && item.subItems && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.subItems.map((subItem: SubNavigationItem) => {
                              const isSubActive = isSubItemActive(subItem)
                              const SubIconComponent = subItem.icon
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isSubActive
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                  )}
                                >
                                  <SubIconComponent
                                    className={cn(
                                      "mr-3 h-4 w-4 flex-shrink-0",
                                      isSubActive ? "text-blue-500" : "text-gray-400",
                                    )}
                                  />
                                  {subItem.name}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
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
