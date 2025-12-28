// Mock data for Smart Waste Management System
// This will be replaced with API calls to your Spring Boot backend

export interface Region {
  id: string;
  name: string;
  city: string;
  country: string;
  center: { lat: number; lng: number };
  zoom: number;
}

export interface Zone {
  id: string;
  name: string;
  regionId: string;
  color: string;
  boundaries: { lat: number; lng: number }[];
  schedule: 'daily' | 'alternate' | 'weekly';
  assignedTrucks: string[];
}

export interface Bin {
  id: string;
  location: { lat: number; lng: number };
  address: string;
  zoneId: string;
  fillLevel: number; // 0-100
  capacity: number; // liters
  lastCollected: string;
  lastUpdated: string;
  status: 'active' | 'blocked' | 'maintenance';
  sensorId: string;
}

export interface Truck {
  id: string;
  plateNumber: string;
  driverId: string;
  capacity: number; // liters
  currentLoad: number;
  status: 'available' | 'on-route' | 'maintenance';
  location?: { lat: number; lng: number };
  regionId: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedTruckId: string;
  regionId: string;
  status: 'active' | 'off-duty';
}

export interface Route {
  id: string;
  name: string;
  zoneId: string;
  truckId: string;
  driverId: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedDuration: number; // minutes
  estimatedDistance: number; // km
  waypoints: { binId: string; order: number; collected: boolean }[];
  path: { lat: number; lng: number }[];
}

export interface BlockedRoad {
  id: string;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  reason: string;
  blockedAt: string;
  estimatedClearTime?: string;
}

// Mock Regions
export const mockRegions: Region[] = [
  {
    id: 'region-1',
    name: 'Downtown District',
    city: 'Colombo',
    country: 'Sri Lanka',
    center: { lat: 6.9271, lng: 79.8612 },
    zoom: 13,
  },
  {
    id: 'region-2',
    name: 'North Zone',
    city: 'Colombo',
    country: 'Sri Lanka',
    center: { lat: 6.9500, lng: 79.8700 },
    zoom: 13,
  },
];

// Mock Zones
export const mockZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'Commercial Area',
    regionId: 'region-1',
    color: 'zone-1',
    boundaries: [
      { lat: 6.9350, lng: 79.8500 },
      { lat: 6.9350, lng: 79.8700 },
      { lat: 6.9200, lng: 79.8700 },
      { lat: 6.9200, lng: 79.8500 },
    ],
    schedule: 'daily',
    assignedTrucks: ['truck-1', 'truck-2'],
  },
  {
    id: 'zone-2',
    name: 'Residential East',
    regionId: 'region-1',
    color: 'zone-2',
    boundaries: [
      { lat: 6.9350, lng: 79.8700 },
      { lat: 6.9350, lng: 79.8900 },
      { lat: 6.9200, lng: 79.8900 },
      { lat: 6.9200, lng: 79.8700 },
    ],
    schedule: 'alternate',
    assignedTrucks: ['truck-3'],
  },
  {
    id: 'zone-3',
    name: 'Industrial Park',
    regionId: 'region-1',
    color: 'zone-3',
    boundaries: [
      { lat: 6.9200, lng: 79.8500 },
      { lat: 6.9200, lng: 79.8700 },
      { lat: 6.9050, lng: 79.8700 },
      { lat: 6.9050, lng: 79.8500 },
    ],
    schedule: 'daily',
    assignedTrucks: ['truck-4'],
  },
];

// Mock Bins
export const mockBins: Bin[] = [
  {
    id: 'bin-1',
    location: { lat: 6.9271, lng: 79.8612 },
    address: '123 Main Street, Fort',
    zoneId: 'zone-1',
    fillLevel: 85,
    capacity: 240,
    lastCollected: '2024-01-15T08:30:00Z',
    lastUpdated: '2024-01-16T10:15:00Z',
    status: 'active',
    sensorId: 'sensor-001',
  },
  {
    id: 'bin-2',
    location: { lat: 6.9290, lng: 79.8580 },
    address: '45 York Street',
    zoneId: 'zone-1',
    fillLevel: 42,
    capacity: 240,
    lastCollected: '2024-01-15T08:45:00Z',
    lastUpdated: '2024-01-16T10:20:00Z',
    status: 'active',
    sensorId: 'sensor-002',
  },
  {
    id: 'bin-3',
    location: { lat: 6.9255, lng: 79.8650 },
    address: '78 Chatham Street',
    zoneId: 'zone-1',
    fillLevel: 95,
    capacity: 360,
    lastCollected: '2024-01-14T14:00:00Z',
    lastUpdated: '2024-01-16T10:25:00Z',
    status: 'active',
    sensorId: 'sensor-003',
  },
  {
    id: 'bin-4',
    location: { lat: 6.9310, lng: 79.8620 },
    address: '12 Church Lane',
    zoneId: 'zone-1',
    fillLevel: 28,
    capacity: 240,
    lastCollected: '2024-01-16T06:00:00Z',
    lastUpdated: '2024-01-16T10:30:00Z',
    status: 'active',
    sensorId: 'sensor-004',
  },
  {
    id: 'bin-5',
    location: { lat: 6.9280, lng: 79.8750 },
    address: '234 Slave Island Road',
    zoneId: 'zone-2',
    fillLevel: 67,
    capacity: 240,
    lastCollected: '2024-01-15T09:00:00Z',
    lastUpdated: '2024-01-16T10:35:00Z',
    status: 'active',
    sensorId: 'sensor-005',
  },
  {
    id: 'bin-6',
    location: { lat: 6.9300, lng: 79.8800 },
    address: '56 Union Place',
    zoneId: 'zone-2',
    fillLevel: 15,
    capacity: 360,
    lastCollected: '2024-01-16T07:30:00Z',
    lastUpdated: '2024-01-16T10:40:00Z',
    status: 'active',
    sensorId: 'sensor-006',
  },
  {
    id: 'bin-7',
    location: { lat: 6.9150, lng: 79.8550 },
    address: '89 Grandpass Road',
    zoneId: 'zone-3',
    fillLevel: 72,
    capacity: 480,
    lastCollected: '2024-01-15T10:00:00Z',
    lastUpdated: '2024-01-16T10:45:00Z',
    status: 'active',
    sensorId: 'sensor-007',
  },
  {
    id: 'bin-8',
    location: { lat: 6.9120, lng: 79.8620 },
    address: '167 Factory Lane',
    zoneId: 'zone-3',
    fillLevel: 0,
    capacity: 480,
    lastCollected: '2024-01-16T08:00:00Z',
    lastUpdated: '2024-01-16T10:50:00Z',
    status: 'blocked',
    sensorId: 'sensor-008',
  },
];

// Mock Trucks
export const mockTrucks: Truck[] = [
  {
    id: 'truck-1',
    plateNumber: 'WP CAB-1234',
    driverId: 'driver-1',
    capacity: 5000,
    currentLoad: 1200,
    status: 'on-route',
    location: { lat: 6.9280, lng: 79.8600 },
    regionId: 'region-1',
  },
  {
    id: 'truck-2',
    plateNumber: 'WP CAB-5678',
    driverId: 'driver-2',
    capacity: 5000,
    currentLoad: 0,
    status: 'available',
    location: { lat: 6.9200, lng: 79.8550 },
    regionId: 'region-1',
  },
  {
    id: 'truck-3',
    plateNumber: 'WP CAB-9012',
    driverId: 'driver-3',
    capacity: 7500,
    currentLoad: 3500,
    status: 'on-route',
    location: { lat: 6.9290, lng: 79.8780 },
    regionId: 'region-1',
  },
  {
    id: 'truck-4',
    plateNumber: 'WP CAB-3456',
    driverId: 'driver-4',
    capacity: 7500,
    currentLoad: 0,
    status: 'maintenance',
    regionId: 'region-1',
  },
];

// Mock Drivers
export const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Amal Perera',
    email: 'amal@example.com',
    phone: '+94 77 123 4567',
    assignedTruckId: 'truck-1',
    regionId: 'region-1',
    status: 'active',
  },
  {
    id: 'driver-2',
    name: 'Sunil Fernando',
    email: 'sunil@example.com',
    phone: '+94 77 234 5678',
    assignedTruckId: 'truck-2',
    regionId: 'region-1',
    status: 'active',
  },
  {
    id: 'driver-3',
    name: 'Kumara Silva',
    email: 'kumara@example.com',
    phone: '+94 77 345 6789',
    assignedTruckId: 'truck-3',
    regionId: 'region-1',
    status: 'active',
  },
  {
    id: 'driver-4',
    name: 'Nimal Jayawardena',
    email: 'nimal@example.com',
    phone: '+94 77 456 7890',
    assignedTruckId: 'truck-4',
    regionId: 'region-1',
    status: 'off-duty',
  },
];

// Mock Routes
export const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'Commercial Morning Route',
    zoneId: 'zone-1',
    truckId: 'truck-1',
    driverId: 'driver-1',
    date: '2024-01-16',
    status: 'in-progress',
    estimatedDuration: 120,
    estimatedDistance: 15.5,
    waypoints: [
      { binId: 'bin-3', order: 1, collected: true },
      { binId: 'bin-1', order: 2, collected: false },
      { binId: 'bin-2', order: 3, collected: false },
      { binId: 'bin-4', order: 4, collected: false },
    ],
    path: [
      { lat: 6.9200, lng: 79.8550 },
      { lat: 6.9255, lng: 79.8650 },
      { lat: 6.9271, lng: 79.8612 },
      { lat: 6.9290, lng: 79.8580 },
      { lat: 6.9310, lng: 79.8620 },
    ],
  },
  {
    id: 'route-2',
    name: 'Residential East Route',
    zoneId: 'zone-2',
    truckId: 'truck-3',
    driverId: 'driver-3',
    date: '2024-01-16',
    status: 'in-progress',
    estimatedDuration: 90,
    estimatedDistance: 12.0,
    waypoints: [
      { binId: 'bin-5', order: 1, collected: true },
      { binId: 'bin-6', order: 2, collected: false },
    ],
    path: [
      { lat: 6.9250, lng: 79.8700 },
      { lat: 6.9280, lng: 79.8750 },
      { lat: 6.9300, lng: 79.8800 },
    ],
  },
  {
    id: 'route-3',
    name: 'Industrial Park Route',
    zoneId: 'zone-3',
    truckId: 'truck-2',
    driverId: 'driver-2',
    date: '2024-01-16',
    status: 'pending',
    estimatedDuration: 60,
    estimatedDistance: 8.0,
    waypoints: [
      { binId: 'bin-7', order: 1, collected: false },
    ],
    path: [
      { lat: 6.9100, lng: 79.8500 },
      { lat: 6.9150, lng: 79.8550 },
    ],
  },
];

// Mock Blocked Roads
export const mockBlockedRoads: BlockedRoad[] = [
  {
    id: 'block-1',
    start: { lat: 6.9260, lng: 79.8590 },
    end: { lat: 6.9280, lng: 79.8610 },
    reason: 'Road construction',
    blockedAt: '2024-01-15T06:00:00Z',
    estimatedClearTime: '2024-01-20T18:00:00Z',
  },
];

// Helper functions
export const getBinFillLevelColor = (fillLevel: number): string => {
  if (fillLevel >= 80) return 'bin-critical';
  if (fillLevel >= 60) return 'bin-high';
  if (fillLevel >= 40) return 'bin-medium';
  if (fillLevel >= 20) return 'bin-low';
  return 'bin-empty';
};

export const getBinFillLevelLabel = (fillLevel: number): string => {
  if (fillLevel >= 80) return 'Critical';
  if (fillLevel >= 60) return 'High';
  if (fillLevel >= 40) return 'Medium';
  if (fillLevel >= 20) return 'Low';
  return 'Empty';
};

// Statistics
export const getMockStatistics = () => ({
  totalBins: mockBins.length,
  activeBins: mockBins.filter(b => b.status === 'active').length,
  criticalBins: mockBins.filter(b => b.fillLevel >= 80).length,
  totalTrucks: mockTrucks.length,
  activeTrucks: mockTrucks.filter(t => t.status !== 'maintenance').length,
  onRouteTrucks: mockTrucks.filter(t => t.status === 'on-route').length,
  totalRoutes: mockRoutes.length,
  completedRoutes: mockRoutes.filter(r => r.status === 'completed').length,
  averageFillLevel: Math.round(mockBins.reduce((acc, b) => acc + b.fillLevel, 0) / mockBins.length),
  totalCollectedToday: mockRoutes
    .filter(r => r.date === '2024-01-16')
    .reduce((acc, r) => acc + r.waypoints.filter(w => w.collected).length, 0),
});
