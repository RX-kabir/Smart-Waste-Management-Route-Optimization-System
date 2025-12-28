-- 06_procedures.sql
-- PostgreSQL procedures are supported from Postgres 11+.

-- 1) Plan route for a zone (set-based bulk insert)
CREATE OR REPLACE PROCEDURE smartwaste.sp_plan_route_for_zone(
  p_zone_id    BIGINT,
  p_truck_id   BIGINT,
  p_driver_id  BIGINT,
  p_route_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_route_id BIGINT;
BEGIN
  INSERT INTO smartwaste.routes(truck_id, driver_id, route_date, status)
  VALUES (p_truck_id, p_driver_id, p_route_date, 'planned')
  RETURNING route_id INTO v_route_id;

  -- Insert route stops for bins needing pickup
  INSERT INTO smartwaste.route_stops(route_id, bin_id, stop_order, planned_time)
  SELECT
    v_route_id,
    b.bin_id,
    ROW_NUMBER() OVER (ORDER BY b.bin_id) AS stop_order,
    (p_route_date::timestamptz + make_interval(mins => (ROW_NUMBER() OVER (ORDER BY b.bin_id)) * 10))
  FROM smartwaste.bins b
  WHERE b.zone_id = p_zone_id
    AND b.status IN ('needs_pickup','overflowing');

  -- If no bins matched, you still have a route; up to you whether to allow or raise an error.
  -- If you want to forbid empty routes, uncomment:
  -- IF NOT EXISTS (SELECT 1 FROM smartwaste.route_stops WHERE route_id = v_route_id) THEN
  --   RAISE EXCEPTION 'No bins require pickup in zone % on %', p_zone_id, p_route_date;
  -- END IF;
END;
$$;

-- 2) Start route
CREATE OR REPLACE PROCEDURE smartwaste.sp_start_route(p_route_id BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE smartwaste.routes
  SET status = 'in_progress'
  WHERE route_id = p_route_id
    AND status = 'planned';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Route % not found or not in planned state', p_route_id;
  END IF;
END;
$$;

-- 3) Complete route (only if all stops have actual_time)
CREATE OR REPLACE PROCEDURE smartwaste.sp_complete_route(p_route_id BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_open_stops INT;
BEGIN
  SELECT COUNT(*)
  INTO v_open_stops
  FROM smartwaste.route_stops
  WHERE route_id = p_route_id
    AND actual_time IS NULL;

  IF v_open_stops > 0 THEN
    RAISE EXCEPTION 'Route % cannot be completed: % stops missing actual_time', p_route_id, v_open_stops;
  END IF;

  UPDATE smartwaste.routes
  SET status = 'completed'
  WHERE route_id = p_route_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Route % not found', p_route_id;
  END IF;
END;
$$;
