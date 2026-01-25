import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Bin, Zone, Route, BlockedRoad, getBinFillLevelColor } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface CityMapProps {
	bins?: Bin[];
	zones?: Zone[];
	routes?: Route[];
	blockedRoads?: BlockedRoad[];
	selectedBinId?: string | null;
	selectedZoneId?: string | null;
	selectedRouteId?: string | null;
	onBinClick?: (bin: Bin) => void;
	onZoneClick?: (zone: Zone) => void;
	onMapClick?: (lngLat: { lng: number; lat: number }) => void;
	showZones?: boolean;
	showRoutes?: boolean;
	showBins?: boolean;
	showBlockedRoads?: boolean;
	className?: string;
	center?: { lat: number; lng: number };
	zoom?: number;
	creationMode?: "none" | "bin" | "zone" | "route";
	zonePoints?: { lat: number; lng: number }[];
	routeWaypoints?: { lat: number; lng: number }[];
	routePath?: { lat: number; lng: number }[];
}

const ZONE_COLORS: Record<string, string> = {
	"zone-1": "#3b82f6",
	"zone-2": "#8b5cf6",
	"zone-3": "#ec4899",
	"zone-4": "#f59e0b",
	"zone-5": "#10b981",
};

const BIN_COLORS: Record<string, string> = {
	"bin-empty": "#22c55e",
	"bin-low": "#84cc16",
	"bin-medium": "#eab308",
	"bin-high": "#f97316",
	"bin-critical": "#ef4444",
};

const ROUTE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

export function CityMap({
	bins = [],
	zones = [],
	routes = [],
	blockedRoads = [],
	selectedBinId,
	selectedZoneId,
	selectedRouteId,
	onBinClick,
	onZoneClick,
	onMapClick,
	showZones = true,
	showRoutes = true,
	showBins = true,
	showBlockedRoads = true,
	className,
	center = { lat: 6.9271, lng: 79.8612 },
	zoom = 13,
	creationMode = "none",
	zonePoints = [],
	routeWaypoints = [],
	routePath = [],
}: CityMapProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markersRef = useRef<maplibregl.Marker[]>([]);
	const zoneMarkersRef = useRef<maplibregl.Marker[]>([]);
	const routeMarkersRef = useRef<maplibregl.Marker[]>([]);

	// Initialize map
	useEffect(() => {
		if (!mapContainer.current || mapRef.current) return;

		mapRef.current = new maplibregl.Map({
			container: mapContainer.current,
			style: {
				version: 8,
				sources: {
					osm: {
						type: "raster",
						tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
						tileSize: 256,
						attribution: "&copy; OpenStreetMap contributors",
					},
				},
				layers: [
					{
						id: "osm",
						type: "raster",
						source: "osm",
					},
				],
			},
			center: [center.lng, center.lat],
			zoom: zoom,
		});

		mapRef.current.addControl(new maplibregl.NavigationControl(), "top-left");

		mapRef.current.on("click", (e) => {
			onMapClick?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
		});

		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	// Update zones layer
	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		const updateZones = () => {
			// Remove existing zone layers
			zones.forEach((_, index) => {
				if (map.getLayer(`zone-fill-${index}`)) map.removeLayer(`zone-fill-${index}`);
				if (map.getLayer(`zone-line-${index}`)) map.removeLayer(`zone-line-${index}`);
				if (map.getSource(`zone-${index}`)) map.removeSource(`zone-${index}`);
			});

			if (!showZones) return;

			zones.forEach((zone, index) => {
				const color = ZONE_COLORS[zone.color] || ZONE_COLORS["zone-1"];
				const isSelected = selectedZoneId === zone.id;
				const coordinates = zone.boundaries.map((b) => [b.lng, b.lat]);
				coordinates.push(coordinates[0]); // Close the polygon

				const sourceId = `zone-${index}`;

				if (!map.getSource(sourceId)) {
					map.addSource(sourceId, {
						type: "geojson",
						data: {
							type: "Feature",
							properties: { ...zone },
							geometry: {
								type: "Polygon",
								coordinates: [coordinates],
							},
						},
					});
				}

				map.addLayer({
					id: `zone-fill-${index}`,
					type: "fill",
					source: sourceId,
					paint: {
						"fill-color": color,
						"fill-opacity": isSelected ? 0.4 : 0.15,
					},
				});

				map.addLayer({
					id: `zone-line-${index}`,
					type: "line",
					source: sourceId,
					paint: {
						"line-color": color,
						"line-width": isSelected ? 3 : 2,
						"line-dasharray": [5, 5],
					},
				});
			});
		};

		if (map.isStyleLoaded()) {
			updateZones();
		} else {
			map.on("load", updateZones);
		}
	}, [zones, showZones, selectedZoneId]);

	// Update routes layer
	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		const updateRoutes = () => {
			// Remove existing route layers
			routes.forEach((_, index) => {
				if (map.getLayer(`route-${index}`)) map.removeLayer(`route-${index}`);
				if (map.getSource(`route-${index}`)) map.removeSource(`route-${index}`);
			});

			if (!showRoutes) return;

			routes.forEach((route, index) => {
				const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
				const isSelected = selectedRouteId === route.id;
				const coordinates = route.path.map((p) => [p.lng, p.lat]);

				const sourceId = `route-${index}`;

				if (!map.getSource(sourceId)) {
					map.addSource(sourceId, {
						type: "geojson",
						data: {
							type: "Feature",
							properties: { ...route },
							geometry: {
								type: "LineString",
								coordinates,
							},
						},
					});
				}

				map.addLayer({
					id: `route-${index}`,
					type: "line",
					source: sourceId,
					paint: {
						"line-color": color,
						"line-width": isSelected ? 6 : 4,
						"line-opacity": isSelected ? 1 : 0.7,
					},
					layout: {
						"line-cap": "round",
						"line-join": "round",
					},
				});
			});
		};

		if (map.isStyleLoaded()) {
			updateRoutes();
		} else {
			map.on("load", updateRoutes);
		}
	}, [routes, showRoutes, selectedRouteId]);

	// Update blocked roads layer
	useEffect(() => {
		if (!mapRef.current) return;

		const map = mapRef.current;

		const updateBlockedRoads = () => {
			blockedRoads.forEach((_, index) => {
				if (map.getLayer(`blocked-${index}`)) map.removeLayer(`blocked-${index}`);
				if (map.getSource(`blocked-${index}`)) map.removeSource(`blocked-${index}`);
			});

			if (!showBlockedRoads) return;

			blockedRoads.forEach((road, index) => {
				const sourceId = `blocked-${index}`;

				if (!map.getSource(sourceId)) {
					map.addSource(sourceId, {
						type: "geojson",
						data: {
							type: "Feature",
							properties: { reason: road.reason },
							geometry: {
								type: "LineString",
								coordinates: [
									[road.start.lng, road.start.lat],
									[road.end.lng, road.end.lat],
								],
							},
						},
					});
				}

				map.addLayer({
					id: `blocked-${index}`,
					type: "line",
					source: sourceId,
					paint: {
						"line-color": "#ef4444",
						"line-width": 5,
						"line-dasharray": [2, 2],
					},
				});
			});
		};

		if (map.isStyleLoaded()) {
			updateBlockedRoads();
		} else {
			map.on("load", updateBlockedRoads);
		}
	}, [blockedRoads, showBlockedRoads]);

	// Update bin markers
	useEffect(() => {
		if (!mapRef.current) return;

		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		if (!showBins) return;

		bins.forEach((bin) => {
			const colorKey = getBinFillLevelColor(bin.fillLevel);
			const color = BIN_COLORS[colorKey] || BIN_COLORS["bin-empty"];
			const isSelected = selectedBinId === bin.id;
			const size = isSelected ? 28 : 20;
			const borderColor = bin.status === "blocked" ? "#ef4444" : "white";

			const el = document.createElement("div");
			el.style.width = `${size}px`;
			el.style.height = `${size}px`;
			el.style.backgroundColor = color;
			el.style.border = `3px solid ${borderColor}`;
			el.style.borderRadius = "50%";
			el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
			el.style.cursor = "pointer";
			el.style.transition = "all 0.2s ease";

			el.addEventListener("click", (e) => {
				e.stopPropagation();
				onBinClick?.(bin);
			});

			const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <div class="font-semibold text-sm">${bin.address}</div>
          <div class="text-xs text-gray-600 mt-1">
            Fill Level: <span style="color: ${color}; font-weight: 600;">${bin.fillLevel}%</span>
          </div>
          <div class="text-xs text-gray-500">Capacity: ${bin.capacity}L</div>
          <div class="text-xs text-gray-500">Status: ${bin.status}</div>
        </div>
      `);

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([bin.location.lng, bin.location.lat])
				.setPopup(popup)
				.addTo(mapRef.current!);

			markersRef.current.push(marker);
		});
	}, [bins, showBins, selectedBinId, onBinClick]);

	// Update zone creation points
	useEffect(() => {
		if (!mapRef.current) return;

		// Clear existing zone markers
		zoneMarkersRef.current.forEach((marker) => marker.remove());
		zoneMarkersRef.current = [];

		if (creationMode !== "zone" || zonePoints.length === 0) return;

		zonePoints.forEach((point, index) => {
			const el = document.createElement("div");
			el.style.width = "16px";
			el.style.height = "16px";
			el.style.backgroundColor = "#8b5cf6";
			el.style.border = "3px solid white";
			el.style.borderRadius = "50%";
			el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
			el.innerText = String(index + 1);
			el.style.display = "flex";
			el.style.alignItems = "center";
			el.style.justifyContent = "center";
			el.style.fontSize = "10px";
			el.style.fontWeight = "bold";
			el.style.color = "white";

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([point.lng, point.lat])
				.addTo(mapRef.current!);

			zoneMarkersRef.current.push(marker);
		});

		// Draw zone polygon preview
		const map = mapRef.current;
		if (zonePoints.length >= 3) {
			if (map.getLayer("zone-preview-fill")) map.removeLayer("zone-preview-fill");
			if (map.getLayer("zone-preview-line")) map.removeLayer("zone-preview-line");
			if (map.getSource("zone-preview")) map.removeSource("zone-preview");

			const coordinates = zonePoints.map((p) => [p.lng, p.lat]);
			coordinates.push(coordinates[0]);

			map.addSource("zone-preview", {
				type: "geojson",
				data: {
					type: "Feature",
					properties: {},
					geometry: {
						type: "Polygon",
						coordinates: [coordinates],
					},
				},
			});

			map.addLayer({
				id: "zone-preview-fill",
				type: "fill",
				source: "zone-preview",
				paint: {
					"fill-color": "#8b5cf6",
					"fill-opacity": 0.3,
				},
			});

			map.addLayer({
				id: "zone-preview-line",
				type: "line",
				source: "zone-preview",
				paint: {
					"line-color": "#8b5cf6",
					"line-width": 2,
				},
			});
		}

		return () => {
			if (map.getLayer("zone-preview-fill")) map.removeLayer("zone-preview-fill");
			if (map.getLayer("zone-preview-line")) map.removeLayer("zone-preview-line");
			if (map.getSource("zone-preview")) map.removeSource("zone-preview");
		};
	}, [zonePoints, creationMode]);

	// Update route creation waypoints
	useEffect(() => {
		if (!mapRef.current) return;

		// Clear existing route markers
		routeMarkersRef.current.forEach((marker) => marker.remove());
		routeMarkersRef.current = [];

		if (creationMode !== "route" || routeWaypoints.length === 0) return;

		routeWaypoints.forEach((point, index) => {
			const el = document.createElement("div");
			el.style.width = "24px";
			el.style.height = "24px";
			el.style.backgroundColor = "#3b82f6";
			el.style.border = "3px solid white";
			el.style.borderRadius = "50%";
			el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
			el.style.display = "flex";
			el.style.alignItems = "center";
			el.style.justifyContent = "center";
			el.style.fontSize = "12px";
			el.style.fontWeight = "bold";
			el.style.color = "white";
			el.innerText = String(index + 1);

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([point.lng, point.lat])
				.addTo(mapRef.current!);

			routeMarkersRef.current.push(marker);
		});

		// Draw route path from OSRM
		const map = mapRef.current;
		if (routePath.length >= 2) {
			if (map.getLayer("route-preview")) map.removeLayer("route-preview");
			if (map.getSource("route-preview")) map.removeSource("route-preview");

			const coordinates = routePath.map((p) => [p.lng, p.lat]);

			map.addSource("route-preview", {
				type: "geojson",
				data: {
					type: "Feature",
					properties: {},
					geometry: {
						type: "LineString",
						coordinates,
					},
				},
			});

			map.addLayer({
				id: "route-preview",
				type: "line",
				source: "route-preview",
				paint: {
					"line-color": "#3b82f6",
					"line-width": 5,
					"line-opacity": 0.8,
				},
				layout: {
					"line-cap": "round",
					"line-join": "round",
				},
			});
		}

		return () => {
			if (map.getLayer("route-preview")) map.removeLayer("route-preview");
			if (map.getSource("route-preview")) map.removeSource("route-preview");
		};
	}, [routeWaypoints, routePath, creationMode]);

	// Cursor style based on creation mode
	useEffect(() => {
		if (!mapRef.current) return;
		const canvas = mapRef.current.getCanvas();
		canvas.style.cursor = creationMode !== "none" ? "crosshair" : "";
	}, [creationMode]);

	return (
		<div className={cn("relative h-full w-full", className)}>
			<div ref={mapContainer} className="absolute inset-0 rounded-lg z-0" />

			{/* Creation Mode Indicator */}
			{creationMode !== "none" && (
				<div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg">
					<span className="text-sm font-medium">
						{creationMode === "bin" && "Click on map to place bin"}
						{creationMode === "zone" &&
							`Click to add zone points (${zonePoints.length} points)`}
						{creationMode === "route" &&
							`Click to add route waypoints (${routeWaypoints.length} waypoints)`}
					</span>
				</div>
			)}

			{/* Map Legend */}
			<div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-card/95 p-3 shadow-lg backdrop-blur">
				<div className="mb-2 text-xs font-semibold text-foreground">Bin Fill Level</div>
				<div className="flex flex-col gap-1.5">
					{[
						{ label: "Empty (0-20%)", color: BIN_COLORS["bin-empty"] },
						{ label: "Low (20-40%)", color: BIN_COLORS["bin-low"] },
						{ label: "Medium (40-60%)", color: BIN_COLORS["bin-medium"] },
						{ label: "High (60-80%)", color: BIN_COLORS["bin-high"] },
						{ label: "Critical (80-100%)", color: BIN_COLORS["bin-critical"] },
					].map((item) => (
						<div key={item.label} className="flex items-center gap-2">
							<div
								className="h-3 w-3 rounded-full border-2 border-white shadow-sm"
								style={{ backgroundColor: item.color }}
							/>
							<span className="text-xs text-muted-foreground">{item.label}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
