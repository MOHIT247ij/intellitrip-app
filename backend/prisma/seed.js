/**
 * prisma/seed.js
 * -----------------------------------------------------------------
 * Run with: npx prisma db seed  (also runs automatically after
 * `npx prisma migrate dev` the first time, and can be re-run safely —
 * every insert is an upsert keyed on a unique field, so running this
 * twice will not create duplicates).
 *
 * Seeds:
 *   - 20 destinations (Goa, Kashmir, Manali, Jaipur, Mumbai, Kerala, Delhi,
 *     Agra, Udaipur, Jodhpur, Varanasi, Rishikesh, Amritsar, Shimla,
 *     Darjeeling, Ooty, Mysore, Hampi, Pondicherry, Nainital) — any other
 *     Indian city not listed here is still covered live via the
 *     OpenStreetMap fallback in rag.service.js.
 *   - 4-6 places each, mixing popular attractions + hidden gems
 *   - National + a few city emergency contacts
 *   - One verified demo USER account + preferences (see README for
 *     the login credentials)
 *   - One demo ADMIN account
 * -----------------------------------------------------------------
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const destinationsData = [
  {
    name: 'Goa',
    slug: 'goa',
    state: 'Goa',
    description:
      "India's beach capital — golden sands, Portuguese-era churches, vibrant nightlife and relaxed beach shacks along the Arabian Sea.",
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
    bestTimeToVisit: 'November to February',
    avgCostPerDay: 3500,
    latitude: 15.2993,
    longitude: 74.124,
    places: [
      { name: 'Fort Aguada', description: 'A 17th-century Portuguese fort overlooking the Arabian Sea with a lighthouse and sweeping coastal views.', category: 'HISTORY', isHiddenGem: false, latitude: 15.4925, longitude: 73.7738, imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', avgDurationMinutes: 90, estimatedCost: 100, rating: 4.4, address: 'Candolim, Goa' },
      { name: 'Baga Beach', description: 'A lively beach known for water sports, beach shacks and nightlife.', category: 'BEACH', isHiddenGem: false, latitude: 15.5553, longitude: 73.7517, imageUrl: 'https://images.unsplash.com/photo-1587922546307-776227941871', avgDurationMinutes: 150, estimatedCost: 0, rating: 4.2, address: 'Baga, North Goa' },
      { name: 'Anjuna Flea Market', description: 'A famous Wednesday market with handicrafts, clothes and live music.', category: 'SHOPPING', isHiddenGem: false, latitude: 15.5738, longitude: 73.7411, imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db', avgDurationMinutes: 120, estimatedCost: 500, rating: 4.1, address: 'Anjuna, North Goa' },
      { name: 'Cabo de Rama Fort', description: 'A quiet, lesser-visited cliffside fort with panoramic sea views and almost no crowds.', category: 'ADVENTURE', isHiddenGem: true, latitude: 15.0866, longitude: 73.9273, imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.6, address: 'Cabo de Rama, South Goa' },
      { name: 'Butterfly Beach', description: 'A secluded cove accessible only by boat or a forest trek, rarely crowded.', category: 'NATURE', isHiddenGem: true, latitude: 15.009, longitude: 74.018, imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206', avgDurationMinutes: 120, estimatedCost: 300, rating: 4.7, address: 'Near Palolem, South Goa' },
      { name: 'Mandrem Beach Shack Food Trail', description: 'Quiet beach shacks serving authentic Goan seafood curry and prawn balchão away from tourist crowds.', category: 'FOOD', isHiddenGem: true, latitude: 15.657, longitude: 73.708, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', avgDurationMinutes: 90, estimatedCost: 600, rating: 4.5, address: 'Mandrem, North Goa' },
    ],
  },
  {
    name: 'Kashmir',
    slug: 'kashmir',
    state: 'Jammu & Kashmir',
    description: '"Paradise on Earth" — snow-capped Himalayan peaks, houseboats on Dal Lake, Mughal gardens and alpine meadows.',
    imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0',
    bestTimeToVisit: 'April to October',
    avgCostPerDay: 4500,
    latitude: 34.0837,
    longitude: 74.7973,
    places: [
      { name: 'Dal Lake Shikara Ride', description: 'A traditional wooden boat ride across the iconic Dal Lake, past floating gardens and houseboats.', category: 'NATURE', isHiddenGem: false, latitude: 34.1057, longitude: 74.85, imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0', avgDurationMinutes: 90, estimatedCost: 800, rating: 4.7, address: 'Srinagar, Kashmir' },
      { name: 'Gulmarg Gondola', description: 'One of the highest cable cars in the world, offering views of the Himalayas and access to skiing.', category: 'ADVENTURE', isHiddenGem: false, latitude: 34.0484, longitude: 74.3805, imageUrl: 'https://images.unsplash.com/photo-1548777123-e216912df7d8', avgDurationMinutes: 180, estimatedCost: 1500, rating: 4.6, address: 'Gulmarg, Kashmir' },
      { name: 'Mughal Gardens', description: 'Terraced Mughal-era gardens (Nishat & Shalimar Bagh) with fountains and Himalayan backdrops.', category: 'HISTORY', isHiddenGem: false, latitude: 34.1195, longitude: 74.879, imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320', avgDurationMinutes: 90, estimatedCost: 50, rating: 4.4, address: 'Srinagar, Kashmir' },
      { name: 'Doodhpathri Meadows', description: 'A remote, less-commercialized alpine meadow often called a quieter alternative to Gulmarg.', category: 'NATURE', isHiddenGem: true, latitude: 34.03, longitude: 74.66, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 150, estimatedCost: 0, rating: 4.8, address: 'Budgam, Kashmir' },
      { name: 'Aru Valley', description: 'A tranquil village near Pahalgam that serves as the base for treks, away from mainstream tourist trails.', category: 'NATURE', isHiddenGem: true, latitude: 34.1667, longitude: 75.2833, imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23', avgDurationMinutes: 180, estimatedCost: 200, rating: 4.7, address: 'Pahalgam, Kashmir' },
    ],
  },
  {
    name: 'Manali',
    slug: 'manali',
    state: 'Himachal Pradesh',
    description: 'A Himalayan hill town known for adventure sports, snow-capped peaks, pine forests and the gateway to Ladakh via Rohtang Pass.',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23',
    bestTimeToVisit: 'March to June, October to February',
    avgCostPerDay: 3000,
    latitude: 32.2432,
    longitude: 77.1892,
    places: [
      { name: 'Solang Valley', description: 'Adventure hub for paragliding, zorbing and snow activities with views of surrounding peaks.', category: 'ADVENTURE', isHiddenGem: false, latitude: 32.3172, longitude: 77.1541, imageUrl: 'https://images.unsplash.com/photo-1601275551427-b8b96a03287a', avgDurationMinutes: 180, estimatedCost: 1200, rating: 4.5, address: 'Solang, Manali' },
      { name: 'Hadimba Temple', description: 'A wooden cave temple set amid cedar forest, dedicated to Hidimba Devi.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 32.2497, longitude: 77.1737, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.5, address: 'Old Manali' },
      { name: 'Old Manali Cafes', description: 'A relaxed strip of riverside cafes serving Israeli, Tibetan and Himachali food.', category: 'FOOD', isHiddenGem: false, latitude: 32.256, longitude: 77.169, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', avgDurationMinutes: 90, estimatedCost: 500, rating: 4.3, address: 'Old Manali' },
      { name: 'Jogini Waterfall Trek', description: 'A short trek from Vashisht to a scenic waterfall, less crowded than Solang.', category: 'NATURE', isHiddenGem: true, latitude: 32.276, longitude: 77.193, imageUrl: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0', avgDurationMinutes: 120, estimatedCost: 0, rating: 4.6, address: 'Vashisht, Manali' },
      { name: 'Naggar Castle', description: 'A 500-year-old castle-turned-heritage-hotel with mountain views, largely overlooked by tourists.', category: 'HISTORY', isHiddenGem: true, latitude: 32.1284, longitude: 77.1738, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 90, estimatedCost: 100, rating: 4.5, address: 'Naggar, Kullu Valley' },
    ],
  },
  {
    name: 'Jaipur',
    slug: 'jaipur',
    state: 'Rajasthan',
    description: 'The "Pink City" — majestic forts, royal palaces, bustling bazaars and a living showcase of Rajputana heritage.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 2800,
    latitude: 26.9124,
    longitude: 75.7873,
    places: [
      { name: 'Amber Fort', description: 'A majestic hilltop fort with mirror-work palaces, elephant rides and mesmerizing evening light shows.', category: 'HISTORY', isHiddenGem: false, latitude: 26.9855, longitude: 75.8513, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 150, estimatedCost: 200, rating: 4.7, address: 'Amer, Jaipur' },
      { name: 'Hawa Mahal', description: 'The iconic five-story "Palace of Winds" with 953 intricately carved windows.', category: 'HISTORY', isHiddenGem: false, latitude: 26.9239, longitude: 75.8267, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 60, estimatedCost: 50, rating: 4.5, address: 'Badi Choupad, Jaipur' },
      { name: 'Johari Bazaar', description: 'A historic bazaar famous for traditional Rajasthani jewellery and gemstones.', category: 'SHOPPING', isHiddenGem: false, latitude: 26.9184, longitude: 75.8253, imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db', avgDurationMinutes: 90, estimatedCost: 1000, rating: 4.2, address: 'Johari Bazaar, Jaipur' },
      { name: 'Nahargarh Fort Sunset Point', description: 'A hilltop fort offering the best panoramic sunset views over Jaipur, quieter than Amber Fort.', category: 'ADVENTURE', isHiddenGem: true, latitude: 26.9373, longitude: 75.8154, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 90, estimatedCost: 100, rating: 4.6, address: 'Nahargarh, Jaipur' },
      { name: 'Panna Meena ka Kund', description: 'A stunning symmetrical stepwell near Amber Fort, largely missed by mainstream tourists.', category: 'PHOTOGRAPHY', isHiddenGem: true, latitude: 26.9843, longitude: 75.8508, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 45, estimatedCost: 0, rating: 4.7, address: 'Amer, Jaipur' },
    ],
  },
  {
    name: 'Mumbai',
    slug: 'mumbai',
    state: 'Maharashtra',
    description: "India's financial capital and city of dreams — colonial architecture, Bollywood, street food and the iconic Marine Drive.",
    imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7',
    bestTimeToVisit: 'November to February',
    avgCostPerDay: 4000,
    latitude: 19.076,
    longitude: 72.8777,
    places: [
      { name: 'Gateway of India', description: 'An iconic colonial-era monument overlooking the Arabian Sea, next to the Taj Mahal Palace hotel.', category: 'HISTORY', isHiddenGem: false, latitude: 18.922, longitude: 72.8347, imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.5, address: 'Colaba, Mumbai' },
      { name: 'Marine Drive', description: "A sweeping boulevard along the coast, famously lit up at night as the \"Queen's Necklace\".", category: 'NATURE', isHiddenGem: false, latitude: 18.9432, longitude: 72.8234, imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.6, address: 'Marine Drive, Mumbai' },
      { name: 'Mohammed Ali Road Food Street', description: 'A legendary night food street famous for kebabs, biryani and Ramadan specials.', category: 'FOOD', isHiddenGem: false, latitude: 18.9581, longitude: 72.832, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', avgDurationMinutes: 90, estimatedCost: 500, rating: 4.5, address: 'Bhendi Bazaar, Mumbai' },
      { name: 'Khotachiwadi Heritage Lanes', description: 'A hidden 18th-century Goan-Portuguese hamlet tucked inside Girgaon, rarely visited by tourists.', category: 'PHOTOGRAPHY', isHiddenGem: true, latitude: 18.9578, longitude: 72.8155, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.6, address: 'Girgaon, Mumbai' },
      { name: 'Kanheri Caves', description: 'Ancient Buddhist rock-cut caves inside Sanjay Gandhi National Park, peaceful and uncrowded.', category: 'HISTORY', isHiddenGem: true, latitude: 19.2117, longitude: 72.9106, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 120, estimatedCost: 100, rating: 4.4, address: 'Borivali, Mumbai' },
    ],
  },
  {
    name: 'Kerala',
    slug: 'kerala',
    state: 'Kerala',
    description: '"God\'s Own Country" — tranquil backwaters, lush tea plantations, Ayurvedic wellness and pristine beaches.',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
    bestTimeToVisit: 'September to March',
    avgCostPerDay: 3200,
    latitude: 10.8505,
    longitude: 76.2711,
    places: [
      { name: 'Alleppey Backwaters', description: 'Houseboat cruises through tranquil palm-fringed canals and lagoons.', category: 'NATURE', isHiddenGem: false, latitude: 9.4981, longitude: 76.3388, imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', avgDurationMinutes: 240, estimatedCost: 4000, rating: 4.8, address: 'Alappuzha, Kerala' },
      { name: 'Munnar Tea Gardens', description: 'Rolling emerald tea plantations set against misty Western Ghats hills.', category: 'NATURE', isHiddenGem: false, latitude: 10.0889, longitude: 77.0595, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', avgDurationMinutes: 150, estimatedCost: 300, rating: 4.7, address: 'Munnar, Kerala' },
      { name: 'Fort Kochi Heritage Walk', description: 'Colonial architecture, Chinese fishing nets and vibrant street art along the coast.', category: 'HISTORY', isHiddenGem: false, latitude: 9.9658, longitude: 76.2422, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 120, estimatedCost: 200, rating: 4.5, address: 'Fort Kochi, Kerala' },
      { name: 'Gavi Rainforest', description: 'An eco-tourism reserve deep in the Western Ghats, seldom visited due to permit requirements.', category: 'ADVENTURE', isHiddenGem: true, latitude: 9.4167, longitude: 77.15, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 300, estimatedCost: 1500, rating: 4.8, address: 'Gavi, Pathanamthitta, Kerala' },
      { name: 'Marari Beach', description: 'A quiet fishing-village beach without the crowds of Kovalam or Varkala.', category: 'BEACH', isHiddenGem: true, latitude: 9.6023, longitude: 76.2894, imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206', avgDurationMinutes: 120, estimatedCost: 0, rating: 4.6, address: 'Mararikulam, Kerala' },
    ],
  },
  {
    name: 'Delhi',
    slug: 'delhi',
    state: 'Delhi',
    description: "India's capital — a layered mix of Mughal-era monuments, colonial New Delhi, bustling old-city bazaars and modern culture.",
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 3000,
    latitude: 28.6139,
    longitude: 77.209,
    places: [
      { name: 'India Gate', description: 'A 42m war memorial arch and one of Delhi\'s most iconic landmarks, especially lively in the evening.', category: 'HISTORY', isHiddenGem: false, latitude: 28.6129, longitude: 77.2295, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.6, address: 'Rajpath, New Delhi' },
      { name: 'Red Fort', description: 'A massive 17th-century Mughal fort of red sandstone, the site of India\'s Independence Day flag hoisting.', category: 'HISTORY', isHiddenGem: false, latitude: 28.6562, longitude: 77.241, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 120, estimatedCost: 50, rating: 4.5, address: 'Chandni Chowk, Old Delhi' },
      { name: 'Chandni Chowk', description: 'One of India\'s oldest and busiest markets, famous for street food, spices and narrow lanes.', category: 'SHOPPING', isHiddenGem: false, latitude: 28.6506, longitude: 77.2303, imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db', avgDurationMinutes: 120, estimatedCost: 500, rating: 4.3, address: 'Old Delhi' },
      { name: 'Humayun\'s Tomb', description: 'A Mughal garden-tomb that inspired the Taj Mahal, with fewer crowds than the more famous forts.', category: 'PHOTOGRAPHY', isHiddenGem: true, latitude: 28.5933, longitude: 77.2507, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 90, estimatedCost: 40, rating: 4.7, address: 'Nizamuddin, Delhi' },
      { name: 'Hauz Khas Village', description: 'A trendy lane of cafes and boutiques set beside a medieval reservoir and ruins, popular in the evening.', category: 'NIGHTLIFE', isHiddenGem: true, latitude: 28.5535, longitude: 77.1936, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', avgDurationMinutes: 120, estimatedCost: 600, rating: 4.4, address: 'Hauz Khas, Delhi' },
    ],
  },
  {
    name: 'Agra',
    slug: 'agra',
    state: 'Uttar Pradesh',
    description: 'Home to the Taj Mahal — a city of Mughal marble monuments, forts and centuries of history along the Yamuna river.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 2500,
    latitude: 27.1767,
    longitude: 78.0081,
    places: [
      { name: 'Taj Mahal', description: 'The legendary white-marble mausoleum, one of the Seven Wonders of the World.', category: 'HISTORY', isHiddenGem: false, latitude: 27.1751, longitude: 78.0421, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 150, estimatedCost: 250, rating: 4.9, address: 'Dharmapuri, Agra' },
      { name: 'Agra Fort', description: 'A red-sandstone Mughal fort and UNESCO site overlooking the Yamuna, near the Taj Mahal.', category: 'HISTORY', isHiddenGem: false, latitude: 27.1795, longitude: 78.0211, imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', avgDurationMinutes: 120, estimatedCost: 100, rating: 4.6, address: 'Agra Fort, Agra' },
      { name: 'Fatehpur Sikri', description: 'A perfectly preserved Mughal ghost city built by Akbar, a short drive from Agra.', category: 'HISTORY', isHiddenGem: false, latitude: 27.0937, longitude: 77.6608, imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320', avgDurationMinutes: 150, estimatedCost: 100, rating: 4.5, address: 'Fatehpur Sikri, Agra' },
      { name: 'Mehtab Bagh', description: 'A quiet garden directly across the river from the Taj Mahal — the best (and least crowded) sunset view.', category: 'PHOTOGRAPHY', isHiddenGem: true, latitude: 27.1783, longitude: 78.0424, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 60, estimatedCost: 30, rating: 4.7, address: 'Mehtab Bagh, Agra' },
      { name: 'Sadar Bazaar', description: 'A local market for marble handicrafts, leather goods and Agra\'s famous petha sweets.', category: 'SHOPPING', isHiddenGem: true, latitude: 27.193, longitude: 78.01, imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db', avgDurationMinutes: 90, estimatedCost: 400, rating: 4.2, address: 'Sadar Bazaar, Agra' },
    ],
  },
  {
    name: 'Udaipur',
    slug: 'udaipur',
    state: 'Rajasthan',
    description: 'The "City of Lakes" — romantic palaces, shimmering lakes and whitewashed havelis set against the Aravalli hills.',
    imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0',
    bestTimeToVisit: 'September to March',
    avgCostPerDay: 3200,
    latitude: 24.5854,
    longitude: 73.7125,
    places: [
      { name: 'City Palace', description: 'A grand lakeside palace complex blending Rajasthani and Mughal architecture, with museums and courtyards.', category: 'HISTORY', isHiddenGem: false, latitude: 24.5764, longitude: 73.6833, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 120, estimatedCost: 300, rating: 4.7, address: 'City Palace Road, Udaipur' },
      { name: 'Lake Pichola Boat Ride', description: 'A sunset boat ride past the Lake Palace and Jag Mandir on Udaipur\'s iconic lake.', category: 'NATURE', isHiddenGem: false, latitude: 24.5711, longitude: 73.6787, imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0', avgDurationMinutes: 60, estimatedCost: 700, rating: 4.8, address: 'Lake Pichola, Udaipur' },
      { name: 'Saheliyon Ki Bari', description: 'A landscaped garden of fountains and marble kiosks, built for the queens\' attendants.', category: 'NATURE', isHiddenGem: false, latitude: 24.6027, longitude: 73.6913, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', avgDurationMinutes: 60, estimatedCost: 20, rating: 4.3, address: 'Saheliyon Ki Bari, Udaipur' },
      { name: 'Sajjangarh (Monsoon Palace)', description: 'A hilltop palace overlooking the whole city and lakes, best at sunset and far less crowded than the City Palace.', category: 'PHOTOGRAPHY', isHiddenGem: true, latitude: 24.6042, longitude: 73.665, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 90, estimatedCost: 100, rating: 4.6, address: 'Sajjangarh, Udaipur' },
    ],
  },
  {
    name: 'Jodhpur',
    slug: 'jodhpur',
    state: 'Rajasthan',
    description: 'The "Blue City" — a maze of indigo-washed houses beneath the towering Mehrangarh Fort in the Thar desert.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 2600,
    latitude: 26.2389,
    longitude: 73.0243,
    places: [
      { name: 'Mehrangarh Fort', description: 'One of India\'s largest forts, towering 122m above the Blue City with sweeping desert views.', category: 'HISTORY', isHiddenGem: false, latitude: 26.2979, longitude: 73.0182, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 150, estimatedCost: 200, rating: 4.8, address: 'Mehrangarh, Jodhpur' },
      { name: 'Blue City Old Town Walk', description: 'A walk through narrow lanes of indigo-blue houses in the historic old city below the fort.', category: 'PHOTOGRAPHY', isHiddenGem: false, latitude: 26.29, longitude: 73.017, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.6, address: 'Old City, Jodhpur' },
      { name: 'Jaswant Thada', description: 'An elegant white-marble cenotaph beside the fort, quiet and often overlooked by tourists.', category: 'HISTORY', isHiddenGem: true, latitude: 26.3016, longitude: 73.0219, imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320', avgDurationMinutes: 45, estimatedCost: 30, rating: 4.5, address: 'Jaswant Thada, Jodhpur' },
      { name: 'Umaid Bhawan Palace', description: 'One of the world\'s largest private residences, part palace-museum and part luxury hotel.', category: 'LUXURY', isHiddenGem: false, latitude: 26.2588, longitude: 73.0384, imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', avgDurationMinutes: 90, estimatedCost: 150, rating: 4.6, address: 'Umaid Bhawan, Jodhpur' },
    ],
  },
  {
    name: 'Varanasi',
    slug: 'varanasi',
    state: 'Uttar Pradesh',
    description: 'One of the world\'s oldest living cities — ancient ghats along the Ganges, sacred temples and evening Ganga Aarti.',
    imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 2200,
    latitude: 25.3176,
    longitude: 82.9739,
    places: [
      { name: 'Dashashwamedh Ghat Ganga Aarti', description: 'A mesmerizing nightly fire ceremony on the main ghat, with priests, drums and floating lamps.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 25.3059, longitude: 83.0104, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.8, address: 'Dashashwamedh Ghat, Varanasi' },
      { name: 'Kashi Vishwanath Temple', description: 'One of the twelve Jyotirlinga shrines, among the holiest Hindu temples in India.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 25.3109, longitude: 83.0107, imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.7, address: 'Vishwanath Gali, Varanasi' },
      { name: 'Sunrise Boat Ride on the Ganges', description: 'An early-morning rowboat ride past the ghats as pilgrims bathe and the city wakes.', category: 'NATURE', isHiddenGem: false, latitude: 25.3115, longitude: 83.0095, imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0', avgDurationMinutes: 60, estimatedCost: 500, rating: 4.8, address: 'Assi Ghat, Varanasi' },
      { name: 'Sarnath', description: 'A tranquil Buddhist site where the Buddha gave his first sermon, with ruins and a museum.', category: 'HISTORY', isHiddenGem: true, latitude: 25.3811, longitude: 83.0228, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 90, estimatedCost: 40, rating: 4.5, address: 'Sarnath, Varanasi' },
    ],
  },
  {
    name: 'Rishikesh',
    slug: 'rishikesh',
    state: 'Uttarakhand',
    description: 'The "Yoga Capital of the World" — Himalayan foothills, the sacred Ganges, ashrams and white-water rafting.',
    imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99',
    bestTimeToVisit: 'September to November, February to April',
    avgCostPerDay: 2000,
    latitude: 30.0869,
    longitude: 78.2676,
    places: [
      { name: 'Laxman Jhula', description: 'An iconic suspension bridge over the Ganges, lined with shops, temples and monkeys.', category: 'PHOTOGRAPHY', isHiddenGem: false, latitude: 30.1219, longitude: 78.3269, imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.5, address: 'Laxman Jhula, Rishikesh' },
      { name: 'Ganga River Rafting', description: 'White-water rafting through rapids on the Ganges, one of India\'s best rafting stretches.', category: 'ADVENTURE', isHiddenGem: false, latitude: 30.13, longitude: 78.32, imageUrl: 'https://images.unsplash.com/photo-1601275551427-b8b96a03287a', avgDurationMinutes: 180, estimatedCost: 800, rating: 4.7, address: 'Shivpuri, Rishikesh' },
      { name: 'Parmarth Niketan Evening Aarti', description: 'A riverside prayer ceremony with chanting and lamps at one of Rishikesh\'s largest ashrams.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 30.1197, longitude: 78.32, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.7, address: 'Parmarth Niketan, Rishikesh' },
      { name: 'Beatles Ashram', description: 'The abandoned ashram where the Beatles once stayed, now covered in graffiti art — a quiet, offbeat stop.', category: 'PHOTOGRAPHY', isHiddenGem: true, latitude: 30.1147, longitude: 78.3067, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 90, estimatedCost: 600, rating: 4.4, address: 'Chaurasi Kutia, Rishikesh' },
    ],
  },
  {
    name: 'Amritsar',
    slug: 'amritsar',
    state: 'Punjab',
    description: 'Spiritual heart of Sikhism — the shimmering Golden Temple, rich Punjabi food and the dramatic Wagah Border ceremony.',
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 2000,
    latitude: 31.634,
    longitude: 74.8723,
    places: [
      { name: 'Golden Temple', description: 'Sikhism\'s holiest shrine, a gold-plated temple set in a sacred pool, open 24 hours with a free community kitchen.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 31.62, longitude: 74.8765, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 120, estimatedCost: 0, rating: 4.9, address: 'Golden Temple Road, Amritsar' },
      { name: 'Wagah Border Ceremony', description: 'A high-energy flag-lowering ceremony at the India-Pakistan border, with cheering crowds on both sides.', category: 'FAMILY', isHiddenGem: false, latitude: 31.6048, longitude: 74.5738, imageUrl: 'https://images.unsplash.com/photo-1548777123-e216912df7d8', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.6, address: 'Wagah, Amritsar' },
      { name: 'Jallianwala Bagh', description: 'A memorial garden marking the site of the 1919 massacre, with a museum on the freedom struggle.', category: 'HISTORY', isHiddenGem: false, latitude: 31.6205, longitude: 74.88, imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.5, address: 'Jallianwala Bagh, Amritsar' },
      { name: 'Kesar Da Dhaba', description: 'A century-old local eatery serving classic Punjabi thalis, favored by locals over touristy spots.', category: 'FOOD', isHiddenGem: true, latitude: 31.629, longitude: 74.8755, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', avgDurationMinutes: 60, estimatedCost: 300, rating: 4.5, address: 'Chowk Passian, Amritsar' },
    ],
  },
  {
    name: 'Shimla',
    slug: 'shimla',
    state: 'Himachal Pradesh',
    description: 'The former British summer capital — colonial architecture, pine-forested ridges and the toy train through the hills.',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23',
    bestTimeToVisit: 'March to June, December to February',
    avgCostPerDay: 2800,
    latitude: 31.1048,
    longitude: 77.1734,
    places: [
      { name: 'The Ridge & Mall Road', description: 'Shimla\'s pedestrian-only heart — colonial buildings, cafes and sweeping mountain views.', category: 'PHOTOGRAPHY', isHiddenGem: false, latitude: 31.1041, longitude: 77.1726, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.5, address: 'The Ridge, Shimla' },
      { name: 'Jakhu Temple', description: 'A hilltop Hanuman temple with a giant statue and panoramic Himalayan views, reached by a short trek.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 31.1075, longitude: 77.1875, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.4, address: 'Jakhu Hill, Shimla' },
      { name: 'Kufri', description: 'A small hill station near Shimla popular for pony rides, snow (in winter) and valley views.', category: 'ADVENTURE', isHiddenGem: false, latitude: 31.0996, longitude: 77.2674, imageUrl: 'https://images.unsplash.com/photo-1601275551427-b8b96a03287a', avgDurationMinutes: 150, estimatedCost: 300, rating: 4.3, address: 'Kufri, Shimla' },
      { name: 'Chadwick Falls', description: 'A secluded waterfall trail through deodar forest, a peaceful escape from the crowded Mall Road.', category: 'NATURE', isHiddenGem: true, latitude: 31.0806, longitude: 77.1442, imageUrl: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0', avgDurationMinutes: 120, estimatedCost: 0, rating: 4.5, address: 'Summer Hill, Shimla' },
    ],
  },
  {
    name: 'Darjeeling',
    slug: 'darjeeling',
    state: 'West Bengal',
    description: 'Queen of the Himalayan hill stations — rolling tea gardens, misty peaks and views of Kanchenjunga.',
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    bestTimeToVisit: 'March to May, October to November',
    avgCostPerDay: 2600,
    latitude: 27.041,
    longitude: 88.2663,
    places: [
      { name: 'Tiger Hill Sunrise', description: 'A famous pre-dawn viewpoint for watching sunrise over Kanchenjunga, the world\'s third-highest peak.', category: 'NATURE', isHiddenGem: false, latitude: 27.0, longitude: 88.25, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 120, estimatedCost: 200, rating: 4.7, address: 'Tiger Hill, Darjeeling' },
      { name: 'Darjeeling Himalayan Railway (Toy Train)', description: 'A UNESCO World Heritage narrow-gauge railway looping through the hills — the iconic "Toy Train".', category: 'ADVENTURE', isHiddenGem: false, latitude: 27.0433, longitude: 88.2636, imageUrl: 'https://images.unsplash.com/photo-1601275551427-b8b96a03287a', avgDurationMinutes: 120, estimatedCost: 600, rating: 4.6, address: 'Darjeeling Railway Station' },
      { name: 'Happy Valley Tea Estate', description: 'One of Darjeeling\'s oldest tea gardens, open for tours and tastings of the famous Darjeeling tea.', category: 'NATURE', isHiddenGem: false, latitude: 27.0453, longitude: 88.2497, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', avgDurationMinutes: 90, estimatedCost: 150, rating: 4.4, address: 'Happy Valley, Darjeeling' },
      { name: 'Batasia Loop', description: 'A scenic spiral railway loop with a war memorial and views of the Kanchenjunga range, quieter than Tiger Hill.', category: 'PHOTOGRAPHY', isHiddenGem: true, latitude: 27.0333, longitude: 88.25, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 45, estimatedCost: 20, rating: 4.5, address: 'Batasia Loop, Darjeeling' },
    ],
  },
  {
    name: 'Ooty',
    slug: 'ooty',
    state: 'Tamil Nadu',
    description: 'The "Queen of Hill Stations" in the Nilgiris — tea estates, botanical gardens and a cool climate year-round.',
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187',
    bestTimeToVisit: 'October to June',
    avgCostPerDay: 2400,
    latitude: 11.4064,
    longitude: 76.6932,
    places: [
      { name: 'Ooty Lake', description: 'A picturesque artificial lake in the town center, popular for boating amid eucalyptus trees.', category: 'NATURE', isHiddenGem: false, latitude: 11.4085, longitude: 76.6934, imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0', avgDurationMinutes: 90, estimatedCost: 100, rating: 4.3, address: 'Ooty Lake, Ooty' },
      { name: 'Government Botanical Garden', description: 'Century-old terraced gardens with rare plant species and a fossilised tree trunk exhibit.', category: 'NATURE', isHiddenGem: false, latitude: 11.4145, longitude: 76.7132, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', avgDurationMinutes: 90, estimatedCost: 50, rating: 4.4, address: 'Ooty Botanical Garden' },
      { name: 'Doddabetta Peak', description: 'The highest point in the Nilgiris, with a telescope house and views across Tamil Nadu and Kerala.', category: 'PHOTOGRAPHY', isHiddenGem: false, latitude: 11.4064, longitude: 76.7328, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 90, estimatedCost: 30, rating: 4.5, address: 'Doddabetta, Ooty' },
      { name: 'Nilgiri Mountain Railway', description: 'A UNESCO heritage mountain railway climbing through tea gardens and forest — a slower, scenic alternative to the road.', category: 'ADVENTURE', isHiddenGem: true, latitude: 11.41, longitude: 76.695, imageUrl: 'https://images.unsplash.com/photo-1601275551427-b8b96a03287a', avgDurationMinutes: 180, estimatedCost: 500, rating: 4.6, address: 'Ooty Railway Station' },
    ],
  },
  {
    name: 'Mysore',
    slug: 'mysore',
    state: 'Karnataka',
    description: 'A city of royal heritage — the illuminated Mysore Palace, incense-scented markets and the base for Chamundi Hills.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 2200,
    latitude: 12.2958,
    longitude: 76.6394,
    places: [
      { name: 'Mysore Palace', description: 'A dazzling Indo-Saracenic palace, spectacularly lit up with nearly 100,000 bulbs on Sundays and festivals.', category: 'HISTORY', isHiddenGem: false, latitude: 12.3052, longitude: 76.6552, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 120, estimatedCost: 70, rating: 4.7, address: 'Sayyaji Rao Road, Mysore' },
      { name: 'Chamundi Hills', description: 'A hilltop temple dedicated to Goddess Chamundeshwari, with a giant Nandi statue en route and city views.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 12.2724, longitude: 76.673, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 90, estimatedCost: 20, rating: 4.5, address: 'Chamundi Hills, Mysore' },
      { name: 'Devaraja Market', description: 'A vibrant century-old market bursting with flowers, spices, incense and fresh produce.', category: 'SHOPPING', isHiddenGem: false, latitude: 12.3072, longitude: 76.6539, imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db', avgDurationMinutes: 60, estimatedCost: 300, rating: 4.4, address: 'Devaraja Market, Mysore' },
      { name: 'Brindavan Gardens', description: 'Illuminated terraced gardens with musical fountains below the KRS Dam, a short drive from the city.', category: 'FAMILY', isHiddenGem: true, latitude: 12.4239, longitude: 76.5735, imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', avgDurationMinutes: 90, estimatedCost: 50, rating: 4.2, address: 'Brindavan Gardens, Mysore' },
    ],
  },
  {
    name: 'Hampi',
    slug: 'hampi',
    state: 'Karnataka',
    description: 'A UNESCO World Heritage site — the ruins of the Vijayanagara Empire scattered across a surreal boulder landscape.',
    imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320',
    bestTimeToVisit: 'October to February',
    avgCostPerDay: 1800,
    latitude: 15.335,
    longitude: 76.46,
    places: [
      { name: 'Virupaksha Temple', description: 'An active, centuries-old temple with a towering gopuram, the spiritual center of Hampi.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 15.335, longitude: 76.46, imageUrl: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320', avgDurationMinutes: 60, estimatedCost: 0, rating: 4.6, address: 'Hampi Bazaar' },
      { name: 'Vittala Temple & Stone Chariot', description: 'Hampi\'s most photographed monument — an intricately carved stone chariot and musical pillars.', category: 'HISTORY', isHiddenGem: false, latitude: 15.341, longitude: 76.4747, imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41', avgDurationMinutes: 90, estimatedCost: 40, rating: 4.8, address: 'Vittala Temple, Hampi' },
      { name: 'Matanga Hill Sunrise', description: 'The best sunrise viewpoint in Hampi, a short climb overlooking the entire boulder-strewn ruins.', category: 'ADVENTURE', isHiddenGem: true, latitude: 15.3376, longitude: 76.4665, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.7, address: 'Matanga Hill, Hampi' },
      { name: 'Hampi Bazaar Cycling Trail', description: 'A relaxed cycling route through ruins, rice paddies and the Tungabhadra river, away from tour buses.', category: 'ADVENTURE', isHiddenGem: true, latitude: 15.334, longitude: 76.462, imageUrl: 'https://images.unsplash.com/photo-1601275551427-b8b96a03287a', avgDurationMinutes: 150, estimatedCost: 150, rating: 4.5, address: 'Hampi Bazaar' },
    ],
  },
  {
    name: 'Pondicherry',
    slug: 'pondicherry',
    state: 'Puducherry',
    description: 'A former French colony on the Bay of Bengal — pastel streets, seaside promenades and a laid-back cafe culture.',
    imageUrl: 'https://images.unsplash.com/photo-1587922546307-776227941871',
    bestTimeToVisit: 'October to March',
    avgCostPerDay: 2600,
    latitude: 11.9416,
    longitude: 79.8083,
    places: [
      { name: 'Promenade Beach', description: 'A rocky beachfront boulevard lined with colonial buildings, closed to traffic in the evenings.', category: 'BEACH', isHiddenGem: false, latitude: 11.9312, longitude: 79.8365, imageUrl: 'https://images.unsplash.com/photo-1587922546307-776227941871', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.5, address: 'Promenade Beach, Pondicherry' },
      { name: 'French Quarter (White Town)', description: 'Mustard-and-white colonial villas, bougainvillea-lined streets and boutique cafes.', category: 'PHOTOGRAPHY', isHiddenGem: false, latitude: 11.934, longitude: 79.83, imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', avgDurationMinutes: 90, estimatedCost: 0, rating: 4.6, address: 'White Town, Pondicherry' },
      { name: 'Auroville', description: 'An experimental international township built around the golden Matrimandir meditation dome.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 12.0067, longitude: 79.8097, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 150, estimatedCost: 0, rating: 4.6, address: 'Auroville, near Pondicherry' },
      { name: 'Paradise Beach (Plage Paradiso)', description: 'A quieter, boat-access-only beach away from the main promenade crowds.', category: 'BEACH', isHiddenGem: true, latitude: 11.8622, longitude: 79.8467, imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206', avgDurationMinutes: 120, estimatedCost: 150, rating: 4.4, address: 'Chunnambar, Pondicherry' },
    ],
  },
  {
    name: 'Nainital',
    slug: 'nainital',
    state: 'Uttarakhand',
    description: 'A colonial-era lake town in the Kumaon Himalayas, built around the emerald Naini Lake.',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23',
    bestTimeToVisit: 'March to June, September to November',
    avgCostPerDay: 2400,
    latitude: 29.3803,
    longitude: 79.4636,
    places: [
      { name: 'Naini Lake Boating', description: 'A boat ride on the crescent-shaped lake at the heart of Nainital, ringed by forested hills.', category: 'NATURE', isHiddenGem: false, latitude: 29.3919, longitude: 79.4542, imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0', avgDurationMinutes: 60, estimatedCost: 300, rating: 4.5, address: 'Mall Road, Nainital' },
      { name: 'Naina Devi Temple', description: 'A revered lakeside shrine, one of the Shakti Peeths, right on the northern edge of Naini Lake.', category: 'SPIRITUAL', isHiddenGem: false, latitude: 29.3997, longitude: 79.453, imageUrl: 'https://images.unsplash.com/photo-1600100397608-f0347c8f4c2a', avgDurationMinutes: 45, estimatedCost: 0, rating: 4.5, address: 'Naina Devi Temple, Nainital' },
      { name: 'Snow View Point', description: 'A cable-car-accessible viewpoint with panoramic views of the snow-capped Nanda Devi range.', category: 'PHOTOGRAPHY', isHiddenGem: false, latitude: 29.4022, longitude: 79.4472, imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99', avgDurationMinutes: 90, estimatedCost: 250, rating: 4.4, address: 'Snow View Point, Nainital' },
      { name: 'Mall Road Cafes', description: 'A lakeside promenade of cafes and colonial-era shops, best explored on foot in the evening.', category: 'FOOD', isHiddenGem: true, latitude: 29.388, longitude: 79.455, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', avgDurationMinutes: 90, estimatedCost: 400, rating: 4.3, address: 'Mall Road, Nainital' },
    ],
  },
];

const emergencyContacts = [
  { name: 'National Emergency Number', type: 'GENERAL', phoneNumber: '112', isNational: true },
  { name: 'Police', type: 'POLICE', phoneNumber: '100', isNational: true },
  { name: 'Fire Brigade', type: 'FIRE', phoneNumber: '101', isNational: true },
  { name: 'Ambulance', type: 'HOSPITAL', phoneNumber: '102', isNational: true },
  { name: 'Tourist Helpline (Incredible India)', type: 'TOURIST_HELPLINE', phoneNumber: '1363', isNational: true },
  { name: 'Women Helpline', type: 'GENERAL', phoneNumber: '1091', isNational: true },
  { name: 'Goa Medical College Hospital', type: 'HOSPITAL', phoneNumber: '0832-2458700', city: 'Panaji', state: 'Goa', isNational: false },
  { name: 'Shri Maharaja Hari Singh Hospital', type: 'HOSPITAL', phoneNumber: '0194-2452111', city: 'Srinagar', state: 'Jammu & Kashmir', isNational: false },
  { name: 'SMS Hospital Jaipur', type: 'HOSPITAL', phoneNumber: '0141-2560291', city: 'Jaipur', state: 'Rajasthan', isNational: false },
];

async function main() {
  console.log('Seeding destinations and places...');
  for (const dest of destinationsData) {
    const { places, ...destFields } = dest;
    const destination = await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: destFields,
      create: destFields,
    });

    for (const place of places) {
      const existing = await prisma.place.findFirst({ where: { destinationId: destination.id, name: place.name } });
      if (existing) {
        await prisma.place.update({ where: { id: existing.id }, data: { ...place, destinationId: destination.id, source: 'SEEDED' } });
      } else {
        await prisma.place.create({ data: { ...place, destinationId: destination.id, source: 'SEEDED' } });
      }
    }
    console.log(`  - ${destination.name}: ${places.length} places`);
  }

  console.log('Seeding emergency contacts...');
  for (const contact of emergencyContacts) {
    const existing = await prisma.emergencyContact.findFirst({ where: { name: contact.name, phoneNumber: contact.phoneNumber } });
    if (!existing) await prisma.emergencyContact.create({ data: contact });
  }

  console.log('Seeding demo accounts...');
  const demoPasswordHash = await bcrypt.hash('Demo@1234', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@intellitrip.app' },
    update: {},
    create: {
      fullName: 'Demo Traveller',
      email: 'demo@intellitrip.app',
      mobile: '9876543210',
      passwordHash: demoPasswordHash,
      role: 'USER',
      isVerified: true,
      language: 'en',
      budgetPreference: 'MID_RANGE',
      travelStyle: 'Adventure',
    },
  });

  await prisma.userPreference.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      favouriteDestinations: ['Goa', 'Kerala'],
      activities: ['Adventure', 'Beach', 'Food', 'Photography'],
      travelStyle: 'Adventure',
      foodPreference: 'No restriction',
      accommodationPreference: 'MID_RANGE',
      activityPreference: 'Balanced',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@intellitrip.app' },
    update: {},
    create: {
      fullName: 'IntelliTrip Admin',
      email: 'admin@intellitrip.app',
      mobile: '9876500000',
      passwordHash: demoPasswordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Seed complete.');
  console.log('Demo login -> email: demo@intellitrip.app | mobile: 9876543210 | password: Demo@1234');
  console.log('Admin login -> email: admin@intellitrip.app | password: Demo@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
