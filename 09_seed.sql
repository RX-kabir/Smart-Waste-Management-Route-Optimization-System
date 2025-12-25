-- 09_seed.sql (optional demo data)
-- NOTE: Password hashes should be created in Node (bcrypt/argon2). These are placeholders.

INSERT INTO smartwaste.roles(name) VALUES
  ('admin'), ('operator'), ('driver')
ON CONFLICT (name) DO NOTHING;

INSERT INTO smartwaste.zones(name, description) VALUES
  ('Zone A', 'North area'),
  ('Zone B', 'South area')
ON CONFLICT (name) DO NOTHING;

-- Users
INSERT INTO smartwaste.users(full_name, email, password_hash, status) VALUES
  ('Admin User', 'admin@example.com', 'HASH_ME_IN_NODE', 'active'),
  ('Driver One', 'driver1@example.com', 'HASH_ME_IN_NODE', 'active')
ON CONFLICT (email) DO NOTHING;

-- Assign roles
INSERT INTO smartwaste.user_roles(user_id, role_id)
SELECT u.user_id, r.role_id
FROM smartwaste.users u
JOIN smartwaste.roles r ON r.name = 'admin'
WHERE u.email = 'admin@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO smartwaste.user_roles(user_id, role_id)
SELECT u.user_id, r.role_id
FROM smartwaste.users u
JOIN smartwaste.roles r ON r.name = 'driver'
WHERE u.email = 'driver1@example.com'
ON CONFLICT DO NOTHING;

-- Driver profile
INSERT INTO smartwaste.drivers(user_id, license_no, phone)
SELECT u.user_id, 'LIC-0001', '+8801XXXXXXXXX'
FROM smartwaste.users u
WHERE u.email = 'driver1@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- Trucks
INSERT INTO smartwaste.trucks(registration_no, capacity_kg, status) VALUES
  ('DHAKA-TRK-01', 5000, 'available')
ON CONFLICT (registration_no) DO NOTHING;

-- Bins
-- Use zone lookup to keep IDs stable
INSERT INTO smartwaste.bins(zone_id, location, capacity_liters, waste_type, status)
SELECT z.zone_id, 'Road 1, Block A', 240, 'general', 'ok'
FROM smartwaste.zones z WHERE z.name='Zone A'
ON CONFLICT DO NOTHING;

INSERT INTO smartwaste.bins(zone_id, location, capacity_liters, waste_type, status)
SELECT z.zone_id, 'Road 2, Block B', 120, 'plastic', 'ok'
FROM smartwaste.zones z WHERE z.name='Zone A'
ON CONFLICT DO NOTHING;

-- Simulated readings (these will auto-update bin status via trigger)
INSERT INTO smartwaste.bin_readings(bin_id, fill_level_percent, temperature_c)
SELECT b.bin_id, 75, 29
FROM smartwaste.bins b
WHERE b.location='Road 1, Block A'
LIMIT 1;

INSERT INTO smartwaste.bin_readings(bin_id, fill_level_percent, temperature_c)
SELECT b.bin_id, 92, 31
FROM smartwaste.bins b
WHERE b.location='Road 2, Block B'
LIMIT 1;
