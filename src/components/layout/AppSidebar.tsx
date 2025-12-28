import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Trash2,
  Route,
  MapPin,
  BarChart3,
  Settings,
  Truck,
  Users,
  LogOut,
  ChevronDown,
  Leaf,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const adminNavItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'City Map', url: '/admin/map', icon: Map },
  { title: 'Bins', url: '/admin/bins', icon: Trash2 },
  { title: 'Zones', url: '/admin/zones', icon: MapPin },
  { title: 'Routes', url: '/admin/routes', icon: Route },
  { title: 'Trucks', url: '/admin/trucks', icon: Truck },
  { title: 'Drivers', url: '/admin/drivers', icon: Users },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
];

const driverNavItems = [
  { title: 'My Dashboard', url: '/driver/dashboard', icon: LayoutDashboard },
  { title: 'My Routes', url: '/driver/routes', icon: Route },
  { title: 'Navigation', url: '/driver/navigation', icon: Map },
];

export function AppSidebar() {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : driverNavItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              EcoWaste
            </span>
            <span className="text-xs text-muted-foreground">
              Smart Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isAdmin ? 'Administration' : 'Driver Panel'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      'transition-all duration-200',
                      isActive(item.url) &&
                        'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {item.title === 'Bins' && (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-5 px-1.5 text-[10px]"
                        >
                          3
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin/settings"
                      className="flex items-center gap-3"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-sm">
                <span className="font-medium text-sidebar-foreground">
                  {user?.name}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => switchRole('admin')}>
              <Users className="mr-2 h-4 w-4" />
              Switch to Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('driver')}>
              <Truck className="mr-2 h-4 w-4" />
              Switch to Driver
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
