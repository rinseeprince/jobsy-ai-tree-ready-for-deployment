// Industry-specific rules and data for CV analysis

export interface IndustryRules {
  preferredTerms: string[]
  requiredSections: string[]
  preferredLength: string
  culturalFit: string
}

export const INDUSTRY_RULES: Record<string, IndustryRules> = {
  technology: {
    preferredTerms: ["React", "JavaScript", "API", "Node.js", "Python", "AWS", "Docker", "Git"],
    requiredSections: ["Skills", "Projects", "GitHub"],
    preferredLength: "1-2 pages",
    culturalFit: "Innovation-focused, results-driven",
  },
  healthcare: {
    preferredTerms: ["Patient care", "Clinical", "Medical", "Healthcare", "Treatment", "Diagnosis"],
    requiredSections: ["Certifications", "Clinical Experience"],
    preferredLength: "2-3 pages",
    culturalFit: "Patient-centered, detail-oriented",
  },
  finance: {
    preferredTerms: ["Financial analysis", "Risk management", "Investment", "Portfolio", "Compliance"],
    requiredSections: ["Certifications", "Quantified Achievements"],
    preferredLength: "1-2 pages",
    culturalFit: "Analytical, compliance-focused",
  },
  marketing: {
    preferredTerms: ["Campaign", "Brand", "Digital marketing", "Analytics", "ROI", "Conversion"],
    requiredSections: ["Portfolio", "Campaign Results"],
    preferredLength: "1-2 pages",
    culturalFit: "Creative, data-driven",
  },
  education: {
    preferredTerms: ["Curriculum", "Teaching", "Student", "Learning", "Assessment", "Classroom"],
    requiredSections: ["Teaching Experience", "Education"],
    preferredLength: "2-3 pages",
    culturalFit: "Student-focused, collaborative",
  },
}

export const WEAK_TO_STRONG_VERBS: Record<string, string[]> = {
  helped: ["facilitated", "supported", "enabled", "assisted"],
  "worked on": ["developed", "implemented", "executed", "delivered"],
  "responsible for": ["managed", "oversaw", "directed", "led"],
  did: ["accomplished", "achieved", "completed", "executed"],
  made: ["created", "developed", "built", "designed"],
  got: ["achieved", "obtained", "secured", "earned"],
  used: ["utilized", "leveraged", "employed", "applied"],
  tried: ["attempted", "endeavored", "pursued", "initiated"],
}
