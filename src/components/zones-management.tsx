"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Edit, Trash2, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Zone {
    id: string
    name: string
    description: string
    priority: "HIGH" | "MEDIUM" | "LOW"
    binCount: number
    area: string // square kilometers
    supervisor?: string
    color: string
}

const mockZones: Zone[] = [
    {
        id: "zone-1",
        name: "Downtown District",
        description: "Central business district with high traffic and commercial areas",
        priority: "HIGH",
        binCount: 45,
        area: "2.3",
        supervisor: "John Smith",
        color: "#ef4444",
    },
    {
        id: "zone-2",
        name: "Residential North",
        description: "Northern residential neighborhoods with regular collection needs",
        priority: "MEDIUM",
        binCount: 67,
        area: "4.1",
        supervisor: "Sarah Johnson",
        color: "#f59e0b",
    },
    {
        id: "zone-3",
        name: "Industrial Park",
        description: "Manufacturing and industrial facilities with specialized waste handling",
        priority: "HIGH",
        binCount: 23,
        area: "1.8",
        supervisor: "Mike Davis",
        color: "#10b981",
    },
    {
        id: "zone-4",
        name: "Suburban East",
        description: "Eastern suburban areas with moderate collection frequency",
        priority: "LOW",
        binCount: 89,
        area: "6.2",
        supervisor: "Lisa Chen",
        color: "#3b82f6",
    },
]

export function ZonesManagement() {
    const [zones, setZones] = useState<Zone[]>(mockZones)
    const [dialogOpen, setDialogOpen] = useState(false)

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return (
                    <Badge variant="destructive" className="bg-red-500">
                        High Priority
                    </Badge>
                )
            case "MEDIUM":
                return (
                    <Badge variant="secondary" className="bg-yellow-500 text-yellow-900">
                        Medium Priority
                    </Badge>
                )
            case "LOW":
                return (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                        Low Priority
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const handleAddZone = (zoneData: Omit<Zone, 'id' | 'binCount'>) => {
        const newZone: Zone = {
            ...zoneData,
            id: `zone-${Date.now()}`,
            binCount: 0,
        }
        setZones([...zones, newZone])
        setDialogOpen(false)
    }

    const handleDeleteZone = (id: string) => {
        if (!confirm("Are you sure you want to delete this zone?")) return
        setZones(zones.filter(z => z.id !== id))
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Zones Management</h2>
                    <p className="text-slate-600">Manage geographic zones and collection areas</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Zone
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Zone</DialogTitle>
                            <DialogDescription>
                                Create a new geographic zone for waste collection management.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target as HTMLFormElement)
                            handleAddZone({
                                name: formData.get('name') as string,
                                description: formData.get('description') as string,
                                priority: formData.get('priority') as Zone['priority'],
                                area: formData.get('area') as string,
                                supervisor: formData.get('supervisor') as string || undefined,
                                color: formData.get('color') as string,
                            })
                        }} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Zone Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" required />
                            </div>
                            <div>
                                <Label htmlFor="priority">Priority Level</Label>
                                <Select name="priority" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">High Priority</SelectItem>
                                        <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                                        <SelectItem value="LOW">Low Priority</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="area">Area (km²)</Label>
                                <Input id="area" name="area" type="number" step="0.1" required />
                            </div>
                            <div>
                                <Label htmlFor="supervisor">Supervisor (Optional)</Label>
                                <Input id="supervisor" name="supervisor" />
                            </div>
                            <div>
                                <Label htmlFor="color">Zone Color</Label>
                                <Input id="color" name="color" type="color" defaultValue="#3b82f6" required />
                            </div>
                            <Button type="submit" className="w-full">Create Zone</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {zones.map((zone) => (
                    <Card key={zone.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: zone.color }}
                                    />
                                    <CardTitle className="text-lg">{zone.name}</CardTitle>
                                </div>
                                {getPriorityBadge(zone.priority)}
                            </div>
                            <CardDescription className="line-clamp-2">
                                {zone.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span>{zone.area} km²</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-slate-400" />
                                    <span>{zone.binCount} bins</span>
                                </div>
                            </div>

                            {zone.supervisor && (
                                <div className="text-sm text-slate-600">
                                    <strong>Supervisor:</strong> {zone.supervisor}
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 pt-2">
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteZone(zone.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Zone Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Zone Statistics</CardTitle>
                    <CardDescription>Overview of all managed zones</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                                {zones.length}
                            </div>
                            <div className="text-sm text-slate-600">Total Zones</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {zones.filter(z => z.priority === 'HIGH').length}
                            </div>
                            <div className="text-sm text-slate-600">High Priority</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                                {zones.reduce((acc, z) => acc + z.binCount, 0)}
                            </div>
                            <div className="text-sm text-slate-600">Total Bins</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                                {zones.reduce((acc, z) => acc + parseFloat(z.area), 0).toFixed(1)}
                            </div>
                            <div className="text-sm text-slate-600">Total Area (km²)</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}