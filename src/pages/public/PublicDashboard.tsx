import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicStatistics } from "@/data/publicData";
import { Trash2, AlertTriangle, TrendingUp, CheckCircle2, MapPin, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PublicDashboard() {
	const stats = getPublicStatistics();

	return (
		<PublicLayout>
			<div className="container py-8 px-4 md:px-6 space-y-8">
				{/* Hero Section */}
				<div className="space-y-2">
					<h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
						City Waste Management Dashboard
					</h1>
					<p className="text-muted-foreground text-lg">
						Real-time transparency into our waste collection system
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card className="border-l-4 border-l-primary">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Bins
							</CardTitle>
							<Trash2 className="h-5 w-5 text-primary" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold font-display">{stats.totalBins}</div>
							<p className="text-xs text-muted-foreground mt-1">Across all zones</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-warning">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Bins Needing Pickup
							</CardTitle>
							<AlertTriangle className="h-5 w-5 text-warning" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold font-display text-warning">
								{stats.binsNeedingPickup}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Scheduled for collection
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-destructive">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Overflowing Bins
							</CardTitle>
							<Activity className="h-5 w-5 text-destructive" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold font-display text-destructive">
								{stats.overflowingBins}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Require immediate attention
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-success">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Pickups Today
							</CardTitle>
							<CheckCircle2 className="h-5 w-5 text-success" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold font-display text-success">
								{stats.pickupsToday}
							</div>
							<p className="text-xs text-muted-foreground mt-1">Bins emptied today</p>
						</CardContent>
					</Card>
				</div>

				{/* Insights Section */}
				<div className="grid gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="font-display flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Zone Insights
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Most Affected Zone
									</p>
									<p className="text-2xl font-bold font-display mt-1">
										{stats.mostAffectedZone}
									</p>
								</div>
								<AlertTriangle className="h-8 w-8 text-warning" />
							</div>
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Overflow Incidents Today
									</p>
									<p className="text-2xl font-bold font-display mt-1">
										{stats.overflowIncidentsToday}
									</p>
								</div>
								<TrendingUp className="h-8 w-8 text-destructive" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="font-display">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="text-sm text-muted-foreground">
								View detailed bin locations and status on our interactive map
							</p>
							<Button asChild className="w-full" size="lg">
								<Link to="/map">View City Map</Link>
							</Button>
							<p className="text-xs text-center text-muted-foreground">
								See real-time bin status with color-coded markers
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Info Banner */}
				<Card className="bg-muted/50">
					<CardContent className="pt-6">
						<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
							<div className="flex-1">
								<h3 className="font-display font-semibold text-lg mb-2">
									About This Dashboard
								</h3>
								<p className="text-sm text-muted-foreground">
									This public dashboard provides transparency into our city's
									waste management operations. Data is updated in real-time from
									our smart bin sensors across all zones. For operational access,
									please log in with your credentials.
								</p>
							</div>
							<Button variant="outline" asChild>
								<Link to="/login">Staff Login</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</PublicLayout>
	);
}
