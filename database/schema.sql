-- =====================================================================
-- IntelliTrip — MySQL 8 Database Schema
-- =====================================================================
-- This file is a plain-SQL mirror of backend/prisma/schema.prisma.
-- It exists so the schema can be inspected, imported, or reverse
-- engineered directly in MySQL Workbench WITHOUT needing Node/Prisma.
--
-- In normal development you do NOT run this file by hand — Prisma
-- Migrate generates and applies the real migrations for you
-- (see README.md → Database Setup). This file is provided for:
--   1) Quick manual creation / viva demonstration in Workbench
--   2) Documentation of the exact relational design
--
-- Engine: InnoDB (required for foreign keys)
-- Charset: utf8mb4 (full Unicode incl. Hindi/Marathi text, emojis)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS intellitrip
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE intellitrip;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  full_name         VARCHAR(120)  NOT NULL,
  email             VARCHAR(190)  NOT NULL,
  mobile            VARCHAR(20)   NOT NULL,
  password_hash     VARCHAR(255)  NOT NULL,
  role              ENUM('USER','ADMIN','PARTNER') NOT NULL DEFAULT 'USER',
  is_verified       TINYINT(1)    NOT NULL DEFAULT 0,
  profile_image     VARCHAR(500)  NULL,
  language          VARCHAR(10)   NOT NULL DEFAULT 'en',
  budget_preference VARCHAR(20)   NULL,
  travel_style      VARCHAR(40)   NULL,
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- otp_verifications  (OTPs are stored HASHED, never plain text)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_verifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  otp_hash    VARCHAR(255) NOT NULL,
  purpose     ENUM('REGISTRATION','LOGIN','PASSWORD_RESET') NOT NULL DEFAULT 'REGISTRATION',
  expires_at  DATETIME(3) NOT NULL,
  consumed    TINYINT(1) NOT NULL DEFAULT 0,
  attempts    INT NOT NULL DEFAULT 0,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_otp_user (user_id),
  CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- user_preferences
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_preferences (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  user_id                   INT NOT NULL,
  favourite_destinations    JSON NULL,
  activities                JSON NULL,
  travel_style              VARCHAR(40) NULL,
  food_preference           VARCHAR(40) NULL,
  accommodation_preference  VARCHAR(40) NULL,
  activity_preference       VARCHAR(40) NULL,
  created_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_pref_user (user_id),
  CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destinations (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  slug              VARCHAR(140) NOT NULL,
  country           VARCHAR(80)  NOT NULL DEFAULT 'India',
  state             VARCHAR(80)  NULL,
  description       TEXT NOT NULL,
  image_url         VARCHAR(500) NULL,
  best_time_to_visit VARCHAR(120) NULL,
  avg_cost_per_day  DECIMAL(10,2) NULL,
  latitude          DECIMAL(10,7) NULL,
  longitude         DECIMAL(10,7) NULL,
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_destinations_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- places  (tourist places, activities, hidden gems)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  destination_id       INT NOT NULL,
  name                 VARCHAR(150) NOT NULL,
  description          TEXT NOT NULL,
  category             ENUM('ADVENTURE','NATURE','BEACH','FOOD','FAMILY','HISTORY',
                             'SHOPPING','NIGHTLIFE','SPIRITUAL','PHOTOGRAPHY','LUXURY') NOT NULL,
  is_hidden_gem        TINYINT(1) NOT NULL DEFAULT 0,
  latitude             DECIMAL(10,7) NULL,
  longitude            DECIMAL(10,7) NULL,
  image_url            VARCHAR(500) NULL,
  avg_duration_minutes INT NOT NULL DEFAULT 90,
  estimated_cost       DECIMAL(10,2) NOT NULL DEFAULT 0,
  rating               DECIMAL(2,1) NULL,
  address              VARCHAR(255) NULL,
  source               ENUM('SEEDED','VERIFIED') NOT NULL DEFAULT 'SEEDED',
  created_at           DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_places_destination (destination_id),
  KEY idx_places_category (category),
  KEY idx_places_hidden (is_hidden_gem),
  CONSTRAINT fk_places_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- trips
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  user_id                   INT NOT NULL,
  destination_id            INT NULL,
  title                     VARCHAR(200) NOT NULL,
  start_location             VARCHAR(150) NULL,
  start_date                DATE NOT NULL,
  end_date                  DATE NOT NULL,
  travellers                INT NOT NULL DEFAULT 1,
  trip_type                 VARCHAR(40) NULL,
  budget                    DECIMAL(10,2) NULL,
  currency                  VARCHAR(10) NOT NULL DEFAULT 'INR',
  interests                 JSON NULL,
  travel_style              VARCHAR(40) NULL,
  food_preference           VARCHAR(40) NULL,
  accommodation_preference  VARCHAR(40) NULL,
  activity_preference       VARCHAR(40) NULL,
  status                    ENUM('DRAFT','PLANNED','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  ai_summary                TEXT NULL,
  estimated_budget          DECIMAL(10,2) NULL,
  raw_ai_response           JSON NULL,
  created_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_trips_user (user_id),
  KEY idx_trips_destination (destination_id),
  CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_trips_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- trip_days
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_days (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  trip_id     INT NOT NULL,
  day_number  INT NOT NULL,
  title       VARCHAR(200) NULL,
  date        DATE NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_trip_day (trip_id, day_number),
  CONSTRAINT fk_tripdays_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- itinerary_items
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itinerary_items (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  trip_day_id        INT NOT NULL,
  place_id           INT NULL,
  name               VARCHAR(200) NOT NULL,
  description        TEXT NULL,
  location           VARCHAR(200) NULL,
  latitude           DECIMAL(10,7) NULL,
  longitude          DECIMAL(10,7) NULL,
  category           VARCHAR(40) NULL,
  start_time         VARCHAR(20) NULL,
  duration_minutes   INT NOT NULL DEFAULT 60,
  estimated_cost     DECIMAL(10,2) NOT NULL DEFAULT 0,
  order_index        INT NOT NULL DEFAULT 0,
  created_at         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_items_tripday (trip_day_id),
  KEY idx_items_place (place_id),
  CONSTRAINT fk_items_tripday FOREIGN KEY (trip_day_id) REFERENCES trip_days(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  trip_id       INT NULL,
  type          ENUM('HOTEL','FLIGHT','CAB','EXPERIENCE') NOT NULL,
  status        ENUM('PENDING','CONFIRMED','CANCELLED','FAILED') NOT NULL DEFAULT 'PENDING',
  provider      VARCHAR(60) NOT NULL DEFAULT 'MockBookingProvider',
  total_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency      VARCHAR(10) NOT NULL DEFAULT 'INR',
  is_mock       TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_trip (trip_id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- booking_items
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  booking_id   INT NOT NULL,
  item_name    VARCHAR(200) NOT NULL,
  description  VARCHAR(500) NULL,
  quantity     INT NOT NULL DEFAULT 1,
  unit_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
  metadata     JSON NULL,
  created_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_bookingitems_booking (booking_id),
  CONSTRAINT fk_bookingitems_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  booking_id       INT NOT NULL,
  user_id          INT NOT NULL,
  method           VARCHAR(20) NOT NULL DEFAULT 'UPI',
  provider         VARCHAR(60) NOT NULL DEFAULT 'MockPaymentProvider',
  amount           DECIMAL(10,2) NOT NULL,
  currency         VARCHAR(10) NOT NULL DEFAULT 'INR',
  status           ENUM('INITIATED','SUCCESS','FAILED') NOT NULL DEFAULT 'INITIATED',
  transaction_ref  VARCHAR(120) NULL,
  upi_id           VARCHAR(120) NULL,
  verified_at      DATETIME(3) NULL,
  created_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_payments_booking (booking_id),
  KEY idx_payments_user (user_id),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  trip_id         INT NOT NULL,
  category        ENUM('HOTEL','FOOD','TRANSPORT','ACTIVITIES','SHOPPING','OTHER') NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  description     VARCHAR(255) NULL,
  paid_by_user_id INT NOT NULL,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_expenses_trip (trip_id),
  KEY idx_expenses_paidby (paid_by_user_id),
  CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_paidby FOREIGN KEY (paid_by_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- expense_splits
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expense_splits (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  expense_id        INT NOT NULL,
  user_id           INT NULL,
  participant_name  VARCHAR(120) NULL,
  share_amount      DECIMAL(10,2) NOT NULL,
  settled           TINYINT(1) NOT NULL DEFAULT 0,
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_splits_expense (expense_id),
  KEY idx_splits_user (user_id),
  CONSTRAINT fk_splits_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  CONSTRAINT fk_splits_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- emergency_contacts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  type         ENUM('POLICE','HOSPITAL','FIRE','TOURIST_HELPLINE','GENERAL') NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  city         VARCHAR(80) NULL,
  state        VARCHAR(80) NULL,
  is_national  TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_emergency_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  place_id   INT NOT NULL,
  user_id    INT NULL,
  rating     DECIMAL(2,1) NOT NULL,
  comment    VARCHAR(500) NULL,
  is_seed    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_reviews_place (place_id),
  CONSTRAINT fk_reviews_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
