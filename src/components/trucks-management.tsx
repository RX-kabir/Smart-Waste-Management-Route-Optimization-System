"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Truck, Fuel, Wrench, MapPin, Clock, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Truck {
    id: string
    licensePlate: string
    model: string
    capacity: number // cubic meters
    status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_SERVICE"
    fuelLevel: number // percentage
    currentLocation?: string
    assignedDriver?: string
    lastMaintenance: Date
    mileage: number
    nextServiceDue: Date
}

const mockTrucks: Truck[] = [
    {
        id: "truck-1",
        licensePlate: "WST-001",
        model: "Ford Transit 350",
        capacity: 12,
        status: "IN_USE",
        fuelLevel: 65,
        currentLocation: "Downtown District",
        assignedDriver: "John Driver",
        lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        mileage: 45230,
        nextServiceDue: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
    {
        id: "truck-2",
        licensePlate: "WST-002",
        model: "Chevrolet Express",
        capacity: 15,
        status: "AVAILABLE",
        fuelLevel: 80,
        lastMaintenance: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        mileage: 38750,
        nextServiceDue: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000), // 52 days from now
    },
    {
        id: "truck-3",
        licensePlate: "WST-003",
        model: "Ram ProMaster",
        capacity: 10,
        status: "MAINTENANCE",
        fuelLevel: 45,
        lastMaintenance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        mileage: 52180,
        nextServiceDue: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
    },
]

export function TrucksManagement() {
    const [trucks, setTrucks] = useState<Truck[]>(mockTrucks)
    const [dialogOpen, setDialogOpen] = useState(false)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "AVAILABLE":
                return (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">
                        Available
                    </Badge>
                )
            case "IN_USE":
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                        In Use
                    </Badge>
                )
            case "MAINTENANCE":
                return (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
                        Maintenance
                    </Badge>
                )
            case "OUT_OF_SERVICE":
                return (
                    <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                        Out of Service
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getFuelColor = (level: number) => {
        if (level >= 70) return "text-emerald-600"
        if (level >= 30) return "text-yellow-600"
        return "text-red-600"
    }

    const getServiceStatus = (nextService: Date) => {
        const daysUntil = Math.ceil((nextService.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 7) return { status: "Due Soon", color: "text-red-600", urgent: true }
        if (daysUntil <= 30) return { status: "Upcoming", color: "text-yellow-600", urgent: false }
        return { status: "OK", color: "text-emerald-600", urgent: false }
    }

    const handleAddTruck = (truckData: Omit<Truck, 'id' | 'lastMaintenance' | 'mileage'>) => {
        const newTruck: Truck = {
            ...truckData,
            id: `truck-${Date.now()}`,
            lastMaintenance: new Date(),
            mileage: 0,
        }
        setTrucks([...trucks, newTruck])
        setDialogOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Trucks Management</h2>
                    <p className="text-slate-600">Monitor and manage waste collection vehicles</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Truck
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Truck</DialogTitle>
                            <DialogDescription>
                                Enter the truck information to add it to the fleet.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target as HTMLFormElement)
                            handleAddTruck({
                                licensePlate: formData.get('licensePlate') as string,
                                model: formData.get('model') as string,
                                capacity: parseInt(formData.get('capacity') as string),
                                status: formData.get('status') as Truck['status'],
                                fuelLevel: parseInt(formData.get('fuelLevel') as string) || 100,
                                nextServiceDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
                            })
                        }} className="space-y-4">
                            <div>
                                <Label htmlFor="licensePlate">License Plate</Label>
                                <Input id="licensePlate" name="licensePlate" required />
                            </div>
                            <div>
                                <Label htmlFor="model">Model</Label>
                                <Input id="model" name="model" required />
                            </div>
                            <div>
                                <Label htmlFor="capacity">Capacity (m³)</Label>
                                <Input id="capacity" name="capacity" type="number" required />
                            </div>
                            <div>
                                <Label htmlFor="fuelLevel">Fuel Level (%)</Label>
                                <Input id="fuelLevel" name="fuelLevel" type="number" min="0" max="100" defaultValue="100" />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Available</SelectItem>
                                        <SelectItem value="IN_USE">In Use</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                        <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">Add Truck</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {trucks.map((truck) => {
                    const serviceStatus = getServiceStatus(truck.nextServiceDue)
                    return (
                        <Card key={truck.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center">
                                        <Truck className="h-5 w-5 mr-2" />
                                        {truck.licensePlate}
                                    </CardTitle>
                                    {getStatusBadge(truck.status)}
                                </div>
                                <CardDescription>{truck.model} • {truck.capacity}m³ capacity</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {/* Fuel Level */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="flex items-center">
                                                <Fuel className="h-4 w-4 mr-1" />
                                                Fuel Level
                                            </span>
                                            <span className={getFuelColor(truck.fuelLevel)}>
                                                {truck.fuelLevel}%
                                            </span>
                                        </div>
                                        <Progress value={truck.fuelLevel} className="h-2" />
                                    </div>

                                    {/* Service Status */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center">
                                            <Wrench className="h-4 w-4 mr-1" />
                                            Service
                                        </span>
                                        <span className={`font-medium ${serviceStatus.color}`}>
                                            {serviceStatus.status}
                                            {serviceStatus.urgent && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t">
                                    {truck.assignedDriver && (
                                        <div className="flex items-center text-sm text-slate-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Driver: {truck.assignedDriver}
                                        </div>
                                    )}
                                    {truck.currentLocation && (
                                        <div className="flex items-center text-sm text-slate-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Location: {truck.currentLocation}
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Mileage: {truck.mileage.toLocaleString()} km
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2">
                                        Last maintenance: {truck.lastMaintenance.toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Fleet Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Fleet Summary</CardTitle>
                    <CardDescription>Overview of truck fleet status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                                {trucks.filter(t => t.status === 'AVAILABLE').length}
                            </div>
                            <div className="text-sm text-slate-600">Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {trucks.filter(t => t.status === 'IN_USE').length}
                            </div>
                            <div className="text-sm text-slate-600">In Use</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {trucks.filter(t => t.status === 'MAINTENANCE').length}
                            </div>
                            <div className="text-sm text-slate-600">Maintenance</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">
                                {trucks.reduce((acc, t) => acc + t.capacity, 0)}
                            </div>
                            <div className="text-sm text-slate-600">Total Capacity (m³)</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}