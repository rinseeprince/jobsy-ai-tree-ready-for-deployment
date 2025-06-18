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
  features?: string[] // Add optional features array
}

// Update the CV_TEMPLATES array to add three new photo-based templates
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
  {
    id: "executive",
    name: "Executive Photo",
    description: "Professional side column design with photo for executives",
    category: "professional",
    preview: "/placeholder.svg?height=400&width=300&text=Executive%20Photo&bg=ffffff&color=0f172a",
    colors: {
      primary: "#0f172a",
      secondary: "#475569",
      text: "#1e293b",
      background: "#ffffff",
    },
  },
  {
    id: "creative",
    name: "Creative Photo",
    description: "Modern design with photo for creative professionals",
    category: "creative",
    preview: "/placeholder.svg?height=400&width=300&text=Creative%20Photo&bg=ffffff&color=6366f1",
    colors: {
      primary: "#6366f1",
      secondary: "#818cf8",
      text: "#1e293b",
      background: "#ffffff",
    },
  },
  {
    id: "minimalist",
    name: "Minimalist Photo",
    description: "Clean, minimalist design with subtle photo integration",
    category: "modern",
    preview: "/placeholder.svg?height=400&width=300&text=Minimalist%20Photo&bg=ffffff&color=0ea5e9",
    colors: {
      primary: "#0ea5e9",
      secondary: "#38bdf8",
      text: "#0f172a",
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

// Add these new template rendering functions after the existing render functions

// Executive Photo Template - Side column with photo
export const renderExecutiveTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0; color: ${template.colors.text}; background: ${template.colors.background}; display: flex;">
      <!-- Left Column -->
      <div style="width: 30%; background-color: ${template.colors.primary}; color: white; padding: 2rem 1.5rem;">
        <!-- Photo -->
        ${
          personalInfo.profilePhoto
            ? `
          <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden; margin: 0 auto; border: 4px solid rgba(255,255,255,0.2);">
              <img src="${personalInfo.profilePhoto}" alt="${personalInfo.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        `
            : ""
        }
        
        <!-- Contact -->
        <div style="margin-bottom: 2rem;">
          <h3 style="text-transform: uppercase; font-size: 16px; letter-spacing: 1px; margin-bottom: 1rem; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 0.5rem;">Contact</h3>
          <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 14px;">
            ${personalInfo.email ? `<li style="margin-bottom: 0.75rem;"><strong>Email:</strong><br>${personalInfo.email}</li>` : ""}
            ${personalInfo.phone ? `<li style="margin-bottom: 0.75rem;"><strong>Phone:</strong><br>${personalInfo.phone}</li>` : ""}
            ${personalInfo.location ? `<li style="margin-bottom: 0.75rem;"><strong>Location:</strong><br>${personalInfo.location}</li>` : ""}
            ${personalInfo.linkedin ? `<li style="margin-bottom: 0.75rem;"><strong>LinkedIn:</strong><br>${personalInfo.linkedin}</li>` : ""}
            ${personalInfo.website ? `<li style="margin-bottom: 0.75rem;"><strong>Website:</strong><br>${personalInfo.website}</li>` : ""}
          </ul>
        </div>
        
        <!-- Skills -->
        ${
          skills.length > 0 && skills[0]
            ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="text-transform: uppercase; font-size: 16px; letter-spacing: 1px; margin-bottom: 1rem; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 0.5rem;">Skills</h3>
            <ul style="list-style-type: none; padding: 0; margin: 0;">
              ${skills.map((skill) => `<li style="margin-bottom: 0.5rem; font-size: 14px;">• ${skill}</li>`).join("")}
            </ul>
          </div>
        `
            : ""
        }
        
        <!-- Certifications -->
        ${
          certifications.length > 0 && certifications[0].name
            ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="text-transform: uppercase; font-size: 16px; letter-spacing: 1px; margin-bottom: 1rem; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 0.5rem;">Certifications</h3>
            ${certifications
              .map(
                (cert) => `
              <div style="margin-bottom: 1rem;">
                <div style="font-weight: bold; font-size: 14px;">${cert.name}</div>
                <div style="font-size: 13px; opacity: 0.8;">${cert.issuer} | ${cert.date}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
      
      <!-- Right Column -->
      <div style="width: 70%; padding: 2rem;">
        <!-- Header -->
        <div style="margin-bottom: 2rem; border-bottom: 2px solid ${template.colors.primary}; padding-bottom: 1rem;">
          <h1 style="font-size: 28px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 0.5rem 0; color: ${template.colors.primary};">${personalInfo.name || "Your Name"}</h1>
          <h2 style="font-size: 18px; font-weight: normal; margin: 0; color: ${template.colors.secondary};">${personalInfo.title || "Professional Title"}</h2>
        </div>
        
        <!-- Summary -->
        ${
          personalInfo.summary
            ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: ${template.colors.primary}; margin-bottom: 1rem;">Profile</h3>
            <p style="margin: 0; line-height: 1.6; font-size: 14px;">${personalInfo.summary}</p>
          </div>
        `
            : ""
        }
        
        <!-- Experience -->
        ${
          experience.length > 0 && experience[0].title
            ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: ${template.colors.primary}; margin-bottom: 1rem;">Work Experience</h3>
            ${experience
              .map(
                (exp) => `
              <div style="margin-bottom: 1.5rem; position: relative;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                  <h4 style="font-size: 16px; margin: 0; color: ${template.colors.text};">${exp.title}</h4>
                  <span style="font-size: 14px; color: ${template.colors.secondary};">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div style="font-size: 15px; font-weight: 500; color: ${template.colors.secondary}; margin-bottom: 0.75rem;">${exp.company} | ${exp.location}</div>
                <div style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${exp.description}</div>
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
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: ${template.colors.primary}; margin-bottom: 1rem;">Education</h3>
            ${education
              .map(
                (edu) => `
              <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                  <h4 style="font-size: 16px; margin: 0; color: ${template.colors.text};">${edu.degree}</h4>
                  <span style="font-size: 14px; color: ${template.colors.secondary};">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
                </div>
                <div style="font-size: 15px; font-weight: 500; color: ${template.colors.secondary}; margin-bottom: 0.75rem;">${edu.institution} | ${edu.location}</div>
                ${edu.description ? `<div style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${edu.description}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    </div>
  `
}

// Creative Photo Template - Top header with photo
export const renderCreativeTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0; color: ${template.colors.text}; background: ${template.colors.background};">
      <!-- Header with Photo -->
      <div style="background: linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary}); padding: 2rem; display: flex; align-items: center; color: white;">
        ${
          personalInfo.profilePhoto
            ? `
          <div style="margin-right: 2rem;">
            <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
              <img src="${personalInfo.profilePhoto}" alt="${personalInfo.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        `
            : ""
        }
        <div>
          <h1 style="font-size: 32px; margin: 0 0 0.5rem 0; font-weight: 600;">${personalInfo.name || "Your Name"}</h1>
          <h2 style="font-size: 18px; margin: 0 0 1rem 0; font-weight: 400; opacity: 0.9;">${personalInfo.title || "Professional Title"}</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 14px;">
            ${personalInfo.email ? `<div>${personalInfo.email}</div>` : ""}
            ${personalInfo.phone ? `<div>• ${personalInfo.phone}</div>` : ""}
            ${personalInfo.location ? `<div>• ${personalInfo.location}</div>` : ""}
          </div>
          ${
            personalInfo.linkedin || personalInfo.website
              ? `
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 14px;">
              ${personalInfo.linkedin ? `<div>${personalInfo.linkedin}</div>` : ""}
              ${personalInfo.website ? `<div>${personalInfo.linkedin && personalInfo.website ? "•" : ""} ${personalInfo.website}</div>` : ""}
            </div>
          `
              : ""
          }
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 2rem;">
        <!-- Two Column Layout -->
        <div style="display: flex; gap: 2rem;">
          <!-- Left Column (70%) -->
          <div style="flex: 7;">
            <!-- Summary -->
            ${
              personalInfo.summary
                ? `
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 18px; position: relative; color: ${template.colors.primary}; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.colors.primary};">About Me</h3>
                <p style="margin: 0; line-height: 1.6; font-size: 14px;">${personalInfo.summary}</p>
              </div>
            `
                : ""
            }
            
            <!-- Experience -->
            ${
              experience.length > 0 && experience[0].title
                ? `
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 18px; position: relative; color: ${template.colors.primary}; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.colors.primary};">Work Experience</h3>
                ${experience
                  .map(
                    (exp) => `
                  <div style="margin-bottom: 1.5rem; position: relative;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                      <h4 style="font-size: 16px; margin: 0; color: ${template.colors.text}; font-weight: 600;">${exp.title}</h4>
                      <span style="font-size: 14px; color: ${template.colors.primary}; font-weight: 500;">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <div style="font-size: 15px; color: ${template.colors.secondary}; margin-bottom: 0.75rem;">${exp.company} | ${exp.location}</div>
                    <div style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${exp.description}</div>
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
              <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 18px; position: relative; color: ${template.colors.primary}; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.colors.primary};">Education</h3>
                ${education
                  .map(
                    (edu) => `
                  <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                      <h4 style="font-size: 16px; margin: 0; color: ${template.colors.text}; font-weight: 600;">${edu.degree}</h4>
                      <span style="font-size: 14px; color: ${template.colors.primary}; font-weight: 500;">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
                    </div>
                    <div style="font-size: 15px; color: ${template.colors.secondary}; margin-bottom: 0.75rem;">${edu.institution} | ${edu.location}</div>
                    ${edu.description ? `<div style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${edu.description}</div>` : ""}
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </div>
          
          <!-- Right Column (30%) -->
          <div style="flex: 3;">
            <!-- Skills -->
            ${
              skills.length > 0 && skills[0]
                ? `
              <div style="margin-bottom: 2rem; background-color: #f8fafc; padding: 1.5rem; border-radius: 8px;">
                <h3 style="font-size: 18px; color: ${template.colors.primary}; margin-top: 0; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.colors.primary};">Skills</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                  ${skills.map((skill) => `<span style="background: ${template.colors.primary}15; color: ${template.colors.primary}; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 13px; font-weight: 500;">${skill}</span>`).join("")}
                </div>
              </div>
            `
                : ""
            }
            
            <!-- Certifications -->
            ${
              certifications.length > 0 && certifications[0].name
                ? `
              <div style="margin-bottom: 2rem; background-color: #f8fafc; padding: 1.5rem; border-radius: 8px;">
                <h3 style="font-size: 18px; color: ${template.colors.primary}; margin-top: 0; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${template.colors.primary};">Certifications</h3>
                ${certifications
                  .map(
                    (cert) => `
                  <div style="margin-bottom: 1rem;">
                    <div style="font-weight: 600; font-size: 14px; color: ${template.colors.text};">${cert.name}</div>
                    <div style="font-size: 13px; color: ${template.colors.secondary};">${cert.issuer} | ${cert.date}</div>
                    ${cert.description ? `<div style="font-size: 12px; margin-top: 0.25rem;">${cert.description}</div>` : ""}
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `
}

// Minimalist Photo Template - Clean design with photo
export const renderMinimalistTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 2rem; color: ${template.colors.text}; background: ${template.colors.background}; line-height: 1.6;">
      <!-- Header -->
      <div style="display: flex; align-items: center; margin-bottom: 2.5rem; gap: 2rem;">
        ${
          personalInfo.profilePhoto
            ? `
          <div>
            <div style="width: 100px; height: 100px; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <img src="${personalInfo.profilePhoto}" alt="${personalInfo.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        `
            : ""
        }
        <div style="flex-grow: 1;">
          <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 0.5rem 0; color: ${template.colors.text};">${personalInfo.name || "Your Name"}</h1>
          <h2 style="font-size: 16px; font-weight: 500; margin: 0 0 1rem 0; color: ${template.colors.primary};">${personalInfo.title || "Professional Title"}</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 13px; color: ${template.colors.secondary};">
            ${personalInfo.email ? `<div>${personalInfo.email}</div>` : ""}
            ${personalInfo.phone ? `<div>${personalInfo.phone}</div>` : ""}
            ${personalInfo.location ? `<div>${personalInfo.location}</div>` : ""}
            ${personalInfo.linkedin ? `<div>${personalInfo.linkedin}</div>` : ""}
            ${personalInfo.website ? `<div>${personalInfo.website}</div>` : ""}
          </div>
        </div>
      </div>
      
      <!-- Divider -->
      <div style="height: 1px; background-color: #e2e8f0; margin-bottom: 2rem;"></div>
      
      <!-- Two Column Layout -->
      <div style="display: flex; gap: 3rem;">
        <!-- Main Column (65%) -->
        <div style="flex: 65;">
          <!-- Summary -->
          ${
            personalInfo.summary
              ? `
            <div style="margin-bottom: 2.5rem;">
              <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 1rem 0; letter-spacing: 0.5px;">PROFILE</h3>
              <p style="margin: 0; line-height: 1.7; font-size: 14px;">${personalInfo.summary}</p>
            </div>
          `
              : ""
          }
          
          <!-- Experience -->
          ${
            experience.length > 0 && experience[0].title
              ? `
            <div style="margin-bottom: 2.5rem;">
              <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 1rem 0; letter-spacing: 0.5px;">EXPERIENCE</h3>
              ${experience
                .map(
                  (exp) => `
                <div style="margin-bottom: 1.75rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 15px; font-weight: 600; margin: 0; color: ${template.colors.text};">${exp.title}</h4>
                    <span style="font-size: 13px; color: ${template.colors.secondary};">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <div style="font-size: 14px; color: ${template.colors.secondary}; margin-bottom: 0.75rem;">${exp.company} | ${exp.location}</div>
                  <div style="font-size: 13px; line-height: 1.7; white-space: pre-line;">${exp.description}</div>
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
            <div style="margin-bottom: 2.5rem;">
              <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 1rem 0; letter-spacing: 0.5px;">EDUCATION</h3>
              ${education
                .map(
                  (edu) => `
                <div style="margin-bottom: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 15px; font-weight: 600; margin: 0; color: ${template.colors.text};">${edu.degree}</h4>
                    <span style="font-size: 13px; color: ${template.colors.secondary};">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
                  </div>
                  <div style="font-size: 14px; color: ${template.colors.secondary}; margin-bottom: 0.5rem;">${edu.institution} | ${edu.location}</div>
                  ${edu.description ? `<div style="font-size: 13px; line-height: 1.7; white-space: pre-line;">${edu.description}</div>` : ""}
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Side Column (35%) -->
        <div style="flex: 35;">
          <!-- Skills -->
          ${
            skills.length > 0 && skills[0]
              ? `
            <div style="margin-bottom: 2.5rem;">
              <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 1rem 0; letter-spacing: 0.5px;">SKILLS</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                ${skills.map((skill) => `<div style="font-size: 13px; padding: 0.4rem 0.75rem; background-color: #f1f5f9; border-radius: 4px; color: ${template.colors.text};">${skill}</div>`).join("")}
              </div>
            </div>
          `
              : ""
          }
          
          <!-- Certifications -->
          ${
            certifications.length > 0 && certifications[0].name
              ? `
            <div style="margin-bottom: 2.5rem;">
              <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 1rem 0; letter-spacing: 0.5px;">CERTIFICATIONS</h3>
              ${certifications
                .map(
                  (cert) => `
                <div style="margin-bottom: 1.25rem;">
                  <div style="font-weight: 600; font-size: 14px; color: ${template.colors.text}; margin-bottom: 0.25rem;">${cert.name}</div>
                  <div style="font-size: 13px; color: ${template.colors.secondary}; margin-bottom: 0.25rem;">${cert.issuer} | ${cert.date}</div>
                  ${cert.description ? `<div style="font-size: 12px; line-height: 1.6;">${cert.description}</div>` : ""}
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>
      </div>
    </div>
  `
}

// Update the main render function to include the new templates
export const renderTemplate = (cvData: CVData, template: CVTemplate): string => {
  switch (template.id) {
    case "ats-optimized":
      return renderATSOptimizedTemplate(cvData, template)
    case "professional":
      return renderProfessionalTemplate(cvData, template)
    case "modern":
      return renderModernTemplate(cvData, template)
    case "executive":
      return renderExecutiveTemplate(cvData, template)
    case "creative":
      return renderCreativeTemplate(cvData, template)
    case "minimalist":
      return renderMinimalistTemplate(cvData, template)
    default:
      return renderATSOptimizedTemplate(cvData, template)
  }
}
