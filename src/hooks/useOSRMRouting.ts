import { useState, useCallback } from 'react';

interface Waypoint {
  lat: number;
  lng: number;
}

interface RouteResult {
  path: Waypoint[];
  distance: number; // in kilometers
  duration: number; // in minutes
}

export function useOSRMRouting() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoute = useCallback(async (waypoints: Waypoint[]): Promise<RouteResult | null> => {
    if (waypoints.length < 2) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build OSRM coordinates string (lng,lat format)
      const coordinates = waypoints
        .map((wp) => `${wp.lng},${wp.lat}`)
        .join(';');

      // Use OSRM demo server - for production, use your own OSRM instance
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(data.message || 'No route found');
      }

      const route = data.routes[0];
      const geometry = route.geometry;

      // Convert GeoJSON coordinates to our format
      const path: Waypoint[] = geometry.coordinates.map((coord: [number, number]) => ({
        lng: coord[0],
        lat: coord[1],
      }));

      return {
        path,
        distance: route.distance / 1000, // Convert meters to kilometers
        duration: route.duration / 60, // Convert seconds to minutes
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate route';
      setError(message);
      console.error('OSRM routing error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getRoute,
    isLoading,
    error,
  };
}
