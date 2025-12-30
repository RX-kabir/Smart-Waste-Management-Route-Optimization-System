import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { AnalyticsData } from "@/lib/analytics"

export function AnalyticsMetrics({ data }: { data: AnalyticsData }) {
    const metrics = [
        {
            label: "Total Bins",
            value: data.overview.total_bins,
            trend: null,
            description: "Active collection points",
        },
        {
            label: "Total Routes",
            value: data.overview.total_routes,
            trend: null,
            description: "Created routes",
        },
        {
            label: "Collections (30d)",
            value: data.overview.total_collections,
            trend: "up",
            description: "Bins collected this month",
        },
        {
            label: "Avg Fill Level",
            value: `${Math.round(Number(data.overview.avg_fill_level))}%`,
            trend: Number(data.overview.avg_fill_level) > 60 ? "up" : "down",
            description: "Current average capacity",
        },
    ]

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
                <Card key={metric.label}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                            {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-600" />}
                            {metric.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                            {metric.trend === null && <Minus className="h-4 w-4 text-slate-400" />}
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</div>
                        <p className="text-xs text-slate-500">{metric.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}