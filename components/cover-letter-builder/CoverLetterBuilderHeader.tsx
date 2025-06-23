"use client"

import { Wand2 } from "lucide-react"

interface CoverLetterBuilderHeaderProps {
  completion?: number
}

export const CoverLetterBuilderHeader = ({ completion = 0 }: CoverLetterBuilderHeaderProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <Wand2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cover Letter Generator</h1>
          <p className="text-gray-600">Create and customize your professional cover letter</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-gray-600">Completion</div>
          <div className="text-2xl font-bold text-blue-600">{completion}%</div>
        </div>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completion}%` }}></div>
        </div>
      </div>
    </div>
  )
}

export default CoverLetterBuilderHeader;
