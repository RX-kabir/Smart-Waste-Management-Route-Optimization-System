import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMockStatistics, mockBins } from '@/data/mockData';
import { Trash2, Truck, Route, AlertTriangle, TrendingUp, Recycle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function AdminDashboard() {
  const stats = getMockStatistics();
  const criticalBins = mockBins.filter(b => b.fillLevel >= 80);

  return (
    <AppLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bins</CardTitle>
              <Trash2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{stats.totalBins}</div>
              <p className="text-xs text-muted-foreground">{stats.activeBins} active</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Bins</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-warning">{stats.criticalBins}</div>
              <p className="text-xs text-muted-foreground">Need immediate collection</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-info">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Trucks</CardTitle>
              <Truck className="h-5 w-5 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{stats.onRouteTrucks}/{stats.activeTrucks}</div>
              <p className="text-xs text-muted-foreground">Currently on route</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collected Today</CardTitle>
              <Recycle className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-success">{stats.totalCollectedToday}</div>
              <p className="text-xs text-muted-foreground">bins emptied</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Critical Bins */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/admin/map">View City Map</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/admin/routes">Generate Routes</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/bins">Manage Bins</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Critical Bins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalBins.slice(0, 3).map(bin => (
                <div key={bin.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{bin.address}</p>
                    <p className="text-xs text-muted-foreground">Sensor: {bin.sensorId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-destructive">{bin.fillLevel}%</span>
                    <Progress value={bin.fillLevel} className="h-2 w-20 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
