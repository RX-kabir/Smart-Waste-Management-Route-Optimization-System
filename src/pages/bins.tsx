import { INITIAL_BINS, INITIAL_ROUTES, INITIAL_LOGS, getMockStatistics } from "@/data/mockData"
import { AppLayout } from "@/components/layout/AppLayout"
import { AdminTabs } from "@/components/admin-tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Route, TrendingUp, CheckCircle2 } from "lucide-react"

export default function AdminPage() {
    const bins = INITIAL_BINS
    const routes = INITIAL_ROUTES
    const activityLogs = INITIAL_LOGS
    const analytics = getMockStatistics()

    return (
        <AppLayout title="Admin Dashboard">
            <div className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-600 mt-1">Manage bins, routes, and system operations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Bins</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics.totalBins}</p>
                                </div>
                                <Trash2 className="h-8 w-8 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Routes</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics.totalRoutes}</p>
                                </div>
                                <Route className="h-8 w-8 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Avg Fill Level</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics.avgFillLevel}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Completion Rate</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics.completionRate}%</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AdminTabs bins={bins} routes={routes} activityLogs={activityLogs} />
            </div>
        </AppLayout>
    )
}