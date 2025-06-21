interface CVBuilderTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const CVBuilderTabs = ({ activeTab, setActiveTab }: CVBuilderTabsProps) => {
  return (
    <div className="bg-white rounded-xl border shadow-md p-4 mb-6 flex items-center justify-between">
      <div className="flex-1">{/* Empty space or could add search functionality later */}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("build")}
          className={`py-2 px-4 rounded-lg font-medium text-sm ${
            activeTab === "build"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Build CV
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`py-2 px-4 rounded-lg font-medium text-sm ${
            activeTab === "templates"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`py-2 px-4 rounded-lg font-medium text-sm ${
            activeTab === "preview"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab("optimize")}
          data-tab="optimize"
          className={`py-2 px-4 rounded-lg font-medium text-sm ${
            activeTab === "optimize"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          AI Optimize
        </button>
      </div>
    </div>
  )
} 