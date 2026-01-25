import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { AnalyticsData } from "@/lib/analytics"

export function AnalyticsMetrics({ data }: { data: AnalyticsData }) {
    const totalDrivers = data.driverStats.length
    const activeDrivers = data.driverStats.filter(d => d.total_routes > 0).length
    const avgDriverEfficiency = Math.round(
        data.driverStats.reduce((acc, driver) => {
            const efficiency = (driver.completed_routes / driver.total_routes) * 100 || 0
            return acc + efficiency
        }, 0) / totalDrivers
    ) || 0

    const totalRouteCompletion = data.routePerformance.reduce((acc, route) => acc + Number(route.completion_rate), 0) / data.routePerformance.length || 0

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
            label: "Active Drivers",
            value: `${activeDrivers}/${totalDrivers}`,
            trend: activeDrivers > totalDrivers * 0.8 ? "up" : "down",
            description: "Drivers on duty",
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
        {
            label: "Driver Efficiency",
            value: `${avgDriverEfficiency}%`,
            trend: avgDriverEfficiency >= 85 ? "up" : avgDriverEfficiency >= 70 ? null : "down",
            description: "Average completion rate",
        },
        {
            label: "Route Completion",
            value: `${Math.round(totalRouteCompletion)}%`,
            trend: totalRouteCompletion >= 90 ? "up" : totalRouteCompletion >= 75 ? null : "down",
            description: "Overall route success rate",
        },
        {
            label: "Total Collections",
            value: data.driverStats.reduce((acc, driver) => acc + driver.total_collections, 0),
            trend: "up",
            description: "All-time collections",
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