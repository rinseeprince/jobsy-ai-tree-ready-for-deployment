import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ 
  icon: Icon = Plus, 
  title = "No applications yet", 
  description = "Start tracking your job applications to get insights and improve your job search.",
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-gray-50">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        {description}
      </p>
      {action || (
        <Link href="/generate">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      )}
    </div>
  )
}
