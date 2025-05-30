"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  User,
  Plus,
  Crown,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap,
  ArrowLeft,
} from "lucide-react"

export default function DashboardPreviewPage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  // Mock user data - in real app this would come from your database
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    plan: "Pro",
    applicationsThisMonth: 12,
    totalApplications: 47,
    interviewRate: 24,
    planLimit: "unlimited",
  }

  const recentApplications = [
    {
      id: 1,
      jobTitle: "Senior Software Engineer",
      company: "TechCorp",
      appliedDate: "2024-01-15",
      status: "interview",
      interviewDate: "2024-01-22",
      coverLetterGenerated: true,
      cvOptimized: true,
    },
    {
      id: 2,
      jobTitle: "Product Manager",
      company: "StartupXYZ",
      appliedDate: "2024-01-12",
      status: "applied",
      coverLetterGenerated: true,
      cvOptimized: true,
    },
    {
      id: 3,
      jobTitle: "UX Designer",
      company: "DesignStudio",
      appliedDate: "2024-01-10",
      status: "rejected",
      coverLetterGenerated: true,
      cvOptimized: false,
    },
    {
      id: 4,
      jobTitle: "Frontend Developer",
      company: "WebAgency",
      appliedDate: "2024-01-08",
      status: "applied",
      coverLetterGenerated: true,
      cvOptimized: true,
    },
    {
      id: 5,
      jobTitle: "Data Scientist",
      company: "DataCorp",
      appliedDate: "2024-01-05",
      status: "interview",
      interviewDate: "2024-01-18",
      coverLetterGenerated: true,
      cvOptimized: true,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interview":
        return "bg-blue-100 text-blue-800"
      case "applied":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "offer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "interview":
        return <Calendar className="w-4 h-4" />
      case "applied":
        return <Clock className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "offer":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header for Preview */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Dashboard Preview
              </h1>
            </div>
            <div className="text-sm text-gray-500">Preview Mode - No Authentication Required</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userData.name}!</h1>
              <p className="text-gray-600 mt-2">Track your applications and accelerate your job search</p>
            </div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              onClick={() => (window.location.href = "/generator")}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{userData.applicationsThisMonth}</p>
                  <p className="text-sm text-green-600 mt-1">+3 from last month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{userData.totalApplications}</p>
                  <p className="text-sm text-gray-500 mt-1">All time</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Target className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interview Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{userData.interviewRate}%</p>
                  <p className="text-sm text-green-600 mt-1">Above average</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Plan</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className="text-xl font-bold text-gray-900">{userData.plan}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Unlimited applications</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "applications", label: "Applications", icon: FileText },
                { id: "account", label: "Account", icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => (window.location.href = "/generator")}
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create Application</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Download className="w-6 h-6" />
                    <span>Export Applications</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <BarChart3 className="w-6 h-6" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">{app.company.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{app.jobTitle}</h3>
                          <p className="text-sm text-gray-600">{app.company}</p>
                          <p className="text-xs text-gray-500">Applied {app.appliedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(app.status)} border-0`}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </span>
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => setSelectedTab("applications")}>
                    View All Applications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Monthly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Applications Sent</span>
                      <span>{userData.applicationsThisMonth}/15 goal</span>
                    </div>
                    <Progress value={(userData.applicationsThisMonth / 15) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Interview Rate</span>
                      <span>{userData.interviewRate}%</span>
                    </div>
                    <Progress value={userData.interviewRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "applications" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Applications</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    onClick={() => (window.location.href = "/generator")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-xl">{app.company.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{app.jobTitle}</h3>
                          <p className="text-gray-600 mb-2">{app.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Applied: {app.appliedDate}</span>
                            {app.status === "interview" && app.interviewDate && (
                              <span className="text-blue-600 font-medium">Interview: {app.interviewDate}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            {app.coverLetterGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                Cover Letter Generated
                              </Badge>
                            )}
                            {app.cvOptimized && (
                              <Badge variant="secondary" className="text-xs">
                                CV Optimized
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(app.status)} border-0`}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </span>
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "account" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{userData.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-900">{userData.plan} Plan</span>
                  </div>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Pro Plan</h3>
                    <p className="text-sm text-gray-600">Unlimited applications and premium features</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">$19/month</p>
                    <p className="text-sm text-gray-500">Next billing: Feb 15, 2024</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
