// Cover Letter Data Interface
export interface CoverLetterData {
    personalInfo: {
      name: string
      title: string
      email: string
      phone: string
      location: string
      linkedin?: string
      website?: string
    }
    jobInfo: {
      jobTitle: string
      companyName: string
      hiringManager?: string
      jobPosting: string
    }
    content: {
      opening: string
      body: string
      closing: string
    }
    selectedCVId?: string // Reference to the CV used
  }
  
  // Cover Letter Template Interface
  export interface CoverLetterTemplate {
    id: string
    name: string
    description: string
    category: "professional" | "creative" | "modern"
    preview?: string
    colors: {
      primary: string
      secondary: string
      text: string
      background: string
    }
  }
  
  // Cover Letter Templates
  export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
    {
      id: "professional",
      name: "Professional",
      description: "Traditional corporate format with clean typography",
      category: "professional",
      preview: "/placeholder.svg?height=400&width=300&text=Professional%20Cover%20Letter&bg=ffffff&color=1f2937",
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
      preview: "/placeholder.svg?height=400&width=300&text=Modern%20Cover%20Letter&bg=ffffff&color=7c3aed",
      colors: {
        primary: "#7c3aed",
        secondary: "#a78bfa",
        text: "#374151",
        background: "#ffffff",
      },
    },
    {
      id: "creative",
      name: "Creative",
      description: "Eye-catching design for creative professionals",
      category: "creative",
      preview: "/placeholder.svg?height=400&width=300&text=Creative%20Cover%20Letter&bg=ffffff&color=6366f1",
      colors: {
        primary: "#6366f1",
        secondary: "#818cf8",
        text: "#1e293b",
        background: "#ffffff",
      },
    },
  ]
  
  // Helper Functions
  export const getCoverLetterTemplateById = (id: string): CoverLetterTemplate | undefined => {
    return COVER_LETTER_TEMPLATES.find((template) => template.id === id)
  }
  
  // Template Rendering Functions
  export const renderProfessionalCoverLetterTemplate = (data: CoverLetterData, template: CoverLetterTemplate): string => {
    const { personalInfo, jobInfo, content } = data
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  
    return `
      <div style="font-family: 'Times New Roman', serif; max-width: 8.5in; margin: 0 auto; padding: 1in; color: ${template.colors.text}; background: ${template.colors.background}; line-height: 1.6;">
        <!-- Header -->
        <div style="margin-bottom: 2rem;">
          <h1 style="font-size: 24px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 0.5rem 0;">${personalInfo.name}</h1>
          <div style="font-size: 16px; color: ${template.colors.secondary}; margin-bottom: 1rem;">${personalInfo.title}</div>
          <div style="font-size: 14px; color: ${template.colors.text};">
            ${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}
          </div>
          ${
            personalInfo.linkedin || personalInfo.website
              ? `
            <div style="font-size: 14px; color: ${template.colors.text}; margin-top: 0.5rem;">
              ${personalInfo.linkedin ? personalInfo.linkedin : ""}
              ${personalInfo.linkedin && personalInfo.website ? " • " : ""}
              ${personalInfo.website ? personalInfo.website : ""}
            </div>
          `
              : ""
          }
        </div>
  
        <!-- Date -->
        <div style="margin-bottom: 2rem; font-size: 14px;">
          ${today}
        </div>
  
        <!-- Recipient -->
        ${
          jobInfo.hiringManager
            ? `
          <div style="margin-bottom: 2rem; font-size: 14px;">
            ${jobInfo.hiringManager}<br>
            ${jobInfo.companyName}
          </div>
        `
            : `
          <div style="margin-bottom: 2rem; font-size: 14px;">
            Hiring Manager<br>
            ${jobInfo.companyName}
          </div>
        `
        }
  
        <!-- Subject -->
        <div style="margin-bottom: 2rem; font-size: 14px; font-weight: bold;">
          Re: Application for ${jobInfo.jobTitle}
        </div>
  
        <!-- Salutation -->
        <div style="margin-bottom: 1.5rem; font-size: 14px;">
          ${jobInfo.hiringManager ? `Dear ${jobInfo.hiringManager},` : "Dear Hiring Manager,"}
        </div>
  
        <!-- Opening -->
        <div style="margin-bottom: 1.5rem; font-size: 14px; text-align: justify;">
          ${content.opening}
        </div>
  
        <!-- Body -->
        <div style="margin-bottom: 1.5rem; font-size: 14px; text-align: justify; white-space: pre-line;">
          ${content.body}
        </div>
  
        <!-- Closing -->
        <div style="margin-bottom: 2rem; font-size: 14px; text-align: justify;">
          ${content.closing}
        </div>
  
        <!-- Sign-off -->
        <div style="font-size: 14px;">
          <div style="margin-bottom: 3rem;">Sincerely,</div>
          <div style="font-weight: bold;">${personalInfo.name}</div>
        </div>
      </div>
    `
  }
  
  export const renderModernCoverLetterTemplate = (data: CoverLetterData, template: CoverLetterTemplate): string => {
    const { personalInfo, jobInfo, content } = data
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  
    return `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0; color: ${template.colors.text}; background: ${template.colors.background};">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary}); color: white; padding: 2rem; margin-bottom: 2rem;">
          <h1 style="font-size: 28px; font-weight: 300; margin: 0 0 0.5rem 0; letter-spacing: 1px;">${personalInfo.name}</h1>
          <div style="font-size: 16px; margin-bottom: 1rem; opacity: 0.9;">${personalInfo.title}</div>
          <div style="font-size: 14px; opacity: 0.8;">
            ${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}
          </div>
          ${
            personalInfo.linkedin || personalInfo.website
              ? `
            <div style="font-size: 14px; margin-top: 0.5rem; opacity: 0.8;">
              ${personalInfo.linkedin ? personalInfo.linkedin : ""}
              ${personalInfo.linkedin && personalInfo.website ? " | " : ""}
              ${personalInfo.website ? personalInfo.website : ""}
            </div>
          `
              : ""
          }
        </div>
  
        <!-- Content -->
        <div style="padding: 0 2rem 2rem 2rem;">
          <!-- Date and Recipient -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 2rem; font-size: 14px;">
            <div>${today}</div>
            <div style="text-align: right;">
              ${jobInfo.hiringManager ? jobInfo.hiringManager : "Hiring Manager"}<br>
              ${jobInfo.companyName}
            </div>
          </div>
  
          <!-- Subject -->
          <div style="margin-bottom: 2rem; padding: 1rem; background: ${template.colors.primary}15; border-left: 4px solid ${template.colors.primary}; font-weight: 600;">
            Re: ${jobInfo.jobTitle} Position
          </div>
  
          <!-- Salutation -->
          <div style="margin-bottom: 1.5rem; font-size: 14px;">
            ${jobInfo.hiringManager ? `Dear ${jobInfo.hiringManager},` : "Dear Hiring Manager,"}
          </div>
  
          <!-- Opening -->
          <div style="margin-bottom: 1.5rem; font-size: 14px; line-height: 1.7;">
            ${content.opening}
          </div>
  
          <!-- Body -->
          <div style="margin-bottom: 1.5rem; font-size: 14px; line-height: 1.7; white-space: pre-line;">
            ${content.body}
          </div>
  
          <!-- Closing -->
          <div style="margin-bottom: 2rem; font-size: 14px; line-height: 1.7;">
            ${content.closing}
          </div>
  
          <!-- Sign-off -->
          <div style="font-size: 14px;">
            <div style="margin-bottom: 3rem;">Best regards,</div>
            <div style="font-weight: 600; color: ${template.colors.primary};">${personalInfo.name}</div>
          </div>
        </div>
      </div>
    `
  }
  
  export const renderCreativeCoverLetterTemplate = (data: CoverLetterData, template: CoverLetterTemplate): string => {
    const { personalInfo, jobInfo, content } = data
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  
    return `
      <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0; color: ${template.colors.text}; background: ${template.colors.background};">
        <!-- Header -->
        <div style="position: relative; padding: 2rem; margin-bottom: 2rem; background: linear-gradient(45deg, ${template.colors.primary}, ${template.colors.secondary}); color: white;">
          <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30px, -30px);"></div>
          <h1 style="font-size: 32px; font-weight: 600; margin: 0 0 0.5rem 0; position: relative; z-index: 1;">${personalInfo.name}</h1>
          <div style="font-size: 18px; margin-bottom: 1rem; opacity: 0.9; position: relative; z-index: 1;">${personalInfo.title}</div>
          <div style="font-size: 14px; opacity: 0.8; position: relative; z-index: 1;">
            ${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}
          </div>
          ${
            personalInfo.linkedin || personalInfo.website
              ? `
            <div style="font-size: 14px; margin-top: 0.5rem; opacity: 0.8; position: relative; z-index: 1;">
              ${personalInfo.linkedin ? personalInfo.linkedin : ""}
              ${personalInfo.linkedin && personalInfo.website ? " • " : ""}
              ${personalInfo.website ? personalInfo.website : ""}
            </div>
          `
              : ""
          }
        </div>
  
        <!-- Content -->
        <div style="padding: 0 2rem 2rem 2rem;">
          <!-- Date and Company Info -->
          <div style="display: flex; justify-content: space-between; align-items: end; margin-bottom: 2rem;">
            <div style="font-size: 14px; color: ${template.colors.secondary};">${today}</div>
            <div style="text-align: right; padding: 1rem; background: ${template.colors.primary}10; border-radius: 8px;">
              <div style="font-weight: 600; color: ${template.colors.primary};">${jobInfo.companyName}</div>
              <div style="font-size: 14px; color: ${template.colors.secondary};">${jobInfo.hiringManager || "Hiring Manager"}</div>
            </div>
          </div>
  
          <!-- Subject -->
          <div style="margin-bottom: 2rem; text-align: center;">
            <div style="display: inline-block; padding: 0.75rem 2rem; background: ${template.colors.primary}; color: white; border-radius: 25px; font-weight: 600;">
              Application for ${jobInfo.jobTitle}
            </div>
          </div>
  
          <!-- Salutation -->
          <div style="margin-bottom: 1.5rem; font-size: 16px; font-weight: 500;">
            ${jobInfo.hiringManager ? `Hello ${jobInfo.hiringManager},` : "Hello there,"}
          </div>
  
          <!-- Opening -->
          <div style="margin-bottom: 1.5rem; font-size: 14px; line-height: 1.8; padding-left: 1rem; border-left: 3px solid ${template.colors.secondary};">
            ${content.opening}
          </div>
  
          <!-- Body -->
          <div style="margin-bottom: 1.5rem; font-size: 14px; line-height: 1.8; white-space: pre-line;">
            ${content.body}
          </div>
  
          <!-- Closing -->
          <div style="margin-bottom: 2rem; font-size: 14px; line-height: 1.8; padding-left: 1rem; border-left: 3px solid ${template.colors.secondary};">
            ${content.closing}
          </div>
  
          <!-- Sign-off -->
          <div style="text-align: center; padding: 1.5rem; background: ${template.colors.primary}05; border-radius: 8px;">
            <div style="font-size: 14px; margin-bottom: 1rem; color: ${template.colors.secondary};">Looking forward to hearing from you,</div>
            <div style="font-size: 18px; font-weight: 600; color: ${template.colors.primary};">${personalInfo.name}</div>
          </div>
        </div>
      </div>
    `
  }
  
  // Main render function
  export const renderCoverLetterTemplate = (data: CoverLetterData, template: CoverLetterTemplate): string => {
    switch (template.id) {
      case "professional":
        return renderProfessionalCoverLetterTemplate(data, template)
      case "modern":
        return renderModernCoverLetterTemplate(data, template)
      case "creative":
        return renderCreativeCoverLetterTemplate(data, template)
      default:
        return renderProfessionalCoverLetterTemplate(data, template)
    }
  }
  
  // Generate default cover letter content
  export const generateDefaultCoverLetterContent = (
    jobTitle: string,
    companyName: string,
  ): {
    opening: string
    body: string
    closing: string
  } => {
    return {
      opening: `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background and passion for this field, I am excited about the opportunity to contribute to your team's success.`,
      body: `Throughout my career, I have developed skills that align perfectly with the requirements of this role. My experience has taught me the importance of attention to detail, collaborative teamwork, and innovative problem-solving.\n\nI am particularly drawn to ${companyName} because of your reputation for excellence and commitment to innovation. I believe my skills and enthusiasm would make me a valuable addition to your organization.`,
      closing: `I would welcome the opportunity to discuss how my background and passion can contribute to ${companyName}'s continued success. Thank you for considering my application, and I look forward to hearing from you soon.`,
    }
  }
  
  export {}
  