-- 08_views.sql

-- 1) Zone waste summary
CREATE OR REPLACE VIEW smartwaste.vw_zone_waste_summary AS
SELECT
  z.zone_id,
  z.name AS zone_name,
  COUNT(b.bin_id) AS total_bins,
  COUNT(*) FILTER (WHERE b.status = 'overflowing') AS overflowing_bins,
  COUNT(*) FILTER (WHERE b.status = 'needs_pickup') AS bins_need_pickup,
  COUNT(*) FILTER (WHERE b.status = 'maintenance') AS maintenance_bins
FROM smartwaste.zones z
LEFT JOIN smartwaste.bins b ON b.zone_id = z.zone_id
GROUP BY z.zone_id, z.name;

-- 2) Truck route summary
CREATE OR REPLACE VIEW smartwaste.vw_truck_route_summary AS
SELECT
  t.truck_id,
  t.registration_no,
  r.route_date,
  COUNT(DISTINCT r.route_id) AS routes_count,
  COUNT(rs.route_stop_id) AS total_stops,
  COUNT(rs.route_stop_id) FILTER (WHERE rs.actual_time IS NOT NULL) AS completed_stops
FROM smartwaste.trucks t
LEFT JOIN smartwaste.routes r ON r.truck_id = t.truck_id
LEFT JOIN smartwaste.route_stops rs ON rs.route_id = r.route_id
GROUP BY t.truck_id, t.registration_no, r.route_date;
