"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Recycle, LogOut, LayoutDashboard, UserCog, Truck } from "lucide-react"

interface DashboardHeaderUser {
  id: string
  name: string
  email: string
  role: string
}

const MOCK_USER: DashboardHeaderUser = {
  id: "mock-admin-id",
  name: "Admin User",
  email: "admin@example.com",
  role: "ADMIN"
}

export function DashboardHeader({ user = MOCK_USER }: { user?: DashboardHeaderUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Mock logout
    navigate("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Recycle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Waste Management</h2>
            <p className="text-xs text-slate-500 capitalize">{user.role} Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user.role === "ADMIN" && (
            <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
              <UserCog className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}
          {user.role === "DRIVER" && (
            <Button variant="outline" size="sm" onClick={() => navigate("/driver")}>
              <Truck className="h-4 w-4 mr-2" />
              My Routes
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}