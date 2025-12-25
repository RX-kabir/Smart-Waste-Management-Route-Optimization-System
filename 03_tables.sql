-- 03_tables.sql

-- USERS / ROLES
CREATE TABLE IF NOT EXISTS smartwaste.users (
  user_id         BIGSERIAL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  status          smartwaste.user_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smartwaste.roles (
  role_id   SMALLSERIAL PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS smartwaste.user_roles (
  user_id BIGINT NOT NULL REFERENCES smartwaste.users(user_id) ON DELETE CASCADE,
  role_id SMALLINT NOT NULL REFERENCES smartwaste.roles(role_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ZONES / BINS
CREATE TABLE IF NOT EXISTS smartwaste.zones (
  zone_id     BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS smartwaste.bins (
  bin_id           BIGSERIAL PRIMARY KEY,
  zone_id          BIGINT NOT NULL REFERENCES smartwaste.zones(zone_id) ON DELETE RESTRICT,
  location         TEXT NOT NULL,  -- for later: add lat/lng or PostGIS geometry
  capacity_liters  INTEGER NOT NULL CHECK (capacity_liters > 0),
  waste_type       smartwaste.waste_type NOT NULL,
  status           smartwaste.bin_status NOT NULL DEFAULT 'ok',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BIN READINGS (IoT)
CREATE TABLE IF NOT EXISTS smartwaste.bin_readings (
  reading_id         BIGSERIAL PRIMARY KEY,
  bin_id             BIGINT NOT NULL REFERENCES smartwaste.bins(bin_id) ON DELETE CASCADE,
  reading_time       TIMESTAMPTZ NOT NULL DEFAULT now(),
  fill_level_percent NUMERIC(5,2) NOT NULL CHECK (fill_level_percent >= 0 AND fill_level_percent <= 100),
  temperature_c      NUMERIC(5,2),
  is_overflow_alert  BOOLEAN NOT NULL DEFAULT FALSE
);

-- TRUCKS / DRIVERS
CREATE TABLE IF NOT EXISTS smartwaste.trucks (
  truck_id         BIGSERIAL PRIMARY KEY,
  registration_no  TEXT NOT NULL UNIQUE,
  capacity_kg      INTEGER NOT NULL CHECK (capacity_kg > 0),
  status           smartwaste.truck_status NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS smartwaste.drivers (
  driver_id   BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL UNIQUE REFERENCES smartwaste.users(user_id) ON DELETE CASCADE,
  license_no  TEXT NOT NULL UNIQUE,
  phone       TEXT
);

-- ROUTES / STOPS / PICKUPS
CREATE TABLE IF NOT EXISTS smartwaste.routes (
  route_id     BIGSERIAL PRIMARY KEY,
  truck_id     BIGINT NOT NULL REFERENCES smartwaste.trucks(truck_id) ON DELETE RESTRICT,
  driver_id    BIGINT NOT NULL REFERENCES smartwaste.drivers(driver_id) ON DELETE RESTRICT,
  route_date   DATE NOT NULL,
  status       smartwaste.route_status NOT NULL DEFAULT 'planned',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smartwaste.route_stops (
  route_stop_id            BIGSERIAL PRIMARY KEY,
  route_id                 BIGINT NOT NULL REFERENCES smartwaste.routes(route_id) ON DELETE CASCADE,
  bin_id                   BIGINT NOT NULL REFERENCES smartwaste.bins(bin_id) ON DELETE RESTRICT,
  stop_order               INTEGER NOT NULL CHECK (stop_order > 0),
  planned_time             TIMESTAMPTZ,
  actual_time              TIMESTAMPTZ,
  collected_volume_liters  INTEGER CHECK (collected_volume_liters >= 0),
  UNIQUE (route_id, stop_order),
  UNIQUE (route_id, bin_id)
);

CREATE TABLE IF NOT EXISTS smartwaste.pickup_events (
  pickup_id                BIGSERIAL PRIMARY KEY,
  bin_id                   BIGINT NOT NULL REFERENCES smartwaste.bins(bin_id) ON DELETE RESTRICT,
  truck_id                 BIGINT NOT NULL REFERENCES smartwaste.trucks(truck_id) ON DELETE RESTRICT,
  driver_id                BIGINT NOT NULL REFERENCES smartwaste.drivers(driver_id) ON DELETE RESTRICT,
  pickup_time              TIMESTAMPTZ NOT NULL DEFAULT now(),
  volume_collected_liters  INTEGER NOT NULL CHECK (volume_collected_liters >= 0)
);

-- MAINTENANCE
CREATE TABLE IF NOT EXISTS smartwaste.maintenance_records (
  maintenance_id BIGSERIAL PRIMARY KEY,
  truck_id       BIGINT NOT NULL REFERENCES smartwaste.trucks(truck_id) ON DELETE CASCADE,
  start_date     DATE NOT NULL,
  end_date       DATE,
  description    TEXT,
  cost           NUMERIC(12,2) CHECK (cost >= 0)
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS smartwaste.audit_logs (
  audit_id           BIGSERIAL PRIMARY KEY,
  table_name         TEXT NOT NULL,
  record_pk          TEXT NOT NULL,  -- store PK as TEXT so this works for any table
  operation_type     TEXT NOT NULL CHECK (operation_type IN ('INSERT','UPDATE','DELETE')),
  changed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by_user_id BIGINT NULL REFERENCES smartwaste.users(user_id),
  old_row            JSONB,
  new_row            JSONB
);
