import { INITIAL_BINS } from "./mockData";

/**
 * Public-facing bin data with sensitive information filtered out
 */
export interface PublicBin {
	id: string;
	location: string;
	latitude: number;
	longitude: number;
	fillLevel: number;
	status: "OK" | "NEEDS_PICKUP" | "OVERFLOWING";
	zone: string;
	lastUpdated: Date;
}

/**
 * Public statistics for dashboard display
 */
export interface PublicStatistics {
	totalBins: number;
	binsNeedingPickup: number;
	overflowingBins: number;
	pickupsToday: number;
	mostAffectedZone: string;
	overflowIncidentsToday: number;
}

/**
 * Get public bin data with sensitive fields removed
 */
export function getPublicBins(): PublicBin[] {
	return INITIAL_BINS.map((bin) => ({
		id: bin.id,
		location: bin.location,
		latitude: bin.latitude,
		longitude: bin.longitude,
		fillLevel: bin.currentFillLevel,
		status: bin.status,
		zone: bin.zone,
		lastUpdated: bin.lastUpdated,
	}));
}

/**
 * Get public statistics for dashboard
 */
export function getPublicStatistics(): PublicStatistics {
	const bins = INITIAL_BINS;

	// Count bins needing pickup (NEEDS_PICKUP + OVERFLOWING)
	const binsNeedingPickup = bins.filter(
		(b) => b.status === "NEEDS_PICKUP" || b.status === "OVERFLOWING",
	).length;

	// Count overflowing bins
	const overflowingBins = bins.filter((b) => b.status === "OVERFLOWING").length;

	// Mock pickups today (in real app, this would come from backend)
	const pickupsToday = 5;

	// Find most affected zone (zone with most bins needing pickup)
	const zoneStats = bins.reduce(
		(acc, bin) => {
			if (bin.status === "NEEDS_PICKUP" || bin.status === "OVERFLOWING") {
				acc[bin.zone] = (acc[bin.zone] || 0) + 1;
			}
			return acc;
		},
		{} as Record<string, number>,
	);

	const mostAffectedZone =
		Object.keys(zoneStats).length > 0
			? Object.entries(zoneStats).sort((a, b) => b[1] - a[1])[0][0]
			: bins.length > 0
				? bins[0].zone || "N/A"
				: "N/A";

	// Count overflow incidents today (mock data)
	const overflowIncidentsToday = overflowingBins;

	return {
		totalBins: bins.length,
		binsNeedingPickup,
		overflowingBins,
		pickupsToday,
		mostAffectedZone,
		overflowIncidentsToday,
	};
}

/**
 * Get marker color based on bin status
 */
export function getBinMarkerColor(status: PublicBin["status"]): string {
	switch (status) {
		case "OK":
			return "#22c55e"; // green
		case "NEEDS_PICKUP":
			return "#eab308"; // yellow
		case "OVERFLOWING":
			return "#ef4444"; // red
		default:
			return "#6b7280"; // gray
	}
}
