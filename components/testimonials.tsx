import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      content:
        "JobCraft AI helped me land my dream job at Google. The cover letters were so personalized, I got responses from 80% of my applications!",
      rating: 5,
      initials: "SC",
      bgColor: "bg-blue-500",
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Microsoft",
      content:
        "I was struggling to get interviews for months. After using JobCraft AI, I had 5 interviews in 2 weeks. The CV suggestions were game-changing.",
      rating: 5,
      initials: "MJ",
      bgColor: "bg-green-500",
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "Airbnb",
      content:
        "The AI understood exactly what each company was looking for. My applications went from generic to perfectly tailored. Highly recommend!",
      rating: 5,
      initials: "ER",
      bgColor: "bg-purple-500",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Loved by job seekers worldwide</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who have accelerated their job search with AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-blue-600 mb-4" />

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {`"${testimonial.content}"`}
                </p>

                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full ${testimonial.bgColor} flex items-center justify-center mr-4`}>
                    <span className="text-white font-semibold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}