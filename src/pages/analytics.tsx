"use client"

import { useEffect, useState } from "react"
import { getAnalyticsData, type AnalyticsData } from "@/lib/analytics"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsMetrics } from "@/components/analytics-metrics"
import { AppLayout } from "@/components/layout/AppLayout"
import { Loader2 } from "lucide-react"

export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAnalyticsData()
                setAnalyticsData(data)
            } catch (error) {
                console.error("Failed to fetch analytics:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!analyticsData) {
        return <div>Failed to load data</div>
    }

    return (
        <AppLayout title="Analytics & Reports">
            <main className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
                    <p className="text-slate-600 mt-1">Comprehensive insights into waste management operations</p>
                </div>

                <AnalyticsMetrics data={analyticsData} />
                <AnalyticsCharts data={analyticsData} />
            </main>
        </AppLayout>
    )
}