-- =====================================================================
-- IntelliTrip — Demo Reference Data (MySQL)
-- =====================================================================
-- This is a plain-SQL companion to backend/prisma/seed.js.
--
-- IMPORTANT: The authoritative seed script for day-to-day development
-- is `npx prisma db seed` (backend/prisma/seed.js) — it seeds
-- destinations, places, a demo user (with a properly bcrypt-hashed
-- password), preferences and emergency contacts in one consistent run.
--
-- This file exists so destinations/places/emergency-contacts can be
-- inspected or re-imported directly from MySQL Workbench without
-- running Node, and to satisfy the "database/seed.sql" deliverable.
-- It intentionally does NOT create the demo user, because a
-- bcrypt password hash cannot be produced portably in plain SQL —
-- run the Prisma seed for that (see README.md).
-- =====================================================================

USE intellitrip;

-- ---------------------------------------------------------------------
-- Destinations
-- ---------------------------------------------------------------------
INSERT INTO destinations (name, slug, country, state, description, image_url, best_time_to_visit, avg_cost_per_day, latitude, longitude) VALUES
('Goa', 'goa', 'India', 'Goa',
 'India''s beach capital — golden sands, Portuguese-era churches, vibrant nightlife and relaxed beach shacks along the Arabian Sea.',
 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', 'November to February', 3500.00, 15.2993, 74.1240),
('Kashmir', 'kashmir', 'India', 'Jammu & Kashmir',
 '"Paradise on Earth" — snow-capped Himalayan peaks, houseboats on Dal Lake, Mughal gardens and alpine meadows.',
 'https://images.unsplash.com/photo-1566837945700-30057527ade0', 'April to October', 4500.00, 34.0837, 74.7973),
('Manali', 'manali', 'India', 'Himachal Pradesh',
 'A Himalayan hill town known for adventure sports, snow-capped peaks, pine forests and the gateway to Ladakh via Rohtang Pass.',
 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23', 'March to June, October to February', 3000.00, 32.2432, 77.1892),
('Jaipur', 'jaipur', 'India', 'Rajasthan',
 'The "Pink City" — majestic forts, royal palaces, bustling bazaars and a living showcase of Rajputana heritage.',
 'https://images.unsplash.com/photo-1599661046289-e31897846e41', 'October to March', 2800.00, 26.9124, 75.7873),
('Mumbai', 'mumbai', 'India', 'Maharashtra',
 'India''s financial capital and city of dreams — colonial architecture, Bollywood, street food and the iconic Marine Drive.',
 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7', 'November to February', 4000.00, 19.0760, 72.8777),
('Kerala', 'kerala', 'India', 'Kerala',
 '"God''s Own Country" — tranquil backwaters, lush tea plantations, Ayurvedic wellness and pristine beaches.',
 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', 'September to March', 3200.00, 10.8505, 76.2711);

-- ---------------------------------------------------------------------
-- Places for Goa (destination_id = 1)
-- ---------------------------------------------------------------------
INSERT INTO places (destination_id, name, description, category, is_hidden_gem, latitude, longitude, image_url, avg_duration_minutes, estimated_cost, rating, address, source) VALUES
(1, 'Fort Aguada', 'A 17th-century Portuguese fort overlooking the Arabian Sea with a lighthouse and sweeping coastal views.', 'HISTORY', 0, 15.4925, 73.7738, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', 90, 100.00, 4.4, 'Candolim, Goa', 'SEEDED'),
(1, 'Baga Beach', 'A lively beach known for water sports, beach shacks and nightlife.', 'BEACH', 0, 15.5553, 73.7517, 'https://images.unsplash.com/photo-1587922546307-776227941871', 150, 0.00, 4.2, 'Baga, North Goa', 'SEEDED'),
(1, 'Anjuna Flea Market', 'A famous Wednesday market with handicrafts, clothes and live music.', 'SHOPPING', 0, 15.5738, 73.7411, 'https://images.unsplash.com/photo-1607083206968-13611e3d76db', 120, 500.00, 4.1, 'Anjuna, North Goa', 'SEEDED'),
(1, 'Cabo de Rama Fort', 'A quiet, lesser-visited cliffside fort with panoramic sea views and almost no crowds.', 'ADVENTURE', 1, 15.0866, 73.9273, 'https://images.unsplash.com/photo-1519046904884-53103b34b206', 90, 0.00, 4.6, 'Cabo de Rama, South Goa', 'SEEDED'),
(1, 'Butterfly Beach', 'A secluded cove accessible only by boat or a forest trek, rarely crowded.', 'NATURE', 1, 15.0090, 74.0180, 'https://images.unsplash.com/photo-1519046904884-53103b34b206', 120, 300.00, 4.7, 'Near Palolem, South Goa', 'SEEDED'),
(1, 'Mandrem Beach Shack Food Trail', 'Quiet beach shacks serving authentic Goan seafood curry and prawn balchão away from tourist crowds.', 'FOOD', 1, 15.6570, 73.7080, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 90, 600.00, 4.5, 'Mandrem, North Goa', 'SEEDED');

-- ---------------------------------------------------------------------
-- Places for Kashmir (destination_id = 2)
-- ---------------------------------------------------------------------
INSERT INTO places (destination_id, name, description, category, is_hidden_gem, latitude, longitude, image_url, avg_duration_minutes, estimated_cost, rating, address, source) VALUES
(2, 'Dal Lake Shikara Ride', 'A traditional wooden boat ride across the iconic Dal Lake, past floating gardens and houseboats.', 'NATURE', 0, 34.1057, 74.8500, 'https://images.unsplash.com/photo-1566837945700-30057527ade0', 90, 800.00, 4.7, 'Srinagar, Kashmir', 'SEEDED'),
(2, 'Gulmarg Gondola', 'One of the highest cable cars in the world, offering views of the Himalayas and access to skiing.', 'ADVENTURE', 0, 34.0484, 74.3805, 'https://images.unsplash.com/photo-1548777123-e216912df7d8', 180, 1500.00, 4.6, 'Gulmarg, Kashmir', 'SEEDED'),
(2, 'Mughal Gardens', 'Terraced Mughal-era gardens (Nishat & Shalimar Bagh) with fountains and Himalayan backdrops.', 'HISTORY', 0, 34.1195, 74.8790, 'https://images.unsplash.com/photo-1571401835393-8c5f35328320', 90, 50.00, 4.4, 'Srinagar, Kashmir', 'SEEDED'),
(2, 'Doodhpathri Meadows', 'A remote, less-commercialized alpine meadow often called a quieter alternative to Gulmarg.', 'NATURE', 1, 34.0300, 74.6600, 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', 150, 0.00, 4.8, 'Budgam, Kashmir', 'SEEDED'),
(2, 'Aru Valley', 'A tranquil village near Pahalgam that serves as the base for treks, away from mainstream tourist trails.', 'NATURE', 1, 34.1667, 75.2833, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23', 180, 200.00, 4.7, 'Pahalgam, Kashmir', 'SEEDED');

-- ---------------------------------------------------------------------
-- Places for Manali (destination_id = 3)
-- ---------------------------------------------------------------------
INSERT INTO places (destination_id, name, description, category, is_hidden_gem, latitude, longitude, image_url, avg_duration_minutes, estimated_cost, rating, address, source) VALUES
(3, 'Solang Valley', 'Adventure hub for paragliding, zorbing and snow activities with views of surrounding peaks.', 'ADVENTURE', 0, 32.3172, 77.1541, 'https://images.unsplash.com/photo-1601275551427-b8b96a03287a', 180, 1200.00, 4.5, 'Solang, Manali', 'SEEDED'),
(3, 'Hadimba Temple', 'A wooden cave temple set amid cedar forest, dedicated to Hidimba Devi.', 'SPIRITUAL', 0, 32.2497, 77.1737, 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', 60, 0.00, 4.5, 'Old Manali', 'SEEDED'),
(3, 'Old Manali Cafes', 'A relaxed strip of riverside cafes serving Israeli, Tibetan and Himachali food.', 'FOOD', 0, 32.2560, 77.1690, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 90, 500.00, 4.3, 'Old Manali', 'SEEDED'),
(3, 'Jogini Waterfall Trek', 'A short trek from Vashisht to a scenic waterfall, less crowded than Solang.', 'NATURE', 1, 32.2760, 77.1930, 'https://images.unsplash.com/photo-1439853949127-fa647821eba0', 120, 0.00, 4.6, 'Vashisht, Manali', 'SEEDED'),
(3, 'Naggar Castle', 'A 500-year-old castle-turned-heritage-hotel with mountain views, largely overlooked by tourists.', 'HISTORY', 1, 32.1284, 77.1738, 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', 90, 100.00, 4.5, 'Naggar, Kullu Valley', 'SEEDED');

-- ---------------------------------------------------------------------
-- Places for Jaipur (destination_id = 4)
-- ---------------------------------------------------------------------
INSERT INTO places (destination_id, name, description, category, is_hidden_gem, latitude, longitude, image_url, avg_duration_minutes, estimated_cost, rating, address, source) VALUES
(4, 'Amber Fort', 'A majestic hilltop fort with mirror-work palaces, elephant rides and mesmerizing evening light shows.', 'HISTORY', 0, 26.9855, 75.8513, 'https://images.unsplash.com/photo-1599661046289-e31897846e41', 150, 200.00, 4.7, 'Amer, Jaipur', 'SEEDED'),
(4, 'Hawa Mahal', 'The iconic five-story "Palace of Winds" with 953 intricately carved windows.', 'HISTORY', 0, 26.9239, 75.8267, 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 60, 50.00, 4.5, 'Badi Choupad, Jaipur', 'SEEDED'),
(4, 'Johari Bazaar', 'A historic bazaar famous for traditional Rajasthani jewellery and gemstones.', 'SHOPPING', 0, 26.9184, 75.8253, 'https://images.unsplash.com/photo-1607083206968-13611e3d76db', 90, 1000.00, 4.2, 'Johari Bazaar, Jaipur', 'SEEDED'),
(4, 'Nahargarh Fort Sunset Point', 'A hilltop fort offering the best panoramic sunset views over Jaipur, quieter than Amber Fort.', 'ADVENTURE', 1, 26.9373, 75.8154, 'https://images.unsplash.com/photo-1599661046289-e31897846e41', 90, 100.00, 4.6, 'Nahargarh, Jaipur', 'SEEDED'),
(4, 'Panna Meena ka Kund', 'A stunning symmetrical stepwell near Amber Fort, largely missed by mainstream tourists.', 'PHOTOGRAPHY', 1, 26.9843, 75.8508, 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 45, 0.00, 4.7, 'Amer, Jaipur', 'SEEDED');

-- ---------------------------------------------------------------------
-- Places for Mumbai (destination_id = 5)
-- ---------------------------------------------------------------------
INSERT INTO places (destination_id, name, description, category, is_hidden_gem, latitude, longitude, image_url, avg_duration_minutes, estimated_cost, rating, address, source) VALUES
(5, 'Gateway of India', 'An iconic colonial-era monument overlooking the Arabian Sea, next to the Taj Mahal Palace hotel.', 'HISTORY', 0, 18.9220, 72.8347, 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7', 60, 0.00, 4.5, 'Colaba, Mumbai', 'SEEDED'),
(5, 'Marine Drive', 'A sweeping boulevard along the coast, famously lit up at night as the "Queen''s Necklace".', 'NATURE', 0, 18.9432, 72.8234, 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7', 90, 0.00, 4.6, 'Marine Drive, Mumbai', 'SEEDED'),
(5, 'Mohammed Ali Road Food Street', 'A legendary night food street famous for kebabs, biryani and Ramadan specials.', 'FOOD', 0, 18.9581, 72.8320, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 90, 500.00, 4.5, 'Bhendi Bazaar, Mumbai', 'SEEDED'),
(5, 'Khotachiwadi Heritage Lanes', 'A hidden 18th-century Goan-Portuguese hamlet tucked inside Girgaon, rarely visited by tourists.', 'PHOTOGRAPHY', 1, 18.9578, 72.8155, 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 60, 0.00, 4.6, 'Girgaon, Mumbai', 'SEEDED'),
(5, 'Kanheri Caves', 'Ancient Buddhist rock-cut caves inside Sanjay Gandhi National Park, peaceful and uncrowded.', 'HISTORY', 1, 19.2117, 72.9106, 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', 120, 100.00, 4.4, 'Borivali, Mumbai', 'SEEDED');

-- ---------------------------------------------------------------------
-- Places for Kerala (destination_id = 6)
-- ---------------------------------------------------------------------
INSERT INTO places (destination_id, name, description, category, is_hidden_gem, latitude, longitude, image_url, avg_duration_minutes, estimated_cost, rating, address, source) VALUES
(6, 'Alleppey Backwaters', 'Houseboat cruises through tranquil palm-fringed canals and lagoons.', 'NATURE', 0, 9.4981, 76.3388, 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', 240, 4000.00, 4.8, 'Alappuzha, Kerala', 'SEEDED'),
(6, 'Munnar Tea Gardens', 'Rolling emerald tea plantations set against misty Western Ghats hills.', 'NATURE', 0, 10.0889, 77.0595, 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', 150, 300.00, 4.7, 'Munnar, Kerala', 'SEEDED'),
(6, 'Fort Kochi Heritage Walk', 'Colonial architecture, Chinese fishing nets and vibrant street art along the coast.', 'HISTORY', 0, 9.9658, 76.2422, 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 120, 200.00, 4.5, 'Fort Kochi, Kerala', 'SEEDED'),
(6, 'Gavi Rainforest', 'An eco-tourism reserve deep in the Western Ghats, seldom visited due to permit requirements.', 'ADVENTURE', 1, 9.4167, 77.1500, 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', 300, 1500.00, 4.8, 'Gavi, Pathanamthitta, Kerala', 'SEEDED'),
(6, 'Marari Beach', 'A quiet fishing-village beach without the crowds of Kovalam or Varkala.', 'BEACH', 1, 9.6023, 76.2894, 'https://images.unsplash.com/photo-1519046904884-53103b34b206', 120, 0.00, 4.6, 'Mararikulam, Kerala', 'SEEDED');

-- ---------------------------------------------------------------------
-- Emergency contacts (national + a few city-level examples)
-- ---------------------------------------------------------------------
INSERT INTO emergency_contacts (name, type, phone_number, city, state, is_national) VALUES
('National Emergency Number', 'GENERAL', '112', NULL, NULL, 1),
('Police', 'POLICE', '100', NULL, NULL, 1),
('Fire Brigade', 'FIRE', '101', NULL, NULL, 1),
('Ambulance', 'HOSPITAL', '102', NULL, NULL, 1),
('Tourist Helpline (Incredible India)', 'TOURIST_HELPLINE', '1363', NULL, NULL, 1),
('Women Helpline', 'GENERAL', '1091', NULL, NULL, 1),
('Goa Medical College Hospital', 'HOSPITAL', '0832-2458700', 'Panaji', 'Goa', 0),
('Shri Maharaja Hari Singh Hospital', 'HOSPITAL', '0194-2452111', 'Srinagar', 'Jammu & Kashmir', 0),
('SMS Hospital Jaipur', 'HOSPITAL', '0141-2560291', 'Jaipur', 'Rajasthan', 0);
