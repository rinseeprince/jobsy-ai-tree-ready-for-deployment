"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - hardcoded for now to test */}
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
              {/* Tools Section */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/dashboard"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/dashboard"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className={`mr-3 h-5 w-5 ${
                        pathname === "/dashboard" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Home
                  </Link>

                  {/* Cover Letter Generator with Dropdown */}
                  <div>
                    <div className="flex items-center">
                      <Link
                        href="/dashboard/cover-letter-generator"
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md flex-1 ${
                          pathname === "/dashboard/cover-letter-generator" || pathname === "/dashboard/my-cover-letters"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <svg
                          className={`mr-3 h-5 w-5 ${
                            pathname === "/dashboard/cover-letter-generator" ||
                            pathname === "/dashboard/my-cover-letters"
                              ? "text-blue-500"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Cover Letter Generator
                      </Link>
                      <button
                        onClick={() => toggleDropdown("Cover Letter Generator")}
                        className={`p-1 rounded-md transition-colors mr-2 ${
                          pathname === "/dashboard/cover-letter-generator" || pathname === "/dashboard/my-cover-letters"
                            ? "text-blue-700 hover:bg-blue-100"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {openDropdowns["Cover Letter Generator"] ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {openDropdowns["Cover Letter Generator"] && (
                      <div className="ml-6 mt-1">
                        <Link
                          href="/dashboard/my-cover-letters"
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            pathname === "/dashboard/my-cover-letters"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <svg
                            className={`mr-3 h-4 w-4 ${
                              pathname === "/dashboard/my-cover-letters" ? "text-blue-500" : "text-gray-400"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          My Cover Letters
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* CV Builder with Dropdown */}
                  <div>
                    <div className="flex items-center">
                      <Link
                        href="/dashboard/cv-builder"
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md flex-1 ${
                          pathname === "/dashboard/cv-builder" ||
                          pathname.startsWith("/dashboard/cv-builder") ||
                          pathname === "/dashboard/my-cvs"
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <svg
                          className={`mr-3 h-5 w-5 ${
                            pathname === "/dashboard/cv-builder" ||
                            pathname.startsWith("/dashboard/cv-builder") ||
                            pathname === "/dashboard/my-cvs"
                              ? "text-blue-500"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        CV Builder
                      </Link>
                      <button
                        onClick={() => toggleDropdown("CV Builder")}
                        className={`p-1 rounded-md transition-colors mr-2 ${
                          pathname === "/dashboard/cv-builder" ||
                          pathname.startsWith("/dashboard/cv-builder") ||
                          pathname === "/dashboard/my-cvs"
                            ? "text-blue-700 hover:bg-blue-100"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {openDropdowns["CV Builder"] ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {openDropdowns["CV Builder"] && (
                      <div className="ml-6 mt-1">
                        <Link
                          href="/dashboard/my-cvs"
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            pathname === "/dashboard/my-cvs"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <svg
                            className={`mr-3 h-4 w-4 ${
                              pathname === "/dashboard/my-cvs" ? "text-blue-500" : "text-gray-400"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          My CVs
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Jobs Section */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</h3>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/search"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/search"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className={`mr-3 h-5 w-5 ${
                        pathname === "/search" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Search
                  </Link>
                  <Link
                    href="/saved-jobs"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === "/saved-jobs"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg
                      className={`mr-3 h-5 w-5 ${
                        pathname === "/saved-jobs" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Saved Jobs
                  </Link>
                </div>
              </div>
            </nav>

            {/* Bottom Navigation */}
            <div className="px-2 space-y-1 mt-auto pb-4">
              <Link
                href="/settings"
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  pathname === "/settings"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${
                    pathname === "/settings" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Settings
              </Link>
              <Link
                href="/help"
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  pathname === "/help"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 ${
                    pathname === "/help" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"
          >
            Jobsy
          </Link>
          <button className="p-2 text-gray-500 focus:outline-none">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">{children}</div>
    </div>
  )
}
