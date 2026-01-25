"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Plus, Phone, Mail, MapPin, Clock, Truck } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Driver {
    id: string
    name: string
    email: string
    phone: string
    status: "AVAILABLE" | "ON_ROUTE" | "OFF_DUTY"
    currentRoute?: string
    totalRoutes: number
    completedRoutes: number
    totalCollections: number
    efficiency: number // percentage
    lastActive: Date
}

const mockDrivers: Driver[] = [
    {
        id: "driver-1",
        name: "John Driver",
        email: "john.driver@company.com",
        phone: "+1 (555) 123-4567",
        status: "ON_ROUTE",
        currentRoute: "Monday Morning Collection",
        totalRoutes: 45,
        completedRoutes: 42,
        totalCollections: 180,
        efficiency: 93,
        lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
        id: "driver-2",
        name: "Jane Doe",
        email: "jane.doe@company.com",
        phone: "+1 (555) 234-5678",
        status: "AVAILABLE",
        totalRoutes: 38,
        completedRoutes: 38,
        totalCollections: 156,
        efficiency: 97,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
        id: "driver-3",
        name: "Mike Johnson",
        email: "mike.johnson@company.com",
        phone: "+1 (555) 345-6789",
        status: "OFF_DUTY",
        totalRoutes: 52,
        completedRoutes: 48,
        totalCollections: 203,
        efficiency: 88,
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
]

export function DriversManagement() {
    const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)
    const [dialogOpen, setDialogOpen] = useState(false)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "AVAILABLE":
                return (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">
                        Available
                    </Badge>
                )
            case "ON_ROUTE":
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                        On Route
                    </Badge>
                )
            case "OFF_DUTY":
                return (
                    <Badge variant="outline" className="border-slate-500 text-slate-700 bg-slate-50">
                        Off Duty
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getEfficiencyColor = (efficiency: number) => {
        if (efficiency >= 95) return "text-emerald-600"
        if (efficiency >= 85) return "text-yellow-600"
        return "text-red-600"
    }

    const handleAddDriver = (driverData: Omit<Driver, 'id' | 'totalRoutes' | 'completedRoutes' | 'totalCollections' | 'efficiency'>) => {
        const newDriver: Driver = {
            ...driverData,
            id: `driver-${Date.now()}`,
            totalRoutes: 0,
            completedRoutes: 0,
            totalCollections: 0,
            efficiency: 0,
        }
        setDrivers([...drivers, newDriver])
        setDialogOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Drivers Management</h2>
                    <p className="text-slate-600">Manage drivers, track performance, and assign routes</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Driver
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Driver</DialogTitle>
                            <DialogDescription>
                                Enter the driver's information to add them to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target as HTMLFormElement)
                            handleAddDriver({
                                name: formData.get('name') as string,
                                email: formData.get('email') as string,
                                phone: formData.get('phone') as string,
                                status: formData.get('status') as Driver['status'],
                                lastActive: new Date(),
                            })
                        }} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" required />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Available</SelectItem>
                                        <SelectItem value="ON_ROUTE">On Route</SelectItem>
                                        <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">Add Driver</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {drivers.map((driver) => (
                    <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {driver.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {getStatusBadge(driver.status)}
                                        {driver.currentRoute && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Truck className="h-3 w-3 mr-1" />
                                                On Route
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {driver.email}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {driver.phone}
                                </div>
                                {driver.currentRoute && (
                                    <div className="flex items-center text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {driver.currentRoute}
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-slate-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Last active: {driver.lastActive.toLocaleDateString()}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Efficiency</span>
                                        <span className={getEfficiencyColor(driver.efficiency)}>
                                            {driver.efficiency}%
                                        </span>
                                    </div>
                                    <Progress value={driver.efficiency} className="h-2" />
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            {driver.totalRoutes}
                                        </div>
                                        <div className="text-xs text-slate-500">Total Routes</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            {driver.completedRoutes}
                                        </div>
                                        <div className="text-xs text-slate-500">Completed</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-slate-900">
                                            {driver.totalCollections}
                                        </div>
                                        <div className="text-xs text-slate-500">Collections</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}