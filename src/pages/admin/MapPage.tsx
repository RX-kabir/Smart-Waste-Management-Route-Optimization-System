import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import {
  Trash2,
  MapPin,
  Route,
  Layers,
  Plus,
  X,
  Eye,
  EyeOff,
  Navigation,
  Hexagon,
  CircleDot,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash,
  MousePointer,
  Info
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type BinStatus = 'OK' | 'NeedsPickup' | 'Overflowing';

interface Bin {
  id: string;
  coordinates: [number, number];
  status: BinStatus;
  zoneId: string | null;
  fillLevel: number;
  lastCollection: string;
}

interface Zone {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][][];
}

interface WasteRoute {
  id: string;
  name: string;
  stops: string[];
  coordinates: [number, number][];
}

type EditMode = 'none' | 'addBin' | 'createZone' | 'createRoute' | 'editZone';

// ============================================================================
// MOCK DATA - Dhaka City Area
// ============================================================================

const DHAKA_CENTER: [number, number] = [90.4125, 23.8103];

const INITIAL_ZONES: Zone[] = [
  {
    id: 'zone-1',
    name: 'Gulshan District',
    color: '#3b82f6',
    coordinates: [[
      [90.4050, 23.7950],
      [90.4200, 23.7950],
      [90.4200, 23.8100],
      [90.4050, 23.8100],
      [90.4050, 23.7950]
    ]]
  },
  {
    id: 'zone-2',
    name: 'Banani Sector',
    color: '#8b5cf6',
    coordinates: [[
      [90.3950, 23.8100],
      [90.4100, 23.8100],
      [90.4100, 23.8250],
      [90.3950, 23.8250],
      [90.3950, 23.8100]
    ]]
  },
  {
    id: 'zone-3',
    name: 'Uttara Zone',
    color: '#06b6d4',
    coordinates: [[
      [90.3850, 23.8250],
      [90.4050, 23.8250],
      [90.4050, 23.8400],
      [90.3850, 23.8400],
      [90.3850, 23.8250]
    ]]
  }
];

const INITIAL_BINS: Bin[] = [
  { id: 'bin-1', coordinates: [90.4100, 23.8000], status: 'OK', zoneId: 'zone-1', fillLevel: 35, lastCollection: '2024-01-15 08:30' },
  { id: 'bin-2', coordinates: [90.4150, 23.8050], status: 'NeedsPickup', zoneId: 'zone-1', fillLevel: 78, lastCollection: '2024-01-14 14:20' },
  { id: 'bin-3', coordinates: [90.4080, 23.7980], status: 'Overflowing', zoneId: 'zone-1', fillLevel: 95, lastCollection: '2024-01-13 09:15' },
  { id: 'bin-4', coordinates: [90.4000, 23.8150], status: 'OK', zoneId: 'zone-2', fillLevel: 22, lastCollection: '2024-01-15 07:45' },
  { id: 'bin-5', coordinates: [90.4050, 23.8200], status: 'NeedsPickup', zoneId: 'zone-2', fillLevel: 82, lastCollection: '2024-01-14 16:00' },
  { id: 'bin-6', coordinates: [90.3980, 23.8180], status: 'OK', zoneId: 'zone-2', fillLevel: 45, lastCollection: '2024-01-15 10:30' },
  { id: 'bin-7', coordinates: [90.3920, 23.8300], status: 'Overflowing', zoneId: 'zone-3', fillLevel: 98, lastCollection: '2024-01-12 11:00' },
  { id: 'bin-8', coordinates: [90.3980, 23.8350], status: 'OK', zoneId: 'zone-3', fillLevel: 15, lastCollection: '2024-01-15 09:00' },
];

const INITIAL_ROUTES: WasteRoute[] = [
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getBinColor = (status: BinStatus): string => {
  switch (status) {
    case 'OK': return '#22c55e';
    case 'NeedsPickup': return '#f59e0b';
    case 'Overflowing': return '#ef4444';
    default: return '#6b7280';
  }
};

const getStatusIcon = (status: BinStatus) => {
  switch (status) {
    case 'OK': return <CheckCircle className="w-4 h-4 text-success" />;
    case 'NeedsPickup': return <Clock className="w-4 h-4 text-warning" />;
    case 'Overflowing': return <AlertTriangle className="w-4 h-4 text-danger" />;
  }
};

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// OSRM-based routing function that fetches real road geometry
const fetchOSRMRoute = async (stops: [number, number][]): Promise<[number, number][]> => {
  if (stops.length < 2) return stops;

  // Build OSRM coordinates string: lng,lat;lng,lat;...
  const coordsString = stops.map(coord => `${coord[0]},${coord[1]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('OSRM returned no valid route, falling back to straight lines');
      return stops;
    }

    // Extract geometry coordinates from OSRM response
    const routeGeometry = data.routes[0].geometry.coordinates as [number, number][];
    return routeGeometry;
  } catch (error) {
    console.error('OSRM routing error:', error);
    // Fallback to straight-line connections on error
    return stops;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminMapPage = () => {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]);

  // State
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [bins, setBins] = useState<Bin[]>(INITIAL_BINS);
  const [routes, setRoutes] = useState<WasteRoute[]>(INITIAL_ROUTES);

  const [showZones, setShowZones] = useState(true);
  const [showBins, setShowBins] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  const [editMode, setEditMode] = useState<EditMode>('none');
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [routeStops, setRouteStops] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // ============================================================================
  // MAP INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: DHAKA_CENTER,
      zoom: 13,
      pitch: 45,
      bearing: -10,
    });

    map.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ============================================================================
  // ZONE LAYER MANAGEMENT
  // ============================================================================

  const updateZoneLayers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove existing zone layers and sources
    zones.forEach(zone => {
      if (map.current?.getLayer(`zone-fill-${zone.id}`)) {
        map.current.removeLayer(`zone-fill-${zone.id}`);
      }
      if (map.current?.getLayer(`zone-outline-${zone.id}`)) {
        map.current.removeLayer(`zone-outline-${zone.id}`);
      }
      if (map.current?.getSource(`zone-${zone.id}`)) {
        map.current.removeSource(`zone-${zone.id}`);
      }
    });

    if (!showZones) return;

    // Add zone layers
    zones.forEach(zone => {
      const geojson: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: { id: zone.id, name: zone.name },
        geometry: {
          type: 'Polygon',
          coordinates: zone.coordinates
        }
      };

      map.current?.addSource(`zone-${zone.id}`, {
        type: 'geojson',
        data: geojson
      });

      map.current?.addLayer({
        id: `zone-fill-${zone.id}`,
        type: 'fill',
        source: `zone-${zone.id}`,
        paint: {
          'fill-color': zone.color,
          'fill-opacity': 0.2
        }
      });

      map.current?.addLayer({
        id: `zone-outline-${zone.id}`,
        type: 'line',
        source: `zone-${zone.id}`,
        paint: {
          'line-color': zone.color,
          'line-width': 3,
          'line-opacity': 0.8
        }
      });

      // Zone click handler
      map.current?.on('click', `zone-fill-${zone.id}`, (e) => {
        if (editMode !== 'none') return;

        const coordinates = e.lngLat;
        const zoneBins = bins.filter(b => b.zoneId === zone.id);

        new maplibregl.Popup({ closeButton: true, maxWidth: '300px' })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-4">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-3 h-3 rounded-full" style="background: ${zone.color}"></div>
                <h3 class="font-semibold text-base">${zone.name}</h3>
              </div>
              <div class="space-y-2 text-sm text-gray-300">
                <p><span class="text-gray-500">Zone ID:</span> ${zone.id}</p>
                <p><span class="text-gray-500">Total Bins:</span> ${zoneBins.length}</p>
                <p><span class="text-gray-500">Overflowing:</span> ${zoneBins.filter(b => b.status === 'Overflowing').length}</p>
              </div>
            </div>
          `)
          .addTo(map.current!);
      });

      map.current?.on('mouseenter', `zone-fill-${zone.id}`, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current?.on('mouseleave', `zone-fill-${zone.id}`, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });
  }, [zones, showZones, isMapLoaded, editMode, bins]);

  useEffect(() => {
    updateZoneLayers();
  }, [updateZoneLayers]);

  // ============================================================================
  // BIN MARKERS MANAGEMENT
  // ============================================================================

  const updateBinMarkers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (!showBins) return;

    bins.forEach(bin => {
      const el = document.createElement('div');
      el.className = 'bin-marker';
      el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110"
               style="background: ${getBinColor(bin.status)}; box-shadow: 0 0 15px ${getBinColor(bin.status)}80;">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
               style="background: ${getBinColor(bin.status)};"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();

        if (editMode === 'createRoute') {
          // Add bin to route stops
          if (!routeStops.includes(bin.id)) {
            setRouteStops(prev => [...prev, bin.id]);
          }
          return;
        }

        // Show popup
        new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
          .setLngLat(bin.coordinates)
          .setHTML(`
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" style="background: ${getBinColor(bin.status)}"></div>
                  <h3 class="font-semibold">Bin ${bin.id.split('-')[1]}</h3>
                </div>
                <span class="px-2 py-1 text-xs rounded-full font-medium"
                      style="background: ${getBinColor(bin.status)}20; color: ${getBinColor(bin.status)}">
                  ${bin.status}
                </span>
              </div>
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-400">Fill Level</span>
                    <span class="font-mono">${bin.fillLevel}%</span>
                  </div>
                  <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all" 
                         style="width: ${bin.fillLevel}%; background: ${getBinColor(bin.status)}"></div>
                  </div>
                </div>
                <div class="text-sm text-gray-400">
                  <p>Last Collection: ${bin.lastCollection}</p>
                  ${bin.zoneId ? `<p>Zone: ${zones.find(z => z.id === bin.zoneId)?.name || 'Unknown'}</p>` : ''}
                </div>
              </div>
            </div>
          `)
          .addTo(map.current!);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(bin.coordinates)
        .addTo(map.current!);

      markersRef.current[bin.id] = marker;
    });
  }, [bins, showBins, isMapLoaded, editMode, routeStops, zones]);

  useEffect(() => {
    updateBinMarkers();
  }, [updateBinMarkers]);

  // ============================================================================
  // ROUTE LAYER MANAGEMENT
  // ============================================================================

  const updateRouteLayers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove existing route layers
    routes.forEach(route => {
      if (map.current?.getLayer(`route-line-${route.id}`)) {
        map.current.removeLayer(`route-line-${route.id}`);
      }
      if (map.current?.getSource(`route-${route.id}`)) {
        map.current.removeSource(`route-${route.id}`);
      }
    });

    // Remove route stop markers
    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];

    if (!showRoutes) return;

    routes.forEach(route => {
      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: { id: route.id, name: route.name },
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      };

      map.current?.addSource(`route-${route.id}`, {
        type: 'geojson',
        data: geojson
      });

      map.current?.addLayer({
        id: `route-line-${route.id}`,
        type: 'line',
        source: `route-${route.id}`,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#22c55e',
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1]
        }
      });

      // Add stop number markers
      route.stops.forEach((stopId, index) => {
        const bin = bins.find(b => b.id === stopId);
        if (!bin) return;

        const el = document.createElement('div');
        el.className = 'route-stop-marker';
        el.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
            ${index + 1}
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(bin.coordinates)
          .addTo(map.current!);

        routeMarkersRef.current.push(marker);
      });
    });
  }, [routes, showRoutes, isMapLoaded, bins]);

  useEffect(() => {
    updateRouteLayers();
  }, [updateRouteLayers]);

  // ============================================================================
  // DRAWING LAYER (for zone creation)
  // ============================================================================

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const sourceId = 'drawing-source';
    const lineLayerId = 'drawing-line';
    const pointLayerId = 'drawing-points';

    // Remove existing
    if (map.current.getLayer(lineLayerId)) map.current.removeLayer(lineLayerId);
    if (map.current.getLayer(pointLayerId)) map.current.removeLayer(pointLayerId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    if (editMode !== 'createZone' || drawingPoints.length === 0) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [...drawingPoints, drawingPoints[0]]
          }
        },
        ...drawingPoints.map((point, i) => ({
          type: 'Feature' as const,
          properties: { index: i },
          geometry: {
            type: 'Point' as const,
            coordinates: point
          }
        }))
      ]
    };

    map.current.addSource(sourceId, { type: 'geojson', data: geojson });

    map.current.addLayer({
      id: lineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-dasharray': [3, 2]
      },
      filter: ['==', '$type', 'LineString']
    });

    map.current.addLayer({
      id: pointLayerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': 6,
        'circle-color': '#3b82f6',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      },
      filter: ['==', '$type', 'Point']
    });
  }, [drawingPoints, editMode, isMapLoaded]);

  // ============================================================================
  // MAP CLICK HANDLERS
  // ============================================================================

  useEffect(() => {
    if (!map.current) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (editMode === 'addBin') {
        const newBin: Bin = {
          id: `bin-${generateId()}`,
          coordinates: coords,
          status: 'OK',
          zoneId: null,
          fillLevel: Math.floor(Math.random() * 40) + 10,
          lastCollection: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        // Check if bin is inside any zone
        for (const zone of zones) {
          const point = turf.point(coords);
          const polygon = turf.polygon(zone.coordinates);
          if (turf.booleanPointInPolygon(point, polygon)) {
            newBin.zoneId = zone.id;
            break;
          }
        }

        setBins(prev => [...prev, newBin]);
        setEditMode('none');
      }

      if (editMode === 'createZone') {
        setDrawingPoints(prev => [...prev, coords]);
      }
    };

    map.current.on('click', handleClick);
    return () => {
      map.current?.off('click', handleClick);
    };
  }, [editMode, zones]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleCompleteZone = () => {
    if (drawingPoints.length < 3) return;

    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const newZone: Zone = {
      id: `zone-${generateId()}`,
      name: `Zone ${zones.length + 1}`,
      color: colors[zones.length % colors.length],
      coordinates: [[...drawingPoints, drawingPoints[0]]]
    };

    setZones(prev => [...prev, newZone]);
    setDrawingPoints([]);
    setEditMode('none');
  };

  const handleCompleteRoute = async () => {
    if (routeStops.length < 2 || isRoutingLoading) return;

    const stopCoordinates = routeStops
      .map(id => bins.find(b => b.id === id)?.coordinates)
      .filter((c): c is [number, number] => c !== undefined);

    setIsRoutingLoading(true);

    try {
      // Fetch real road-snapped route from OSRM
      const routeCoords = await fetchOSRMRoute(stopCoordinates);

      const newRoute: WasteRoute = {
        id: `route-${generateId()}`,
        name: `Route ${routes.length + 1}`,
        stops: routeStops,
        coordinates: routeCoords
      };

      setRoutes(prev => [...prev, newRoute]);
      setRouteStops([]);
      setEditMode('none');
    } catch (error) {
      console.error('Failed to create route:', error);
    } finally {
      setIsRoutingLoading(false);
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    // Reset bins in this zone
    setBins(prev => prev.map(b => b.zoneId === zoneId ? { ...b, zoneId: null } : b));
  };

  const handleDeleteBin = (binId: string) => {
    setBins(prev => prev.filter(b => b.id !== binId));
    // Remove from routes
    setRoutes(prev => prev.map(r => ({
      ...r,
      stops: r.stops.filter(s => s !== binId)
    })));
  };

  const handleDeleteRoute = (routeId: string) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
  };

  const cancelCurrentAction = () => {
    setEditMode('none');
    setDrawingPoints([]);
    setRouteStops([]);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AppLayout title="City Map">
      <div className="relative w-full h-[calc(100vh-4rem)] bg-background overflow-hidden">
        {/* Map Container */}
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Header - HIDDEN FOR ADMIN VIEW (Assuming Admin Layout provides sidebar/header) 
          OR KEPT if we want an overlay title. keeping for now but compacting */}
        {/* 
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="glass-panel rounded-xl p-4 animate-fade-in max-w-xl">
           ...
        </div>
      </div>
      */}

        {/* Control Panel */}
        <div className="absolute top-4 left-4 z-10 w-72 animate-slide-in-left">
          <div className="glass-panel rounded-xl overflow-hidden">
            {/* Layer Toggles */}
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Layers</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowZones(!showZones)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${showZones ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Hexagon className="w-4 h-4" />
                    <span className="text-sm font-medium">Zones</span>
                  </div>
                  {showZones ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowBins(!showBins)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${showBins ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <CircleDot className="w-4 h-4" />
                    <span className="text-sm font-medium">Bins</span>
                  </div>
                  {showBins ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowRoutes(!showRoutes)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${showRoutes ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">Routes</span>
                  </div>
                  {showRoutes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setEditMode(editMode === 'createZone' ? 'none' : 'createZone')}
                  disabled={editMode !== 'none' && editMode !== 'createZone'}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${editMode === 'createZone'
                      ? 'bg-zone-blue text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Hexagon className="w-4 h-4" />
                  <span className="text-sm font-medium">Create Zone</span>
                </button>

                <button
                  onClick={() => setEditMode(editMode === 'addBin' ? 'none' : 'addBin')}
                  disabled={editMode !== 'none' && editMode !== 'addBin'}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${editMode === 'addBin'
                      ? 'bg-success text-success-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Bin</span>
                </button>

                <button
                  onClick={() => setEditMode(editMode === 'createRoute' ? 'none' : 'createRoute')}
                  disabled={editMode !== 'none' && editMode !== 'createRoute'}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${editMode === 'createRoute'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Route className="w-4 h-4" />
                  <span className="text-sm font-medium">Create Route</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Statistics</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-secondary/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-foreground">{zones.length}</p>
                  <p className="text-xs text-muted-foreground">Zones</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-foreground">{bins.length}</p>
                  <p className="text-xs text-muted-foreground">Bins</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-foreground">{routes.length}</p>
                  <p className="text-xs text-muted-foreground">Routes</p>
                </div>
              </div>

              {/* Bin Status Summary */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-muted-foreground">OK</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {bins.filter(b => b.status === 'OK').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-muted-foreground">Needs Pickup</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {bins.filter(b => b.status === 'NeedsPickup').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    <span className="text-muted-foreground">Overflowing</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {bins.filter(b => b.status === 'Overflowing').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode Instructions */}
        {editMode !== 'none' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-scale-in">
            <div className="glass-panel rounded-xl px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  {editMode === 'addBin' && (
                    <span className="text-sm font-medium">Click on the map to place a new bin</span>
                  )}
                  {editMode === 'createZone' && (
                    <span className="text-sm font-medium">
                      Click to add points ({drawingPoints.length} points) • Min 3 required
                    </span>
                  )}
                  {editMode === 'createRoute' && (
                    <span className="text-sm font-medium">
                      Click bins to add to route ({routeStops.length} stops) • Min 2 required
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editMode === 'createZone' && drawingPoints.length >= 3 && (
                    <button
                      onClick={handleCompleteZone}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Complete Zone
                    </button>
                  )}
                  {editMode === 'createRoute' && routeStops.length >= 2 && (
                    <button
                      onClick={handleCompleteRoute}
                      disabled={isRoutingLoading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                      {isRoutingLoading ? 'Calculating...' : 'Complete Route'}
                    </button>
                  )}
                  <button
                    onClick={cancelCurrentAction}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zones List Panel */}
        {zones.length > 0 && (
          <div className="absolute top-4 right-4 z-10 w-64 animate-slide-in-left">
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Zones</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {zones.map(zone => (
                  <div key={zone.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: zone.color }} />
                      <span className="text-sm font-medium text-foreground">{zone.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Routes List Panel */}
        {routes.length > 0 && (
          <div className="absolute top-80 right-4 z-10 w-64 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Routes</h3>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {routes.map(route => (
                  <div key={route.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      <div>
                        <span className="text-sm font-medium text-foreground">{route.name}</span>
                        <p className="text-xs text-muted-foreground">{route.stops.length} stops</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRoute(route.id)}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Route Creation - Selected Stops */}
        {editMode === 'createRoute' && routeStops.length > 0 && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10">
            <div className="glass-panel rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Route stops:</span>
                {routeStops.map((stopId, index) => (
                  <div key={stopId} className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    {index < routeStops.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="glass-panel rounded-xl p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bin Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success glow-success" />
                <span className="text-xs text-foreground">OK</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning glow-warning" />
                <span className="text-xs text-foreground">Needs Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger glow-danger" />
                <span className="text-xs text-foreground">Overflowing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminMapPage;
