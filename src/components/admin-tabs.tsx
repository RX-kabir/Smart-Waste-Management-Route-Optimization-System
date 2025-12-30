"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BinsManagement } from "@/components/bins-management"
import { RoutesManagement } from "./routes-management"
import { ActivityLogsView } from "./activity-logs-view"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Bin, WasteRoute, ActivityLog } from "@/data/mockData"

interface AdminTabsProps {
    bins: Bin[]
    routes: WasteRoute[]
    activityLogs: ActivityLog[]
}

export function AdminTabs({ bins, routes, activityLogs }: AdminTabsProps) {
    const navigate = useNavigate()

    return (
        <div className="space-y-4" >
            <div className="flex justify-end" >
                <Button onClick={() => navigate("/analytics")} variant="outline" >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                </Button>
            </div>

            < Tabs defaultValue="bins" className="space-y-4" >
                <TabsList>
                    <TabsTrigger value="bins" > Bins Management </TabsTrigger>
                    < TabsTrigger value="routes" > Routes Management </TabsTrigger>
                    < TabsTrigger value="activity" > Activity Logs </TabsTrigger>
                </TabsList>

                < TabsContent value="bins" className="space-y-4" >
                    <BinsManagement initialBins={bins} />
                </TabsContent>

                < TabsContent value="routes" className="space-y-4" >
                    <RoutesManagement initialRoutes={routes} initialBins={bins} />
                </TabsContent>

                < TabsContent value="activity" className="space-y-4" >
                    <ActivityLogsView logs={activityLogs} />
                </TabsContent>
            </Tabs>
        </div>
    )
}