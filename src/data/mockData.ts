export type Bin = {
	id: string;
	binId: string;
	location: string;
	latitude: number;
	longitude: number;
	capacity: number;
	currentFillLevel: number;
	status: "OK" | "NEEDS_PICKUP" | "OVERFLOWING";
	lastEmptied: Date;
	zone: string;
	lastUpdated: Date;
};

export type WasteRoute = {
	id: string;
	name: string;
	assignedDriver: string;
	status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
	stops: string[]; // Bin IDs
	estimatedDuration: number; // minutes
};

export type ActivityLog = {
	id: string;
	action: string;
	details: string;
	timestamp: Date;
	user: string;
};

export const INITIAL_BINS: Bin[] = [
	{
		id: "1",
		binId: "BIN-001",
		location: "Gulshan 1 Circle",
		latitude: 23.7925,
		longitude: 90.4078,
		capacity: 100,
		currentFillLevel: 85,
		status: "NEEDS_PICKUP",
		lastEmptied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
		zone: "Gulshan",
		lastUpdated: new Date(Date.now() - 15 * 60 * 1000),
	},
	{
		id: "2",
		binId: "BIN-002",
		location: "Banani Super Market",
		latitude: 23.7940,
		longitude: 90.4043,
		capacity: 100,
		currentFillLevel: 95,
		status: "OVERFLOWING",
		lastEmptied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		zone: "Banani",
		lastUpdated: new Date(Date.now() - 5 * 60 * 1000),
	},
	{
		id: "3",
		binId: "BIN-003",
		location: "Dhanmondi 32, Road 11",
		latitude: 23.7516,
		longitude: 90.3775,
		capacity: 100,
		currentFillLevel: 45,
		status: "OK",
		lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
		zone: "Dhanmondi",
		lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
	},
	{
		id: "4",
		binId: "BIN-004",
		location: "Motijheel Shapla Chattar",
		latitude: 23.7250,
		longitude: 90.4180,
		capacity: 100,
		currentFillLevel: 70,
		status: "NEEDS_PICKUP",
		lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		zone: "Motijheel",
		lastUpdated: new Date(Date.now() - 10 * 60 * 1000),
	},
	{
		id: "5",
		binId: "BIN-005",
		location: "Mirpur 10 Circle",
		latitude: 23.8070,
		longitude: 90.3685,
		capacity: 100,
		currentFillLevel: 30,
		status: "OK",
		lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
		zone: "Mirpur",
		lastUpdated: new Date(Date.now() - 20 * 60 * 1000),
	},
];

export const INITIAL_ROUTES: WasteRoute[] = [
	{
		id: "route-1",
		name: "North Dhaka Collection",
		assignedDriver: "John Driver",
		status: "IN_PROGRESS",
		stops: ["BIN-001", "BIN-002", "BIN-005"], // Gulshan, Banani, Mirpur
		estimatedDuration: 120,
	},
	{
		id: "route-2",
		name: "South Dhaka Express",
		assignedDriver: "Jane Doe",
		status: "PENDING",
		stops: ["BIN-003", "BIN-004"], // Dhanmondi, Motijheel
		estimatedDuration: 90,
	},
];

export const INITIAL_LOGS: ActivityLog[] = [
	{
		id: "log-1",
		action: "Bin Emptied",
		details: "Bin BIN-001 (Gulshan) emptied by John Driver",
		timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
		user: "John Driver",
	},
	{
		id: "log-2",
		action: "Route Created",
		details: "New route 'South Dhaka Express' created",
		timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
		user: "Admin User",
	},
	{
		id: "log-3",
		action: "Maintenance",
		details: "Sensor maintenance performed on BIN-003 (Dhanmondi)",
		timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
		user: "Tech Team",
	},
];

export const getMockStatistics = () => {
	return {
		totalBins: INITIAL_BINS.length,
		activeBins: INITIAL_BINS.filter((b) => b.status !== "OK").length, // Just an example logic
		criticalBins: INITIAL_BINS.filter((b) => b.status === "OVERFLOWING").length,
		activeTrucks: 5,
		onRouteTrucks: 2,
		totalCollectedToday: 15,
		totalRoutes: INITIAL_ROUTES.length,
		avgFillLevel: Math.round(
			INITIAL_BINS.reduce((acc, b) => acc + b.currentFillLevel, 0) / INITIAL_BINS.length,
		),
		completionRate: 85,
	};
};

export const mockBins = INITIAL_BINS; // Alias for compatibility with existing imports if needed
