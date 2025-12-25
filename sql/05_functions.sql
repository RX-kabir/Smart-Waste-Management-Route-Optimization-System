-- 05_functions.sql

-- 1) Average fill level for a bin in a time range
CREATE OR REPLACE FUNCTION smartwaste.fn_bin_average_fill_level(
  p_bin_id BIGINT,
  p_from   TIMESTAMPTZ,
  p_to     TIMESTAMPTZ
)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  SELECT AVG(fill_level_percent)
  FROM smartwaste.bin_readings
  WHERE bin_id = p_bin_id
    AND reading_time >= p_from
    AND reading_time <  p_to;
$$;

-- 2) Zone daily collected volume (liters)
CREATE OR REPLACE FUNCTION smartwaste.fn_zone_daily_collected_volume(
  p_zone_id BIGINT,
  p_date    DATE
)
RETURNS BIGINT
LANGUAGE sql
AS $$
  SELECT COALESCE(SUM(pe.volume_collected_liters), 0)::BIGINT
  FROM smartwaste.pickup_events pe
  JOIN smartwaste.bins b ON b.bin_id = pe.bin_id
  WHERE b.zone_id = p_zone_id
    AND pe.pickup_time >= p_date::timestamptz
    AND pe.pickup_time <  (p_date + 1)::timestamptz;
$$;

-- 3) Truck utilization rate (simple proxy)
-- NOTE: This uses liters vs kg as a proxy. If you later track pickup weight, replace accordingly.
CREATE OR REPLACE FUNCTION smartwaste.fn_truck_utilization_rate(
  p_truck_id BIGINT,
  p_from     DATE,
  p_to       DATE
)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  WITH total_collected AS (
    SELECT COALESCE(SUM(volume_collected_liters), 0) AS vol
    FROM smartwaste.pickup_events
    WHERE truck_id = p_truck_id
      AND pickup_time >= p_from::timestamptz
      AND pickup_time <  (p_to + 1)::timestamptz
  ),
  cap AS (
    SELECT capacity_kg::NUMERIC AS cap_kg
    FROM smartwaste.trucks
    WHERE truck_id = p_truck_id
  )
  SELECT CASE
    WHEN cap.cap_kg = 0 THEN 0
    ELSE (total_collected.vol::NUMERIC / cap.cap_kg)
  END
  FROM total_collected, cap;
$$;
