"use client"

import { Button } from "@/components/ui/button"
import { FileText, Layout, Eye } from "lucide-react"

interface CoverLetterBuilderTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const CoverLetterBuilderTabs = ({ activeTab, setActiveTab }: CoverLetterBuilderTabsProps) => {
  const tabs = [
    { id: "build", label: "Build", icon: FileText },
    { id: "templates", label: "Templates", icon: Layout },
    { id: "preview", label: "Preview", icon: Eye },
  ]

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Button>
        )
      })}
    </div>
  )
}

export default CoverLetterBuilderTabs;
