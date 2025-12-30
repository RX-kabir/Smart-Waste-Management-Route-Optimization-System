import { INITIAL_BINS, INITIAL_ROUTES, INITIAL_LOGS } from "@/data/mockData"

export interface AnalyticsData {
    overview: {
        total_bins: number
        total_routes: number
        total_collections: number
        avg_fill_level: number
    }
    binStatusDistribution: Array<{
        status: string
        count: number
    }>
    collectionTrends: Array<{
        date: string
        collections: number
    }>
    routePerformance: Array<{
        route_name: string
        total_bins: number
        completed_bins: number
        completion_rate: number
    }>
    driverStats: Array<{
        driver_name: string
        total_routes: number
        completed_routes: number
        total_collections: number
    }>
    topBins: Array<{
        bin_id: string
        location: string
        collections_count: number
        avg_fill_level: number
    }>
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalBins = INITIAL_BINS.length;
    const totalRoutes = INITIAL_ROUTES.length;
    const totalCollections = INITIAL_LOGS.filter(log => log.action === "Bin Emptied").length; // Assuming 'Bin Emptied' maps to 'bin_collection'
    const avgFillLevel = INITIAL_BINS.reduce((acc, bin) => acc + bin.currentFillLevel, 0) / totalBins || 0;

    // Bin Status Distribution
    const statusCounts = INITIAL_BINS.reduce((acc, bin) => {
        acc[bin.status] = (acc[bin.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const binStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
    }));

    // Collection Trends (Mocking some dates for demo purposes based on logs)
    const collectionTrends = INITIAL_LOGS
        .filter(log => log.action === "Bin Emptied")
        .map(log => ({
            date: log.timestamp.toISOString().split('T')[0],
            collections: 1 // In a real scenario, we'd group by date
        }));
    // Consolidate duplicates by date
    const consolidatedTrends = Object.values(collectionTrends.reduce((acc, curr) => {
        if (!acc[curr.date]) acc[curr.date] = { date: curr.date, collections: 0 };
        acc[curr.date].collections += curr.collections;
        return acc;
    }, {} as Record<string, { date: string, collections: number }>));


    // Route Performance
    const routePerformance = INITIAL_ROUTES.map(route => ({
        route_name: route.name,
        total_bins: route.stops.length,
        completed_bins: route.status === 'COMPLETED' ? route.stops.length : Math.floor(Math.random() * route.stops.length), // Mock completion
        completion_rate: route.status === 'COMPLETED' ? 100 : Math.floor(Math.random() * 90)
    }));

    // Driver Stats
    const driverStats = INITIAL_ROUTES.reduce((acc, route) => {
        if (!acc[route.assignedDriver]) {
            acc[route.assignedDriver] = {
                driver_name: route.assignedDriver,
                total_routes: 0,
                completed_routes: 0,
                total_collections: 0
            };
        }
        acc[route.assignedDriver].total_routes++;
        if (route.status === 'COMPLETED') acc[route.assignedDriver].completed_routes++;
        acc[route.assignedDriver].total_collections += route.stops.length; // Approximate
        return acc;
    }, {} as Record<string, any>);


    // Top Bins
    const topBins = INITIAL_BINS.map(bin => ({
        bin_id: bin.binId,
        location: bin.location,
        collections_count: Math.floor(Math.random() * 20) + 1, // Mock
        avg_fill_level: bin.currentFillLevel
    })).sort((a, b) => b.collections_count - a.collections_count).slice(0, 10);

    return {
        overview: {
            total_bins: totalBins,
            total_routes: totalRoutes,
            total_collections: totalCollections,
            avg_fill_level: avgFillLevel
        },
        binStatusDistribution,
        collectionTrends: consolidatedTrends,
        routePerformance,
        driverStats: Object.values(driverStats),
        topBins
    };
}