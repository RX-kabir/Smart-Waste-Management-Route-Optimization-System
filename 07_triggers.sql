-- 07_triggers.sql
-- 3 main trigger behaviors:
-- (1) readings -> update bin status + overflow flag
-- (2) pickup -> reset bin status
-- (3) generic audit logging

-- (1) BEFORE INSERT on bin_readings: set overflow flag + update bin status
CREATE OR REPLACE FUNCTION smartwaste.trg_bin_readings_update_bin_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_overflow_alert := (NEW.fill_level_percent >= 90);

  UPDATE smartwaste.bins b
  SET status =
    CASE
      WHEN NEW.fill_level_percent >= 90 THEN 'overflowing'
      WHEN NEW.fill_level_percent >= 70 THEN 'needs_pickup'
      ELSE 'ok'
    END
  WHERE b.bin_id = NEW.bin_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bin_readings_before_insert ON smartwaste.bin_readings;
CREATE TRIGGER bin_readings_before_insert
BEFORE INSERT ON smartwaste.bin_readings
FOR EACH ROW
EXECUTE FUNCTION smartwaste.trg_bin_readings_update_bin_status();

-- (2) AFTER INSERT on pickup_events: reset bin to OK
CREATE OR REPLACE FUNCTION smartwaste.trg_pickup_reset_bin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE smartwaste.bins
  SET status = 'ok'
  WHERE bin_id = NEW.bin_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pickup_events_after_insert ON smartwaste.pickup_events;
CREATE TRIGGER pickup_events_after_insert
AFTER INSERT ON smartwaste.pickup_events
FOR EACH ROW
EXECUTE FUNCTION smartwaste.trg_pickup_reset_bin();

-- (3) Generic audit trigger function
-- Usage: EXECUTE FUNCTION smartwaste.trg_audit_generic('<pk_column_name>');
-- Your Node app should set this inside the transaction:
--   SET LOCAL app.user_id = '123';
CREATE OR REPLACE FUNCTION smartwaste.trg_audit_generic()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id BIGINT;
  v_pk_col TEXT := TG_ARGV[0];
  v_pk TEXT;
  v_old JSONB;
  v_new JSONB;
BEGIN
  v_user_id := NULLIF(current_setting('app.user_id', true), '')::BIGINT;

  IF (TG_OP = 'INSERT') THEN
    v_new := to_jsonb(NEW);
    v_pk := COALESCE(v_new ->> v_pk_col, 'unknown');
    INSERT INTO smartwaste.audit_logs(table_name, record_pk, operation_type, changed_by_user_id, old_row, new_row)
    VALUES (TG_TABLE_NAME, v_pk, TG_OP, v_user_id, NULL, v_new);
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_pk := COALESCE(v_new ->> v_pk_col, 'unknown');
    INSERT INTO smartwaste.audit_logs(table_name, record_pk, operation_type, changed_by_user_id, old_row, new_row)
    VALUES (TG_TABLE_NAME, v_pk, TG_OP, v_user_id, v_old, v_new);
    RETURN NEW;

  ELSE -- DELETE
    v_old := to_jsonb(OLD);
    v_pk := COALESCE(v_old ->> v_pk_col, 'unknown');
    INSERT INTO smartwaste.audit_logs(table_name, record_pk, operation_type, changed_by_user_id, old_row, new_row)
    VALUES (TG_TABLE_NAME, v_pk, TG_OP, v_user_id, v_old, NULL);
    RETURN OLD;
  END IF;
END;
$$;

-- Attach audit triggers to key tables (add/remove as you like)
DROP TRIGGER IF EXISTS audit_bins ON smartwaste.bins;
CREATE TRIGGER audit_bins
AFTER INSERT OR UPDATE OR DELETE ON smartwaste.bins
FOR EACH ROW EXECUTE FUNCTION smartwaste.trg_audit_generic('bin_id');

DROP TRIGGER IF EXISTS audit_routes ON smartwaste.routes;
CREATE TRIGGER audit_routes
AFTER INSERT OR UPDATE OR DELETE ON smartwaste.routes
FOR EACH ROW EXECUTE FUNCTION smartwaste.trg_audit_generic('route_id');

DROP TRIGGER IF EXISTS audit_trucks ON smartwaste.trucks;
CREATE TRIGGER audit_trucks
AFTER INSERT OR UPDATE OR DELETE ON smartwaste.trucks
FOR EACH ROW EXECUTE FUNCTION smartwaste.trg_audit_generic('truck_id');
