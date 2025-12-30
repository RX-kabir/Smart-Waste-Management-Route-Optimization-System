"use client"

import { useState } from "react"
// import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Eye } from "lucide-react"
import { RouteDialog } from "./route-dialog"
import { Bin, WasteRoute } from "@/data/mockData"

export function RoutesManagement({
    initialRoutes,
    initialBins,
}: {
    initialRoutes: WasteRoute[]
    initialBins: Bin[]
}) {
    const [routes, setRoutes] = useState<WasteRoute[]>(initialRoutes)
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this route?")) return
        setRoutes(routes.filter((r) => r.id !== id))
    }

    const handleCreate = (route: WasteRoute) => {
        setRoutes([...routes, route])
        setDialogOpen(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="outline" className="border-slate-500 text-slate-700 bg-slate-50">
                        Pending
                    </Badge>
                )
            case "IN_PROGRESS":
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                        In Progress
                    </Badge>
                )
            case "COMPLETED":
                return (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">
                        Completed
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Collection Routes</CardTitle>
                            <CardDescription>Manage and optimize collection routes</CardDescription>
                        </div>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Route
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {routes.map((route) => (
                            <div key={route.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-slate-900">{route.name}</span>
                                        {getStatusBadge(route.status)}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {route.assignedDriver ? `Driver: ${route.assignedDriver}` : "No driver assigned"}
                                    </div>
                                    <div className="text-sm text-slate-600 mt-1">
                                        Stops: {route.stops.length} bins
                                        {route.estimatedDuration && ` • Est. Time: ${route.estimatedDuration} min`}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => console.log('View route', route.id)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(route.id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <RouteDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                bins={initialBins}
                onSave={handleCreate}
            />
        </>
    )
}