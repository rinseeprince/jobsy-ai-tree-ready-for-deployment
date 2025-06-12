"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Briefcase, GraduationCap, Code, Award } from "lucide-react"
import type { CVData } from "@/lib/cv-templates"

interface CVPreviewProps {
  cvData: CVData
  templateId?: string
}

interface Template {
  id: string
  name: string
  content: string
}

const getTemplateById = (templateId: string): Template => {
  return {
    id: templateId,
    name: "Sample Template",
    content: "<div><h1>{{personalInfo.name}}</h1><p>{{personalInfo.title}}</p></div>",
  }
}

const renderTemplate = (cvData: CVData, template: Template): string => {
  let rendered = template.content
  rendered = rendered.replace("{{personalInfo.name}}", cvData.personalInfo.name || "Your Name")
  rendered = rendered.replace("{{personalInfo.title}}", cvData.personalInfo.title || "Professional Title")
  return rendered
}

export function CVPreview({ cvData, templateId }: CVPreviewProps) {
  if (templateId) {
    const template = getTemplateById(templateId)
    if (template) {
      const templatePreview = renderTemplate(cvData, template)
      return (
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="flex items-center text-xl">
              <Target className="w-6 h-6 mr-3" />
              Template Preview
            </CardTitle>
            <p className="text-blue-100 mt-2">Live preview of your CV with the selected template</p>
          </CardHeader>
          <CardContent className="p-0">
            <div dangerouslySetInnerHTML={{ __html: templatePreview }} />
          </CardContent>
        </Card>
      )
    }
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <CardTitle className="flex items-center text-xl">
          <Target className="w-6 h-6 mr-3" />
          CV Preview
        </CardTitle>
        <p className="text-blue-100 mt-2">Real-time preview of your CV content</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="bg-gradient-to-br from-white to-gray-50 p-10 border-2 border-gray-200/50 rounded-3xl shadow-inner">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{cvData.personalInfo.name || "Your Name"}</h1>
            <p className="text-xl text-gray-700 mb-4">{cvData.personalInfo.title || "Professional Title"}</p>
            <div className="flex items-center justify-center gap-6 text-gray-600">
              {cvData.personalInfo.email && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {cvData.personalInfo.email}
                </span>
              )}
              {cvData.personalInfo.phone && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {cvData.personalInfo.phone}
                </span>
              )}
              {cvData.personalInfo.location && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {cvData.personalInfo.location}
                </span>
              )}
            </div>
            {(cvData.personalInfo.linkedin || cvData.personalInfo.website) && (
              <div className="flex items-center justify-center gap-6 text-gray-600 mt-2">
                {cvData.personalInfo.linkedin && (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    LinkedIn: {cvData.personalInfo.linkedin}
                  </span>
                )}
                {cvData.personalInfo.website && (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    Website: {cvData.personalInfo.website}
                  </span>
                )}
              </div>
            )}
          </div>

          {cvData.personalInfo.summary && (
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-gray-800 text-lg leading-relaxed">{cvData.personalInfo.summary}</p>
            </div>
          )}

          {cvData.experience.length > 0 && cvData.experience[0].title && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                EXPERIENCE
              </h2>
              {cvData.experience.map((exp) => (
                <div key={exp.id} className="mb-6 p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                    <span className="text-gray-600 font-medium">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 italic mb-3">
                    {exp.company}, {exp.location}
                  </p>
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {cvData.education.length > 0 && cvData.education[0].degree && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                EDUCATION
              </h2>
              {cvData.education.map((edu) => (
                <div key={edu.id} className="mb-6 p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                    <span className="text-gray-600 font-medium">
                      {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 italic mb-3">
                    {edu.institution}, {edu.location}
                  </p>
                  {edu.description && (
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {cvData.skills.length > 0 && cvData.skills[0] && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Code className="w-4 h-4 text-white" />
                </div>
                SKILLS
              </h2>
              <div className="flex flex-wrap gap-3">
                {cvData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cvData.certifications.length > 0 && cvData.certifications[0].name && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Award className="w-4 h-4 text-white" />
                </div>
                CERTIFICATIONS
              </h2>
              {cvData.certifications.map((cert) => (
                <div key={cert.id} className="mb-6 p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{cert.name}</h3>
                    <span className="text-gray-600 font-medium">{cert.date}</span>
                  </div>
                  <p className="text-lg text-gray-700 italic mb-3">{cert.issuer}</p>
                  {cert.description && (
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">{cert.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
