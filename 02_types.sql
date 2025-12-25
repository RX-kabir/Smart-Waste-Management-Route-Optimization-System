-- 02_types.sql
-- Enum types for status fields and waste categories

DO $$ BEGIN
  CREATE TYPE smartwaste.user_status  AS ENUM ('active','inactive','blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE smartwaste.bin_status   AS ENUM ('ok','needs_pickup','overflowing','maintenance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE smartwaste.truck_status AS ENUM ('available','in_service','maintenance','inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE smartwaste.route_status AS ENUM ('planned','in_progress','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE smartwaste.waste_type   AS ENUM ('general','plastic','organic','paper','glass','metal','hazardous');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
