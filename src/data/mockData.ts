
export type Bin = {
  id: string
  binId: string
  location: string
  latitude: number
  longitude: number
  capacity: number
  currentFillLevel: number
  status: "OK" | "NEEDS_PICKUP" | "OVERFLOWING"
  lastEmptied: Date
}

export type WasteRoute = {
  id: string
  name: string
  assignedDriver: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  stops: string[] // Bin IDs
  estimatedDuration: number // minutes
}

export type ActivityLog = {
  id: string
  action: string
  details: string
  timestamp: Date
  user: string
}

export const INITIAL_BINS: Bin[] = [
  {
    id: "1",
    binId: "BIN-001",
    location: "Main Street & 1st Ave",
    latitude: 40.7128,
    longitude: -74.006,
    capacity: 100,
    currentFillLevel: 85,
    status: "NEEDS_PICKUP",
    lastEmptied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    binId: "BIN-002",
    location: "Park Avenue & 5th St",
    latitude: 40.7589,
    longitude: -73.9851,
    capacity: 100,
    currentFillLevel: 95,
    status: "OVERFLOWING",
    lastEmptied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    binId: "BIN-003",
    location: "Broadway & 42nd St",
    latitude: 40.758,
    longitude: -73.9855,
    capacity: 100,
    currentFillLevel: 45,
    status: "OK",
    lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    binId: "BIN-004",
    location: "Madison Ave & 23rd St",
    latitude: 40.7425,
    longitude: -73.9872,
    capacity: 100,
    currentFillLevel: 70,
    status: "NEEDS_PICKUP",
    lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    binId: "BIN-005",
    location: "Lexington Ave & 68th St",
    latitude: 40.7687,
    longitude: -73.9658,
    capacity: 100,
    currentFillLevel: 30,
    status: "OK",
    lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

export const INITIAL_ROUTES: WasteRoute[] = [
  {
    id: "route-1",
    name: "Monday Morning Collection",
    assignedDriver: "John Driver",
    status: "IN_PROGRESS",
    stops: ["BIN-001", "BIN-002", "BIN-004"],
    estimatedDuration: 120,
  },
  {
    id: "route-2",
    name: "Downtown Express",
    assignedDriver: "Jane Doe",
    status: "PENDING",
    stops: ["BIN-003", "BIN-005"],
    estimatedDuration: 90,
  },
]

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    action: "Bin Emptied",
    details: "Bin BIN-001 emptied by John Driver",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    user: "John Driver",
  },
  {
    id: "log-2",
    action: "Route Created",
    details: "New route 'Downtown Express' created",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    user: "Admin User",
  },
  {
    id: "log-3",
    action: "Maintenance",
    details: "Sensor maintenance performed on BIN-003",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    user: "Tech Team",
  },
]

export const getMockStatistics = () => {
  return {
    totalBins: INITIAL_BINS.length,
    activeBins: INITIAL_BINS.filter(b => b.status !== 'OK').length, // Just an example logic
    criticalBins: INITIAL_BINS.filter(b => b.status === "OVERFLOWING").length,
    activeTrucks: 5,
    onRouteTrucks: 2,
    totalCollectedToday: 15,
    totalRoutes: INITIAL_ROUTES.length,
    avgFillLevel: Math.round(INITIAL_BINS.reduce((acc, b) => acc + b.currentFillLevel, 0) / INITIAL_BINS.length),
    completionRate: 85
  }
}

export const mockBins = INITIAL_BINS; // Alias for compatibility with existing imports if needed
