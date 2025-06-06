import { Badge } from "@/components/ui/badge"

interface StatusBarProps {
  statusCounts: {
    total: number
    Raw: number
    "In Progress": number
    Approved: number
    Delivered: number
  }
}

export default function StatusBar({ statusCounts }: StatusBarProps) {
  const getPercentage = (count: number) => {
    return statusCounts.total > 0 ? Math.round((count / statusCounts.total) * 100) : 0
  }

  return (
    <div className="bg-white border-b">
      <div className="container py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">Raw:</span>
              <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
                {statusCounts.Raw} ({getPercentage(statusCounts.Raw)}%)
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">In Progress:</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-600 hover:bg-orange-50">
                {statusCounts["In Progress"]} ({getPercentage(statusCounts["In Progress"])}%)
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Approved:</span>
              <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                {statusCounts.Approved} ({getPercentage(statusCounts.Approved)}%)
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Delivered:</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                {statusCounts.Delivered} ({getPercentage(statusCounts.Delivered)}%)
              </Badge>
            </div>
          </div>

          <div>
            <span className="font-medium">Total:</span> {statusCounts.total} products
          </div>
        </div>
      </div>
    </div>
  )
}
