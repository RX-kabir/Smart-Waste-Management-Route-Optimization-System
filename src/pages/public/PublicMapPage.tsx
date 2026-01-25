import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicBins, getBinMarkerColor, type PublicBin } from "@/data/publicData";
import { MapPin, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PublicMapPage() {
	const bins = getPublicBins();
	const [selectedBin, setSelectedBin] = useState<PublicBin | null>(null);

	const getStatusBadgeVariant = (status: PublicBin["status"]) => {
		switch (status) {
			case "OK":
				return "default";
			case "NEEDS_PICKUP":
				return "secondary";
			case "OVERFLOWING":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getStatusLabel = (status: PublicBin["status"]) => {
		switch (status) {
			case "OK":
				return "OK";
			case "NEEDS_PICKUP":
				return "Needs Pickup";
			case "OVERFLOWING":
				return "Overflowing";
			default:
				return status;
		}
	};

	const formatLastUpdated = (date: Date) => {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
	};

	return (
		<PublicLayout>
			<div className="container py-8 px-4 md:px-6 space-y-6">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
						City Bin Map
					</h1>
					<p className="text-muted-foreground text-lg">
						Interactive map showing real-time bin locations and status
					</p>
				</div>

				{/* Legend */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base font-display">Map Legend</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-4">
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 rounded-full bg-[#22c55e]" />
								<span className="text-sm">OK (&lt;70% full)</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 rounded-full bg-[#eab308]" />
								<span className="text-sm">Needs Pickup (70-89% full)</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 rounded-full bg-[#ef4444]" />
								<span className="text-sm">Overflowing (≥90% full)</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Map and Bin List */}
				<div className="grid gap-6 lg:grid-cols-3">
					{/* Map */}
					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle className="font-display">Interactive Map</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<div className="relative aspect-video w-full rounded-lg border bg-muted/50 overflow-hidden">
								{/* Simple visual representation */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center space-y-2">
										<MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
										<p className="text-sm text-muted-foreground">
											Map view with {bins.length} bin locations
										</p>
										<p className="text-xs text-muted-foreground">
											Click on bins in the list to view details →
										</p>
									</div>
								</div>

								{/* Visual bin markers */}
								<div className="absolute inset-0 p-8">
									{bins.map((bin, idx) => {
										const positions = [
											{ top: "20%", left: "30%" },
											{ top: "40%", left: "60%" },
											{ top: "60%", left: "25%" },
											{ top: "35%", left: "75%" },
											{ top: "70%", left: "50%" },
										];
										const pos = positions[idx % positions.length];

										return (
											<button
												key={bin.id}
												onClick={() => setSelectedBin(bin)}
												className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
												style={{ top: pos.top, left: pos.left }}
											>
												<div
													className="h-6 w-6 rounded-full border-2 border-white shadow-lg"
													style={{
														backgroundColor: getBinMarkerColor(
															bin.status,
														),
													}}
												/>
											</button>
										);
									})}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Bin List / Details */}
					<Card>
						<CardHeader>
							<CardTitle className="font-display">
								{selectedBin ? "Bin Details" : "All Bins"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-4">
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 rounded-full bg-[#22c55e]" />
									<span className="text-sm">OK (&lt;70% full)</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 rounded-full bg-[#eab308]" />
									<span className="text-sm">Needs Pickup (70-89% full)</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 rounded-full bg-[#ef4444]" />
									<span className="text-sm">Overflowing (≥90% full)</span>
								</div>
							</div>
							{selectedBin ? (
								<div className="space-y-4">
									<button
										onClick={() => setSelectedBin(null)}
										className="text-sm text-primary hover:underline"
									>
										← Back to list
									</button>

									<div className="space-y-3">
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Location
											</p>
											<p className="text-base font-medium mt-1">
												{selectedBin.location}
											</p>
										</div>

										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Zone
											</p>
											<p className="text-base font-medium mt-1 flex items-center gap-2">
												<MapPin className="h-4 w-4 text-primary" />
												{selectedBin.zone}
											</p>
										</div>

										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Fill Level
											</p>
											<div className="mt-2 space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-2xl font-bold font-display">
														{selectedBin.fillLevel}%
													</span>
													<Badge
														variant={getStatusBadgeVariant(
															selectedBin.status,
														)}
													>
														{getStatusLabel(selectedBin.status)}
													</Badge>
												</div>
												<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
													<div
														className="h-full transition-all"
														style={{
															width: `${selectedBin.fillLevel}%`,
															backgroundColor:
																selectedBin.status === "OK"
																	? "#22c55e"
																	: selectedBin.status ===
																		  "NEEDS_PICKUP"
																		? "#eab308"
																		: "#ef4444",
														}}
													/>
												</div>
											</div>
										</div>

										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Status
											</p>
											<p className="text-base font-medium mt-1 flex items-center gap-2">
												<Activity className="h-4 w-4" />
												{getStatusLabel(selectedBin.status)}
											</p>
										</div>

										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Last Updated
											</p>
											<p className="text-base font-medium mt-1 flex items-center gap-2">
												<Clock className="h-4 w-4" />
												{formatLastUpdated(selectedBin.lastUpdated)}
											</p>
										</div>
									</div>
								</div>
							) : (
								<div className="space-y-2 max-h-[500px] overflow-y-auto">
									{bins.map((bin) => (
										<button
											key={bin.id}
											onClick={() => setSelectedBin(bin)}
											className="w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50"
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<p className="font-medium text-sm truncate">
														{bin.location}
													</p>
													<p className="text-xs text-muted-foreground">
														{bin.zone}
													</p>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-sm font-bold">
														{bin.fillLevel}%
													</span>
													<div
														className="h-3 w-3 rounded-full"
														style={{
															backgroundColor:
																bin.status === "OK"
																	? "#22c55e"
																	: bin.status === "NEEDS_PICKUP"
																		? "#eab308"
																		: "#ef4444",
														}}
													/>
												</div>
											</div>
										</button>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Info Banner */}
				<Card className="bg-muted/50">
					<CardContent className="pt-6">
						<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
							<div className="flex-1">
								<h3 className="font-display font-semibold text-lg mb-2">
									About This Map
								</h3>
								<p className="text-sm text-muted-foreground">
									This interactive map shows real-time locations and status of all
									waste bins across the city. Click on any bin marker to view
									detailed information. The map updates automatically as sensors
									report fill levels. Color coding: Green (OK), Yellow (Needs
									Pickup), Red (Overflowing).
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</PublicLayout>
	);
}
