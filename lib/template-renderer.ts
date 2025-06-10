import type { CVData, CVTemplate } from "./cv-templates"

export const renderTraditionalTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: 'Times New Roman', serif; max-width: 8.5in; margin: 0 auto; padding: 1in; background: ${template.colors.background}; color: ${template.colors.text}; line-height: 1.6;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${template.colors.primary}; padding-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px 0; color: ${template.colors.primary};">${personalInfo.name || "Your Name"}</h1>
        <h2 style="font-size: 16px; font-weight: normal; margin: 0 0 12px 0; color: ${template.colors.secondary}; font-style: italic;">${personalInfo.title || "Professional Title"}</h2>
        <div style="font-size: 12px; color: ${template.colors.text};">
          ${personalInfo.email ? `${personalInfo.email} • ` : ""}
          ${personalInfo.phone ? `${personalInfo.phone} • ` : ""}
          ${personalInfo.location || ""}
        </div>
        ${
          personalInfo.linkedin || personalInfo.website
            ? `
          <div style="font-size: 12px; color: ${template.colors.secondary}; margin-top: 4px;">
            ${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ""}
            ${personalInfo.linkedin && personalInfo.website ? " • " : ""}
            ${personalInfo.website ? `Website: ${personalInfo.website}` : ""}
          </div>
        `
            : ""
        }
      </div>

      <!-- Professional Summary -->
      ${
        personalInfo.summary
          ? `
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${template.colors.primary}; margin: 0 0 10px 0; letter-spacing: 1px;">Professional Summary</h3>
          <p style="margin: 0; text-align: justify;">${personalInfo.summary}</p>
        </div>
      `
          : ""
      }

      <!-- Experience -->
      ${
        experience.length > 0 && experience[0].title
          ? `
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${template.colors.primary}; margin: 0 0 15px 0; letter-spacing: 1px;">Professional Experience</h3>
          ${experience
            .map(
              (exp) => `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <h4 style="font-size: 13px; font-weight: bold; margin: 0; color: ${template.colors.text};">${exp.title}</h4>
                <span style="font-size: 11px; color: ${template.colors.secondary}; font-style: italic;">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div style="font-size: 12px; color: ${template.colors.secondary}; margin-bottom: 8px; font-style: italic;">${exp.company}, ${exp.location}</div>
              <div style="font-size: 11px; white-space: pre-line; text-align: justify;">${exp.description}</div>
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
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${template.colors.primary}; margin: 0 0 15px 0; letter-spacing: 1px;">Education</h3>
          ${education
            .map(
              (edu) => `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <h4 style="font-size: 13px; font-weight: bold; margin: 0; color: ${template.colors.text};">${edu.degree}</h4>
                <span style="font-size: 11px; color: ${template.colors.secondary}; font-style: italic;">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
              </div>
              <div style="font-size: 12px; color: ${template.colors.secondary}; margin-bottom: 4px; font-style: italic;">${edu.institution}, ${edu.location}</div>
              ${edu.description ? `<div style="font-size: 11px; white-space: pre-line;">${edu.description}</div>` : ""}
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
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${template.colors.primary}; margin: 0 0 10px 0; letter-spacing: 1px;">Core Competencies</h3>
          <div style="font-size: 11px; line-height: 1.8;">${skills.join(" • ")}</div>
        </div>
      `
          : ""
      }

      <!-- Certifications -->
      ${
        certifications.length > 0 && certifications[0].name
          ? `
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 14px; font-weight: bold; text-transform: uppercase; color: ${template.colors.primary}; margin: 0 0 15px 0; letter-spacing: 1px;">Certifications</h3>
          ${certifications
            .map(
              (cert) => `
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h4 style="font-size: 12px; font-weight: bold; margin: 0; color: ${template.colors.text};">${cert.name}</h4>
                <span style="font-size: 11px; color: ${template.colors.secondary}; font-style: italic;">${cert.date}</span>
              </div>
              <div style="font-size: 11px; color: ${template.colors.secondary}; font-style: italic;">${cert.issuer}</div>
              ${cert.description ? `<div style="font-size: 10px; margin-top: 4px;">${cert.description}</div>` : ""}
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
    <div style="font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 0.75in; background: ${template.colors.background}; color: ${template.colors.text}; line-height: 1.5;">
      <!-- Header -->
      <div style="margin-bottom: 35px; position: relative;">
        <div style="background: linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary}); padding: 30px; margin: -0.75in -0.75in 25px -0.75in; color: white;">
          <h1 style="font-size: 32px; font-weight: 300; margin: 0 0 8px 0; letter-spacing: 2px;">${personalInfo.name || "Your Name"}</h1>
          <h2 style="font-size: 18px; font-weight: 400; margin: 0 0 15px 0; opacity: 0.9;">${personalInfo.title || "Professional Title"}</h2>
          <div style="font-size: 14px; opacity: 0.9;">
            ${personalInfo.email ? `${personalInfo.email} ` : ""}
            ${personalInfo.phone ? `• ${personalInfo.phone} ` : ""}
            ${personalInfo.location ? `• ${personalInfo.location}` : ""}
          </div>
          ${
            personalInfo.linkedin || personalInfo.website
              ? `
            <div style="font-size: 13px; margin-top: 8px; opacity: 0.8;">
              ${personalInfo.linkedin ? `${personalInfo.linkedin}` : ""}
              ${personalInfo.linkedin && personalInfo.website ? " • " : ""}
              ${personalInfo.website ? `${personalInfo.website}` : ""}
            </div>
          `
              : ""
          }
        </div>
      </div>

      <!-- Professional Summary -->
      ${
        personalInfo.summary
          ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 12px 0; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.colors.primary}; border-radius: 2px;"></span>
            About Me
          </h3>
          <p style="margin: 0; font-size: 13px; text-align: justify; color: ${template.colors.text};">${personalInfo.summary}</p>
        </div>
      `
          : ""
      }

      <!-- Experience -->
      ${
        experience.length > 0 && experience[0].title
          ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 20px 0; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.colors.primary}; border-radius: 2px;"></span>
            Experience
          </h3>
          ${experience
            .map(
              (exp) => `
            <div style="margin-bottom: 25px; position: relative; padding-left: 15px;">
              <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background: ${template.colors.secondary}; border-radius: 50%;"></div>
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                <h4 style="font-size: 14px; font-weight: 600; margin: 0; color: ${template.colors.text};">${exp.title}</h4>
                <span style="font-size: 12px; color: ${template.colors.secondary}; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; white-space: nowrap; margin-left: 15px;">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div style="font-size: 13px; color: ${template.colors.secondary}; margin-bottom: 10px; font-weight: 500;">${exp.company} • ${exp.location}</div>
              <div style="font-size: 12px; white-space: pre-line; text-align: justify; line-height: 1.6;">${exp.description}</div>
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
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 20px 0; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.colors.primary}; border-radius: 2px;"></span>
            Education
          </h3>
          ${education
            .map(
              (edu) => `
            <div style="margin-bottom: 20px; position: relative; padding-left: 15px;">
              <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background: ${template.colors.secondary}; border-radius: 50%;"></div>
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                <h4 style="font-size: 14px; font-weight: 600; margin: 0; color: ${template.colors.text};">${edu.degree}</h4>
                <span style="font-size: 12px; color: ${template.colors.secondary}; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; white-space: nowrap; margin-left: 15px;">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
              </div>
              <div style="font-size: 13px; color: ${template.colors.secondary}; margin-bottom: 8px; font-weight: 500;">${edu.institution} • ${edu.location}</div>
              ${edu.description ? `<div style="font-size: 12px; white-space: pre-line; line-height: 1.5;">${edu.description}</div>` : ""}
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
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 15px 0; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.colors.primary}; border-radius: 2px;"></span>
            Skills
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${skills
              .map(
                (skill) => `
              <span style="background: linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.secondary}15); color: ${template.colors.primary}; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 500; border: 1px solid ${template.colors.primary}30;">${skill}</span>
            `,
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- Certifications -->
      ${
        certifications.length > 0 && certifications[0].name
          ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 600; color: ${template.colors.primary}; margin: 0 0 20px 0; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: ${template.colors.primary}; border-radius: 2px;"></span>
            Certifications
          </h3>
          ${certifications
            .map(
              (cert) => `
            <div style="margin-bottom: 18px; position: relative; padding-left: 15px;">
              <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background: ${template.colors.secondary}; border-radius: 50%;"></div>
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h4 style="font-size: 13px; font-weight: 600; margin: 0 0 4px 0; color: ${template.colors.text};">${cert.name}</h4>
                  <div style="font-size: 12px; color: ${template.colors.secondary}; font-weight: 500;">${cert.issuer}</div>
                  ${cert.description ? `<div style="font-size: 11px; margin-top: 6px; line-height: 1.4;">${cert.description}</div>` : ""}
                </div>
                <span style="font-size: 11px; color: ${template.colors.secondary}; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; white-space: nowrap; margin-left: 15px;">${cert.date}</span>
              </div>
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

export const renderATSOptimizedTemplate = (cvData: CVData, template: CVTemplate): string => {
  const { personalInfo, experience, education, skills, certifications } = cvData

  return `
    <div style="font-family: 'Arial', sans-serif; max-width: 8.5in; margin: 0 auto; padding: 1in; background: ${template.colors.background}; color: ${template.colors.text}; line-height: 1.6;">
      <!-- Header -->
      <div style="text-align: left; margin-bottom: 25px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 6px 0; color: ${template.colors.text};">${personalInfo.name || "Your Name"}</h1>
        <h2 style="font-size: 16px; font-weight: normal; margin: 0 0 10px 0; color: ${template.colors.secondary};">${personalInfo.title || "Professional Title"}</h2>
        <div style="font-size: 12px; color: ${template.colors.text}; margin-bottom: 4px;">
          ${personalInfo.email ? `Email: ${personalInfo.email}` : ""}
          ${personalInfo.phone ? ` | Phone: ${personalInfo.phone}` : ""}
          ${personalInfo.location ? ` | Location: ${personalInfo.location}` : ""}
        </div>
        ${
          personalInfo.linkedin || personalInfo.website
            ? `
          <div style="font-size: 12px; color: ${template.colors.text};">
            ${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ""}
            ${personalInfo.linkedin && personalInfo.website ? " | " : ""}
            ${personalInfo.website ? `Website: ${personalInfo.website}` : ""}
          </div>
        `
            : ""
        }
      </div>

      <!-- Professional Summary -->
      ${
        personalInfo.summary
          ? `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 8px 0; text-transform: uppercase;">PROFESSIONAL SUMMARY</h3>
          <p style="margin: 0; font-size: 12px; text-align: justify;">${personalInfo.summary}</p>
        </div>
      `
          : ""
      }

      <!-- Core Skills -->
      ${
        skills.length > 0 && skills[0]
          ? `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 8px 0; text-transform: uppercase;">CORE SKILLS</h3>
          <div style="font-size: 12px; line-height: 1.8;">${skills.join(" | ")}</div>
        </div>
      `
          : ""
      }

      <!-- Professional Experience -->
      ${
        experience.length > 0 && experience[0].title
          ? `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; text-transform: uppercase;">PROFESSIONAL EXPERIENCE</h3>
          ${experience
            .map(
              (exp) => `
            <div style="margin-bottom: 18px;">
              <div style="margin-bottom: 4px;">
                <strong style="font-size: 13px; color: ${template.colors.text};">${exp.title}</strong>
                <span style="font-size: 12px; color: ${template.colors.secondary}; float: right;">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div style="font-size: 12px; color: ${template.colors.secondary}; margin-bottom: 6px;">${exp.company} | ${exp.location}</div>
              <div style="font-size: 11px; white-space: pre-line; text-align: justify;">${exp.description}</div>
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
          <h3 style="font-size: 14px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; text-transform: uppercase;">EDUCATION</h3>
          ${education
            .map(
              (edu) => `
            <div style="margin-bottom: 15px;">
              <div style="margin-bottom: 4px;">
                <strong style="font-size: 13px; color: ${template.colors.text};">${edu.degree}</strong>
                <span style="font-size: 12px; color: ${template.colors.secondary}; float: right;">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
              </div>
              <div style="font-size: 12px; color: ${template.colors.secondary}; margin-bottom: 4px;">${edu.institution} | ${edu.location}</div>
              ${edu.description ? `<div style="font-size: 11px; white-space: pre-line;">${edu.description}</div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Certifications -->
      ${
        certifications.length > 0 && certifications[0].name
          ? `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; color: ${template.colors.primary}; margin: 0 0 12px 0; text-transform: uppercase;">CERTIFICATIONS</h3>
          ${certifications
            .map(
              (cert) => `
            <div style="margin-bottom: 12px;">
              <div style="margin-bottom: 4px;">
                <strong style="font-size: 12px; color: ${template.colors.text};">${cert.name}</strong>
                <span style="font-size: 11px; color: ${template.colors.secondary}; float: right;">${cert.date}</span>
              </div>
              <div style="font-size: 11px; color: ${template.colors.secondary};">${cert.issuer}</div>
              ${cert.description ? `<div style="font-size: 10px; margin-top: 4px;">${cert.description}</div>` : ""}
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

export const renderTemplate = (cvData: CVData, template: CVTemplate): string => {
  switch (template.id) {
    case "traditional":
      return renderTraditionalTemplate(cvData, template)
    case "modern":
      return renderModernTemplate(cvData, template)
    case "ats-optimized":
      return renderATSOptimizedTemplate(cvData, template)
    default:
      return renderATSOptimizedTemplate(cvData, template)
  }
}
