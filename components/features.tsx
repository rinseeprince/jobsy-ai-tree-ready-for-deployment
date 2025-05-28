import { Card, CardContent } from "@/components/ui/card"
import { FileText, Zap, Target, Shield, Clock, TrendingUp } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "No More Manual Writing",
      description: "Stop spending hours crafting cover letters. Our AI writes them for you in 30 seconds",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FileText,
      title: "CV Analyzer & Optimizer",
      description:
        "AI analyzes your CV against the job posting and tells you exactly what to improve for maximum impact",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Target,
      title: "Job-Specific Everything",
      description: "Both your cover letter and CV get tailored to match the exact job requirements",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Complete Applications in 30s",
      description:
        "Get a perfect cover letter AND CV optimization suggestions faster than you can read the job posting",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: "ATS-Optimized",
      description: "All applications include the right keywords to pass Applicant Tracking Systems",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      title: "Higher Success Rate",
      description: "Complete optimized applications get 3x more interview invitations than generic ones",
      color: "from-pink-500 to-pink-600",
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Perfect cover letters{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              + optimized CVs
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get complete application packages tailored to each job. Our AI doesnt just write cover letters - it
            analyzes and optimizes your entire application.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-8">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
