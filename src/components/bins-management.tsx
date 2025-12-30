"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, MapPin } from "lucide-react"
import { BinDialog } from "./bin-dialog"
import { Bin } from "@/data/mockData"

export function BinsManagement({ initialBins }: { initialBins: Bin[] }) {
    const [bins, setBins] = useState<Bin[]>(initialBins)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedBin, setSelectedBin] = useState<Bin | null>(null)

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this bin?")) return
        setBins(bins.filter((b) => b.id !== id))
    }

    const handleEdit = (bin: Bin) => {
        setSelectedBin(bin)
        setDialogOpen(true)
    }

    const handleCreate = () => {
        setSelectedBin(null)
        setDialogOpen(true)
    }

    const handleSave = (bin: Bin) => {
        if (selectedBin) {
            // Edit existing
            setBins(bins.map(b => b.id === bin.id ? bin : b))
        } else {
            // Create new
            setBins([...bins, { ...bin, id: `new-${Date.now()}` }])
        }
        setDialogOpen(false)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OK":
                return (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50">
                        OK
                    </Badge>
                )
            case "NEEDS_PICKUP":
                return (
                    <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                        Needs Pickup
                    </Badge>
                )
            case "OVERFLOWING":
                return (
                    <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                        Overflowing
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
                            <CardTitle>Waste Bins</CardTitle>
                            <CardDescription>Manage all waste collection points</CardDescription>
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Bin
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {bins.map((bin) => (
                            <div key={bin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-slate-900">{bin.binId}</span>
                                        {getStatusBadge(bin.status)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="h-4 w-4" />
                                        {bin.location}
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <span className="text-slate-600">Fill Level: </span>
                                        <span className="font-medium text-slate-900">
                                            {bin.currentFillLevel}/{bin.capacity} ({Math.round((bin.currentFillLevel / bin.capacity) * 100)}
                                            %)
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(bin)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(bin.id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <BinDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                bin={selectedBin}
                onSave={handleSave}
            />
        </>
    )
}