// CV Data Interface
export interface CVData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
    linkedin?: string
    website?: string
    profilePhoto?: string // Add this new field for base64 image data
  }
  experience: Array<{
    id: string
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    degree: string
    institution: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  skills: string[]
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
    description: string
  }>
}

// Template Interface
export interface CVTemplate {
  id: string
  name: string
  description: string
  category: "professional" | "creative" | "modern" | "ats-optimized"
  preview?: string
  colors: {
    primary: string
    secondary: string
    text: string
    background: string
  }
}

// Template Definitions with better previews
export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "ats-optimized",
    name: "ATS Optimized",
    description: "Clean, simple format that passes through ATS systems easily",
    category: "ats-optimized",
    preview: "/placeholder.svg?height=400&width=300&text=ATS%20Template&bg=ffffff&color=2563eb",
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      text: "#1e293b",
      background: "#ffffff",
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional corporate design with clean typography",
    category: "professional",
    preview: "/placeholder.svg?height=400&width=300&text=Professional%20Template&bg=ffffff&color=1f2937",
    colors: {
      primary: "#1f2937",
      secondary: "#6b7280",
      text: "#111827",
      background: "#ffffff",
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with subtle colors and modern layout",
    category: "modern",
    preview: "/placeholder.svg?height=400&width=300&text=Modern%20Template&bg=ffffff&color=7c3aed",
    colors: {
      primary: "#7c3aed",
      secondary: "#a78bfa",
      text: "#374151",
      background: "#ffffff",
    },
  },
]

// Helper Functions
export const getTemplateById = (id: string): CVTemplate | undefined => {
  return CV_TEMPLATES.find((template) => template.id === id)
}

// Template Rendering Functions
export const renderATSOptimizedTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; color: ${template.colors.text}; background: ${template.colors.background};">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 8px 0;">${personalInfo.name}</h1>
        <div style="font-size: 16px; color: ${template.colors.secondary}; margin-bottom: 8px;">${personalInfo.title}</div>
        <div style="font-size: 12px; color: ${template.colors.text};">
          ${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}
        </div>
        ${
          personalInfo.linkedin || personalInfo.website
            ? `
          <div style="font-size: 12px; color: ${template.colors.text}; margin-top: 4px;">
            ${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ""}
            ${personalInfo.linkedin && personalInfo.website ? " | " : ""}
            ${personalInfo.website ? `Website: ${personalInfo.website}` : ""}
          </div>
        `
            : ""
        }
      </div>

      <!-- Summary -->
      ${
        personalInfo.summary
          ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0; line-height: 1.6;">${personalInfo.summary}</p>
        </div>
      `
          : ""
      }

      <!-- Experience -->
      ${
        experience.length > 0 && experience[0].title
          ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; border-bottom: 1px solid ${template.colors.secondary}; padding-bottom: 4px;">EXPERIENCE</h2>
          ${experience
            .map(
              (exp) => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <h3 style="font-size: 14px; font-weight: bold; margin: 0; color: ${template.colors.text};">${exp.title}</h3>
                <span style="font-size: 12px; color: ${template.colors.secondary};">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div style="font-size: 13px; font-style: italic; color: ${template.colors.secondary}; margin-bottom: 4px;">${exp.company}, ${exp.location}</div>
              <div style="font-size: 12px; line-height: 1.5; white-space: pre-line;">${exp.description}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Education -->
      ${
        education.length > 0 && education[0].degree
          ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; border-bottom: 1px solid ${template.colors.secondary}; padding-bottom: 4px;">EDUCATION</h2>
          ${education
            .map(
              (edu) => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <h3 style="font-size: 14px; font-weight: bold; margin: 0; color: ${template.colors.text};">${edu.degree}</h3>
                <span style="font-size: 12px; color: ${template.colors.secondary};">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
              </div>
              <div style="font-size: 13px; font-style: italic; color: ${template.colors.secondary}; margin-bottom: 4px;">${edu.institution}, ${edu.location}</div>
              ${edu.description ? `<div style="font-size: 12px; line-height: 1.5; white-space: pre-line;">${edu.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Skills -->
      ${
        skills.length > 0 && skills[0]
          ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; border-bottom: 1px solid ${template.colors.secondary}; padding-bottom: 4px;">SKILLS</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${skills.map((skill) => `<span style="background: #f1f5f9; color: ${template.colors.text}; padding: 4px 12px; border-radius: 16px; font-size: 12px;">${skill}</span>`).join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- Certifications -->
      ${
        certifications.length > 0 && certifications[0].name
          ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; border-bottom: 1px solid ${template.colors.secondary}; padding-bottom: 4px;">CERTIFICATIONS</h2>
          ${certifications
            .map(
              (cert) => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <h3 style="font-size: 14px; font-weight: bold; margin: 0; color: ${template.colors.text};">${cert.name}</h3>
                <span style="font-size: 12px; color: ${template.colors.secondary};">${cert.date}</span>
              </div>
              <div style="font-size: 13px; font-style: italic; color: ${template.colors.secondary}; margin-bottom: 4px;">${cert.issuer}</div>
              ${cert.description ? `<div style="font-size: 12px; line-height: 1.5; white-space: pre-line;">${cert.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `
}

export const renderProfessionalTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: 'Times New Roman', serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; color: ${template.colors.text}; background: ${template.colors.background};">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid ${template.colors.primary}; padding-bottom: 16px;">
        <h1 style="font-size: 28px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 8px 0; letter-spacing: 1px;">${personalInfo.name}</h1>
        <div style="font-size: 18px; color: ${template.colors.secondary}; margin-bottom: 12px; font-style: italic;">${personalInfo.title}</div>
        <div style="font-size: 14px; color: ${template.colors.text};">
          ${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}
        </div>
        ${
          personalInfo.linkedin || personalInfo.website
            ? `
          <div style="font-size: 14px; color: ${template.colors.text}; margin-top: 8px;">
            ${personalInfo.linkedin ? `${personalInfo.linkedin}` : ""}
            ${personalInfo.linkedin && personalInfo.website ? " • " : ""}
            ${personalInfo.website ? `${personalInfo.website}` : ""}
          </div>
        `
            : ""
        }
      </div>

      <!-- Summary -->
      ${
        personalInfo.summary
          ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h2>
          <p style="margin: 0; line-height: 1.7; font-size: 14px; text-align: justify;">${personalInfo.summary}</p>
        </div>
      `
          : ""
      }

      <!-- Experience -->
      ${
        experience.length > 0 && experience[0].title
          ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Professional Experience</h2>
          ${experience
            .map(
              (exp) => `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: ${template.colors.text};">${exp.title}</h3>
                <span style="font-size: 14px; color: ${template.colors.secondary}; font-style: italic;">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div style="font-size: 15px; font-weight: 600; color: ${template.colors.secondary}; margin-bottom: 8px;">${exp.company} | ${exp.location}</div>
              <div style="font-size: 14px; line-height: 1.6; white-space: pre-line; text-align: justify;">${exp.description}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Education -->
      ${
        education.length > 0 && education[0].degree
          ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
          ${education
            .map(
              (edu) => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: ${template.colors.text};">${edu.degree}</h3>
                <span style="font-size: 14px; color: ${template.colors.secondary}; font-style: italic;">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
              </div>
              <div style="font-size: 15px; font-weight: 600; color: ${template.colors.secondary}; margin-bottom: 8px;">${edu.institution} | ${edu.location}</div>
              ${edu.description ? `<div style="font-size: 14px; line-height: 1.6; white-space: pre-line; text-align: justify;">${edu.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Skills -->
      ${
        skills.length > 0 && skills[0]
          ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Core Competencies</h2>
          <div style="font-size: 14px; line-height: 1.8;">
            ${skills.join(" • ")}
          </div>
        </div>
      `
          : ""
      }

      <!-- Certifications -->
      ${
        certifications.length > 0 && certifications[0].name
          ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Certifications</h2>
          ${certifications
            .map(
              (cert) => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: ${template.colors.text};">${cert.name}</h3>
                <span style="font-size: 14px; color: ${template.colors.secondary}; font-style: italic;">${cert.date}</span>
              </div>
              <div style="font-size: 15px; font-weight: 600; color: ${template.colors.secondary}; margin-bottom: 8px;">${cert.issuer}</div>
              ${cert.description ? `<div style="font-size: 14px; line-height: 1.6; white-space: pre-line; text-align: justify;">${cert.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `
}

export const renderModernTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; color: ${template.colors.text}; background: ${template.colors.background};">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary}); color: white; padding: 24px; margin: -0.5in -0.5in 24px -0.5in; text-align: center;">
        <h1 style="font-size: 32px; font-weight: 300; margin: 0 0 8px 0; letter-spacing: 2px;">${personalInfo.name}</h1>
        <div style="font-size: 18px; margin-bottom: 16px; opacity: 0.9;">${personalInfo.title}</div>
        <div style="font-size: 14px; opacity: 0.8;">
          ${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}
        </div>
        ${
          personalInfo.linkedin || personalInfo.website
            ? `
          <div style="font-size: 14px; margin-top: 8px; opacity: 0.8;">
            ${personalInfo.linkedin ? `${personalInfo.linkedin}` : ""}
            ${personalInfo.linkedin && personalInfo.website ? " | " : ""}
            ${personalInfo.website ? `${personalInfo.website}` : ""}
          </div>
        `
            : ""
        }
      </div>

      <!-- Summary -->
      ${
        personalInfo.summary
          ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 300; color: ${template.colors.primary}; margin: 0 0 16px 0; position: relative;">
            <span style="background: ${template.colors.background}; padding-right: 16px;">About Me</span>
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: ${template.colors.secondary}; z-index: -1;"></div>
          </h2>
          <p style="margin: 0; line-height: 1.7; font-size: 14px; color: ${template.colors.text};">${personalInfo.summary}</p>
        </div>
      `
          : ""
      }

      <!-- Experience -->
      ${
        experience.length > 0 && experience[0].title
          ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 300; color: ${template.colors.primary}; margin: 0 0 20px 0; position: relative;">
            <span style="background: ${template.colors.background}; padding-right: 16px;">Experience</span>
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: ${template.colors.secondary}; z-index: -1;"></div>
          </h2>
          ${experience
            .map(
              (exp) => `
            <div style="margin-bottom: 24px; padding-left: 20px; border-left: 3px solid ${template.colors.secondary};">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: ${template.colors.primary};">${exp.title}</h3>
                <span style="font-size: 12px; color: ${template.colors.secondary}; background: #f8fafc; padding: 4px 8px; border-radius: 12px;">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div style="font-size: 14px; color: ${template.colors.secondary}; margin-bottom: 8px; font-weight: 500;">${exp.company} • ${exp.location}</div>
              <div style="font-size: 13px; line-height: 1.6; white-space: pre-line; color: ${template.colors.text};">${exp.description}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Education -->
      ${
        education.length > 0 && education[0].degree
          ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 300; color: ${template.colors.primary}; margin: 0 0 20px 0; position: relative;">
            <span style="background: ${template.colors.background}; padding-right: 16px;">Education</span>
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: ${template.colors.secondary}; z-index: -1;"></div>
          </h2>
          ${education
            .map(
              (edu) => `
            <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid ${template.colors.secondary};">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: ${template.colors.primary};">${edu.degree}</h3>
                <span style="font-size: 12px; color: ${template.colors.secondary}; background: #f8fafc; padding: 4px 8px; border-radius: 12px;">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
              </div>
              <div style="font-size: 14px; color: ${template.colors.secondary}; margin-bottom: 8px; font-weight: 500;">${edu.institution} • ${edu.location}</div>
              ${edu.description ? `<div style="font-size: 13px; line-height: 1.6; white-space: pre-line; color: ${template.colors.text};">${edu.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Skills -->
      ${
        skills.length > 0 && skills[0]
          ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 300; color: ${template.colors.primary}; margin: 0 0 20px 0; position: relative;">
            <span style="background: ${template.colors.background}; padding-right: 16px;">Skills</span>
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: ${template.colors.secondary}; z-index: -1;"></div>
          </h2>
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            ${skills.map((skill) => `<span style="background: linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary}); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 500;">${skill}</span>`).join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- Certifications -->
      ${
        certifications.length > 0 && certifications[0].name
          ? `
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 20px; font-weight: 300; color: ${template.colors.primary}; margin: 0 0 20px 0; position: relative;">
            <span style="background: ${template.colors.background}; padding-right: 16px;">Certifications</span>
            <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: ${template.colors.secondary}; z-index: -1;"></div>
          </h2>
          ${certifications
            .map(
              (cert) => `
            <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid ${template.colors.secondary};">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: ${template.colors.primary};">${cert.name}</h3>
                <span style="font-size: 12px; color: ${template.colors.secondary}; background: #f8fafc; padding: 4px 8px; border-radius: 12px;">${cert.date}</span>
              </div>
              <div style="font-size: 14px; color: ${template.colors.secondary}; margin-bottom: 8px; font-weight: 500;">${cert.issuer}</div>
              ${cert.description ? `<div style="font-size: 13px; line-height: 1.6; white-space: pre-line; color: ${template.colors.text};">${cert.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `
}

// Main render function
export const renderTemplate = (cvData: CVData, template: CVTemplate): string => {
  switch (template.id) {
    case "ats-optimized":
      return renderATSOptimizedTemplate(cvData, template)
    case "professional":
      return renderProfessionalTemplate(cvData, template)
    case "modern":
      return renderModernTemplate(cvData, template)
    default:
      return renderATSOptimizedTemplate(cvData, template)
  }
}
