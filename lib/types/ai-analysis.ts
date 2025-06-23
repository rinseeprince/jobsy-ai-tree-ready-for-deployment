// AI Analysis Types
import { type CVData } from "@/lib/cv-templates"

export interface AIAnalysisRequest {
  cvData: CVData
  jobDescription?: string
  targetIndustry?: string
  analysisTypes: string[]
}

export interface AIAnalysisResponse {
  success: boolean
  results: {
    atsScore?: ATSScore
    contentQuality?: ContentQuality
    designScore?: DesignScore
    lengthAnalysis?: LengthAnalysis
    keywordAnalysis?: KeywordAnalysis
  }
  tokensUsed?: number
  cost?: number
  error?: string
}

export interface KeywordItem {
  keyword: string
  importance: ImportanceLevel
  found?: boolean
  context?: string
  frequency?: number
  cvMatches?: number
  density?: number
}

export type ImportanceLevel = 'high' | 'medium' | 'low' | 'Critical' | 'Important'

export interface ATSScore {
  overall: number
  keywordMatch?: number
  contentQuality?: number
  formatting?: number
  breakdown?: {
    formatting: number
    keywords: number
    structure: number
    readability: number
    fileFormat: number
  }
  recommendations?: string[]
  passRate?: string
}

export interface ContentQuality {
  score?: number
  issues?: GrammarIssue[]
  suggestions?: string[]
  overall?: number
  grammar?: GrammarAnalysis
  impact?: ImpactAnalysis
  clarity?: ClarityAnalysis
}

export interface GrammarIssue {
  type: string
  message?: string
  position?: number
  suggestion?: string
  text?: string
  severity?: string
}

export interface DesignScore {
  overall: number
  layout: {
    score: number
    whitespace: number
    margins: string
    sections: string
  }
  typography: {
    score: number
    fontConsistency: boolean
    fontSize: string
    hierarchy: string
  }
  professionalism: {
    score: number
    colorScheme: string
    graphics: string
  }
}

export interface LengthAnalysis {
  overall: number
  currentStats: {
    pages: number
    words: number
    characters: number
    sections: Array<{
      section: string
      words: number
      recommended: number
      status: string
    }>
  }
  industryBenchmark: {
    idealPages: string
    idealWords: number
    maxWords: number
    minWords: number
  }
  recommendations: {
    action: string
    priority: string
    suggestions: string[]
  }
}

export interface KeywordAnalysis {
  overallMatch: number
  topKeywords: KeywordItem[]
  missing: string[]
  underused: string[]
  overused: string[]
  recommendations: string[]
}

export interface GrammarAnalysis {
  score: number
  issues: GrammarIssue[]
}

export interface ImpactAnalysis {
  score: number
  weakVerbs: string[]
  missingQuantification: string[]
  passiveVoiceCount: number
}

export interface ClarityAnalysis {
  score: number
  jargonWords: string[]
  readabilityScore: number
  suggestions: string[]
}

export {}
 