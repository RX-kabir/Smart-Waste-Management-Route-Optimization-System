"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react"
import { WasteRoute } from "@/data/mockData"

interface RouteTrackingProps {
    routes: WasteRoute[]
}

export function RouteTracking({ routes }: RouteTrackingProps) {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000) // Update every minute
        return () => clearInterval(timer)
    }, [])

    const getRouteStatus = (route: WasteRoute) => {
        if (route.status === 'COMPLETED') return { status: 'completed', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        if (route.status === 'IN_PROGRESS') return { status: 'in_progress', color: 'text-blue-600', bg: 'bg-blue-50' }
        return { status: 'pending', color: 'text-slate-600', bg: 'bg-slate-50' }
    }

    const getEstimatedCompletion = (route: WasteRoute) => {
        if (route.status === 'COMPLETED') return 100
        if (route.status === 'IN_PROGRESS') return Math.floor(Math.random() * 60) + 40 // Mock progress
        return 0
    }

    const getTimeRemaining = (route: WasteRoute) => {
        if (route.status === 'COMPLETED') return 'Completed'
        if (route.status === 'PENDING') return `Starts in ${Math.floor(Math.random() * 60)} min`

        const remaining = Math.floor(Math.random() * route.estimatedDuration)
        return `${remaining} min remaining`
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Route Tracking</h2>
                <p className="text-slate-600">Real-time monitoring of active waste collection routes</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {routes.map((route) => {
                    const status = getRouteStatus(route)
                    const progress = getEstimatedCompletion(route)
                    const timeRemaining = getTimeRemaining(route)

                    return (
                        <Card key={route.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{route.name}</CardTitle>
                                    <Badge variant="outline" className={`${status.color} ${status.bg} border-current`}>
                                        {route.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <CardDescription className="flex items-center space-x-2">
                                    <Truck className="h-4 w-4" />
                                    <span>{route.assignedDriver}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Progress</span>
                                        <span className="font-medium">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600">{route.stops.length} stops</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600">{timeRemaining}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t">
                                    <div className="text-sm text-slate-600 mb-2">Current Activity</div>
                                    <div className="flex items-center space-x-2">
                                        {route.status === 'COMPLETED' ? (
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        ) : route.status === 'IN_PROGRESS' ? (
                                            <Truck className="h-4 w-4 text-blue-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-slate-400" />
                                        )}
                                        <span className="text-sm">
                                            {route.status === 'COMPLETED'
                                                ? 'Route completed successfully'
                                                : route.status === 'IN_PROGRESS'
                                                ? `En route to next collection point`
                                                : 'Waiting for driver assignment'
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500">
                                    Last updated: {currentTime.toLocaleTimeString()}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Route Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Route Summary</CardTitle>
                    <CardDescription>Overview of all routes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                                {routes.filter(r => r.status === 'COMPLETED').length}
                            </div>
                            <div className="text-sm text-slate-600">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {routes.filter(r => r.status === 'IN_PROGRESS').length}
                            </div>
                            <div className="text-sm text-slate-600">In Progress</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-600">
                                {routes.filter(r => r.status === 'PENDING').length}
                            </div>
                            <div className="text-sm text-slate-600">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                                {routes.reduce((acc, r) => acc + r.stops.length, 0)}
                            </div>
                            <div className="text-sm text-slate-600">Total Stops</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}