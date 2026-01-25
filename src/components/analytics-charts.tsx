"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { AnalyticsData } from "@/lib/analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
    const binStatusData = data.binStatusDistribution.map((item) => ({
        name: item.status,
        value: Number(item.count),
    }))

    const collectionTrendData = data.collectionTrends
        .reverse()
        .map((item) => ({
            date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            collections: Number(item.collections),
        }))
        .slice(-14) // Last 14 days

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Bin Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Bin Status Distribution</CardTitle>
                    <CardDescription>Current status of all waste bins</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={binStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {binStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                        {binStatusData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-slate-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Collection Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Collection Trends</CardTitle>
                    <CardDescription>Daily collections over the last 14 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={collectionTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="collections" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Route Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Route Performance</CardTitle>
                    <CardDescription>Completion rates for recent routes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.routePerformance.map(route => ({
                                name: route.route_name.length > 12 ? route.route_name.substring(0, 12) + "..." : route.route_name,
                                completion: Number(route.completion_rate),
                                total: route.total_bins,
                                completed: route.completed_bins
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={10} />
                                <YAxis domain={[0, 100]} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="completion" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                        {data.routePerformance.slice(0, 3).map((route) => {
                            const completionRate = Number(route.completion_rate)
                            return (
                                <div key={route.route_name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-900">{route.route_name}</span>
                                        <span className="text-slate-600">
                                            {route.completed_bins}/{route.total_bins} bins ({completionRate}%)
                                        </span>
                                    </div>
                                    <Progress
                                        value={completionRate}
                                        className="h-2"
                                        indicatorClassName={completionRate === 100 ? "bg-emerald-500" : "bg-blue-500"}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Driver Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Driver Performance</CardTitle>
                    <CardDescription>Efficiency and activity metrics by driver</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.driverStats.map(driver => ({
                                name: driver.driver_name.split(' ')[0], // First name only for chart
                                routes: driver.total_routes,
                                completed: driver.completed_routes,
                                efficiency: Math.round((driver.completed_routes / driver.total_routes) * 100) || 0
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="routes" fill="#3b82f6" name="Total Routes" />
                                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                        {data.driverStats.map((driver) => {
                            const efficiency = Math.round((driver.completed_routes / driver.total_routes) * 100) || 0
                            return (
                                <div key={driver.driver_name} className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{driver.driver_name}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-slate-600">{driver.completed_routes}/{driver.total_routes} routes</span>
                                        <Badge variant={efficiency >= 90 ? "default" : efficiency >= 75 ? "secondary" : "destructive"}>
                                            {efficiency}%
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Driver Status Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Driver Status Overview</CardTitle>
                    <CardDescription>Current status of all drivers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.driverStats.map((driver) => {
                            const efficiency = Math.round((driver.completed_routes / driver.total_routes) * 100) || 0
                            const status = efficiency >= 90 ? "Excellent" : efficiency >= 75 ? "Good" : "Needs Improvement"
                            const statusColor = efficiency >= 90 ? "text-emerald-600" : efficiency >= 75 ? "text-blue-600" : "text-red-600"

                            return (
                                <div key={driver.driver_name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div>
                                            <div className="font-medium text-slate-900">{driver.driver_name}</div>
                                            <div className="text-sm text-slate-600">{driver.total_collections} total collections</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-medium ${statusColor}`}>{status}</div>
                                        <div className="text-sm text-slate-600">{efficiency}% efficiency</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Top Bins */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Most Frequently Collected Bins</CardTitle>
                    <CardDescription>Bins requiring the most attention in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {data.topBins.map((bin) => (
                            <div key={bin.bin_id} className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-semibold text-slate-900">{bin.bin_id}</div>
                                        <div className="text-sm text-slate-600">{bin.location}</div>
                                    </div>
                                    <Badge className="bg-blue-500">{bin.collections_count} collections</Badge>
                                </div>
                                <div className="text-sm text-slate-600 mt-2">
                                    Avg Fill Level: {Math.round(Number(bin.avg_fill_level))}%
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}