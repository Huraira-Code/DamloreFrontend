import { Badge } from "@/components/ui/badge";

interface StatusBarProps {
  statusCounts: {
    total: number;
    Raw: number;
    "In Progress": number;
    Ready: number;
    Delivered: number;
  };
}

export default function StatusBar({ statusCounts }: StatusBarProps) {
  const getPercentage = (count: number) => {
    return statusCounts.total > 0
      ? Math.round((count / statusCounts.total) * 100)
      : 0;
  };
  console.log("ms2", statusCounts);

  return (
    <div className="bg-white border-b" style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
      <div className="container py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">SHOT:</span>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-600 hover:bg-red-50"
              >
                {statusCounts.SHOT} ({getPercentage(statusCounts.SHOT)}%)
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">IN PROGRESS:</span>
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-600 hover:bg-orange-50"
              >
                {statusCounts["IN PROGRESS"]} (
                {getPercentage(statusCounts["IN PROGRESS"])}%)
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">READY:</span>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-600 hover:bg-green-50"
              >
                {statusCounts.READY} ({getPercentage(statusCounts.READY)}
                %)
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">DELIVERED:</span>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-600 hover:bg-blue-50"
              >
                {statusCounts.DELIVERED} (
                {getPercentage(statusCounts.DELIVERED)}%)
              </Badge>
            </div>
          </div>

          <div>
            <span className="font-medium">Total Shooting List:</span> {statusCounts.total}{" "}
            products
          </div>
        </div>
      </div>
    </div>
  );
}
