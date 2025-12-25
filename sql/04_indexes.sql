-- 04_indexes.sql

-- Bins
CREATE INDEX IF NOT EXISTS idx_bins_zone ON smartwaste.bins(zone_id);

-- Partial index for planning pickups quickly
CREATE INDEX IF NOT EXISTS idx_bins_need_pickup ON smartwaste.bins(zone_id, bin_id)
WHERE status IN ('needs_pickup','overflowing');

-- Readings
CREATE INDEX IF NOT EXISTS idx_binreadings_bin_time ON smartwaste.bin_readings(bin_id, reading_time DESC);

-- Routes
CREATE INDEX IF NOT EXISTS idx_routes_date ON smartwaste.routes(route_date);

-- Stops
CREATE INDEX IF NOT EXISTS idx_routestops_route ON smartwaste.route_stops(route_id);

-- Pickups
CREATE INDEX IF NOT EXISTS idx_pickups_bin_time ON smartwaste.pickup_events(bin_id, pickup_time DESC);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_table_time ON smartwaste.audit_logs(table_name, changed_at DESC);
