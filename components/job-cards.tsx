"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock } from "lucide-react"

export function JobCards() {
  const jobs = [
    {
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "London, UK",
      type: "Full-time",
      salary: "£80k - £120k",
      color: "from-blue-500 to-blue-600",
      companyInitial: "T",
    },
    {
      title: "Product Manager",
      company: "InnovateCo",
      location: "New York, USA",
      type: "Full-time",
      salary: "$100k - $150k",
      color: "from-teal-500 to-teal-600",
      companyInitial: "I",
    },
    {
      title: "UX Designer",
      company: "DesignStudio",
      location: "London, UK",
      type: "Contract",
      salary: "£50k - £75k",
      color: "from-purple-500 to-purple-600",
      companyInitial: "D",
    },
  ]

  return (
    <div className="relative">
      {/* Floating job cards */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <Card
            key={index}
            className={`p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              index === 1 ? "ml-8" : index === 2 ? "ml-4" : ""
            }`}
            style={{
              animationDelay: `${index * 0.2}s`,
            }}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${job.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{job.companyInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{job.company}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {job.type}
                    </Badge>
                    <div className="text-sm font-medium text-gray-900">{job.salary}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI processing indicator */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">AI analyzing...</span>
        </div>
      </div>
    </div>
  )
}
