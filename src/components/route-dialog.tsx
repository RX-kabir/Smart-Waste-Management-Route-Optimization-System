"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Bin, WasteRoute } from "@/data/mockData"

interface RouteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bins: Bin[]
    onSave: (route: WasteRoute) => void
}

export function RouteDialog({ open, onOpenChange, bins, onSave }: RouteDialogProps) {
    const [loading, setLoading] = useState(false)
    const [routeName, setRouteName] = useState("")
    const [selectedBins, setSelectedBins] = useState<string[]>([])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedBins.length === 0) {
            alert("Please select at least one bin")
            return
        }

        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const newRoute: WasteRoute = {
            id: `route-${Date.now()}`,
            name: routeName,
            status: "PENDING",
            assignedDriver: "",
            stops: selectedBins,
            estimatedDuration: selectedBins.length * 15 // Mock estimation
        }

        onSave(newRoute)
        setLoading(false)
        onOpenChange(false)
        setRouteName("")
        setSelectedBins([])
    }

    const toggleBin = (binId: string) => {
        setSelectedBins((prev) => (prev.includes(binId) ? prev.filter((id) => id !== binId) : [...prev, binId]))
    }

    const priorityBins = bins.filter((b) => b.status === "OVERFLOWING" || b.status === "NEEDS_PICKUP")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Collection Route</DialogTitle>
                    <DialogDescription>Select bins to include in the route</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="route_name">Route Name</Label>
                            <Input
                                id="route_name"
                                value={routeName}
                                onChange={(e) => setRouteName(e.target.value)}
                                placeholder="Morning Collection Route"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Select Bins (Priority bins shown first)</Label>
                            <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-2">
                                {priorityBins.length > 0 && (
                                    <>
                                        <div className="text-sm font-medium text-slate-700 mb-2">Priority Bins</div>
                                        {priorityBins.map((bin) => (
                                            <div key={bin.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded">
                                                <Checkbox
                                                    id={`bin-${bin.id}`}
                                                    checked={selectedBins.includes(bin.id)}
                                                    onCheckedChange={() => toggleBin(bin.id)}
                                                />
                                                <label htmlFor={`bin-${bin.id}`} className="flex-1 text-sm cursor-pointer">
                                                    <span className="font-medium">{bin.binId}</span> - {bin.location}
                                                    <span className="ml-2 text-xs text-slate-600">
                                                        ({bin.currentFillLevel}/{bin.capacity})
                                                    </span>
                                                </label>
                                            </div>
                                        ))}
                                        <div className="border-t my-2" />
                                    </>
                                )}
                                <div className="text-sm font-medium text-slate-700 mb-2">Other Bins</div>
                                {bins
                                    .filter((b) => b.status === "OK")
                                    .map((bin) => (
                                        <div key={bin.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded">
                                            <Checkbox
                                                id={`bin-${bin.id}`}
                                                checked={selectedBins.includes(bin.id)}
                                                onCheckedChange={() => toggleBin(bin.id)}
                                            />
                                            <label htmlFor={`bin-${bin.id}`} className="flex-1 text-sm cursor-pointer">
                                                <span className="font-medium">{bin.binId}</span> - {bin.location}
                                                <span className="ml-2 text-xs text-slate-600">
                                                    ({bin.currentFillLevel}/{bin.capacity})
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                            </div>
                            <p className="text-sm text-slate-600">{selectedBins.length} bins selected</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Route"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}