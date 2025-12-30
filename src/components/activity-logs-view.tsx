import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityLog } from "@/data/mockData"
import { formatDistanceToNow } from "date-fns"

export function ActivityLogsView({ logs }: { logs: ActivityLog[] }) {
    const getActionBadge = (action: string) => {
        if (action.includes("created")) return <Badge className="bg-emerald-500">Created</Badge>
        if (action.includes("updated")) return <Badge className="bg-blue-500">Updated</Badge>
        if (action.includes("deleted")) return <Badge className="bg-red-500">Deleted</Badge>
        return <Badge variant="secondary">{action}</Badge>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Recent system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {logs.map((log) => (
                        <div key={log.id} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getActionBadge(log.action)}
                                    <span className="text-sm font-medium text-slate-900">{log.action}</span>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                            <div className="text-sm text-slate-600">{log.user ? `By ${log.user}` : "System"}</div>
                            {log.details && (
                                <div className="text-sm text-slate-600 mt-2 bg-white p-2 rounded border border-slate-200">
                                    {log.details}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}