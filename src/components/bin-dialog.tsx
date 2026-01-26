"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Bin } from "@/data/mockData"

interface BinDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bin: Bin | null
    onSave: (bin: Bin) => void
}

export function BinDialog({ open, onOpenChange, bin, onSave }: BinDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        binId: "",
        location: "",
        latitude: "",
        longitude: "",
        capacity: "100",
        currentFillLevel: "0",
    })

    useEffect(() => {
        if (bin) {
            setFormData({
                binId: bin.binId,
                location: bin.location,
                latitude: bin.latitude.toString(),
                longitude: bin.longitude.toString(),
                capacity: bin.capacity.toString(),
                currentFillLevel: bin.currentFillLevel.toString(),
            })
        } else {
            setFormData({
                binId: "",
                location: "",
                latitude: "",
                longitude: "",
                capacity: "100",
                currentFillLevel: "0",
            })
        }
    }, [bin, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const newBin: Bin = {
            id: bin ? bin.id : `new-${Date.now()}`,
            binId: formData.binId,
            location: formData.location,
            latitude: Number.parseFloat(formData.latitude),
            longitude: Number.parseFloat(formData.longitude),
            capacity: Number.parseInt(formData.capacity),
            currentFillLevel: Number.parseInt(formData.currentFillLevel),
            status: bin ? bin.status : "OK", // Default status
            lastEmptied: bin ? bin.lastEmptied : new Date(),
            zone: bin ? bin.zone : "",
            lastUpdated: bin ? bin.lastUpdated : new Date(),
        }

        onSave(newBin)
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{bin ? "Edit Bin" : "Add New Bin"}</DialogTitle>
                    <DialogDescription>
                        {bin ? "Update bin information" : "Create a new waste collection point"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="binId">Bin ID</Label>
                            <Input
                                id="binId"
                                value={formData.binId}
                                onChange={(e) => setFormData({ ...formData, binId: e.target.value })}
                                placeholder="BIN-001"
                                required
                                disabled={!!bin}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Main Street & 1st Ave"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="0.000001"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    placeholder="40.7128"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="0.000001"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    placeholder="-74.0060"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currentFillLevel">Current Fill Level</Label>
                                <Input
                                    id="currentFillLevel"
                                    type="number"
                                    value={formData.currentFillLevel}
                                    onChange={(e) => setFormData({ ...formData, currentFillLevel: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : bin ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}