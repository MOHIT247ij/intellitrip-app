/**
 * packages.js
 * -----------------------------------------------------------------
 * Demo tour packages for every place on the Explore page.
 * Each place gets 3 packages:
 *   1. a guided day experience centred on that place
 *   2. a 2D/1N short break in its city
 *   3. a multi-day holiday covering the whole region
 * Packages are bookable through the normal booking + payment flow
 * (booking type EXPERIENCE), so they show up under "Bookings".
 * Prices are indicative demo prices, per person.
 * -----------------------------------------------------------------
 */

export const DESTINATIONS = {
  Goa: {
    state: 'Goa', perDay: 3500, best: 'November to February',
    spots: ['Fort Aguada', 'Baga Beach', 'Anjuna Flea Market', 'Cabo de Rama Fort', 'Butterfly Beach', 'Mandrem Beach Shack Food Trail'],
    holiday: { title: 'Goa Beach Holiday — North & South', days: 4, extra: [] },
  },
  Kashmir: {
    state: 'Jammu & Kashmir', perDay: 4500, best: 'April to October',
    spots: ['Dal Lake Shikara Ride', 'Gulmarg Gondola', 'Mughal Gardens', 'Doodhpathri Meadows', 'Aru Valley'],
    holiday: { title: 'Kashmir Paradise — Srinagar, Gulmarg & Pahalgam', days: 5, extra: [] },
  },
  Manali: {
    state: 'Himachal Pradesh', perDay: 3000, best: 'March to June, October to February',
    spots: ['Solang Valley', 'Hadimba Temple', 'Old Manali Cafes', 'Jogini Waterfall Trek', 'Naggar Castle'],
    holiday: { title: 'Himalayan Circuit — Shimla & Manali', days: 6, extra: ['The Ridge & Mall Road', 'Kufri'] },
  },
  Jaipur: {
    state: 'Rajasthan', perDay: 2800, best: 'October to March',
    spots: ['Amber Fort', 'Hawa Mahal', 'Johari Bazaar', 'Nahargarh Fort Sunset Point', 'Panna Meena ka Kund'],
    holiday: { title: 'Golden Triangle — Delhi, Agra & Jaipur', days: 5, extra: ['India Gate', 'Red Fort', 'Taj Mahal', 'Agra Fort'] },
  },
  Mumbai: {
    state: 'Maharashtra', perDay: 4000, best: 'November to February',
    spots: ['Gateway of India', 'Marine Drive', 'Mohammed Ali Road Food Street', 'Khotachiwadi Heritage Lanes', 'Kanheri Caves'],
    holiday: { title: 'Mumbai — City of Dreams Explorer', days: 3, extra: [] },
  },
  Kerala: {
    state: 'Kerala', perDay: 3200, best: 'September to March',
    spots: ['Munnar Tea Gardens', 'Alleppey Backwaters', 'Fort Kochi Heritage Walk', 'Gavi Rainforest', 'Marari Beach'],
    holiday: { title: "God's Own Country — Kochi, Munnar & Alleppey", days: 5, extra: [] },
  },
  Delhi: {
    state: 'Delhi', perDay: 3000, best: 'October to March',
    spots: ['India Gate', 'Red Fort', 'Chandni Chowk', "Humayun's Tomb", 'Hauz Khas Village'],
    holiday: { title: 'Golden Triangle — Delhi, Agra & Jaipur', days: 5, extra: ['Taj Mahal', 'Agra Fort', 'Amber Fort', 'Hawa Mahal'] },
  },
  Agra: {
    state: 'Uttar Pradesh', perDay: 2500, best: 'October to March',
    spots: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Sadar Bazaar'],
    holiday: { title: 'Golden Triangle — Delhi, Agra & Jaipur', days: 5, extra: ['India Gate', 'Red Fort', 'Amber Fort', 'Hawa Mahal'] },
  },
  Udaipur: {
    state: 'Rajasthan', perDay: 3200, best: 'September to March',
    spots: ['City Palace', 'Lake Pichola Boat Ride', 'Saheliyon Ki Bari', 'Sajjangarh (Monsoon Palace)'],
    holiday: { title: 'Royal Rajasthan — Udaipur & Jodhpur', days: 5, extra: ['Mehrangarh Fort', 'Blue City Old Town Walk', 'Umaid Bhawan Palace'] },
  },
  Jodhpur: {
    state: 'Rajasthan', perDay: 2600, best: 'October to March',
    spots: ['Mehrangarh Fort', 'Blue City Old Town Walk', 'Jaswant Thada', 'Umaid Bhawan Palace'],
    holiday: { title: 'Royal Rajasthan — Jodhpur & Udaipur', days: 5, extra: ['City Palace', 'Lake Pichola Boat Ride'] },
  },
  Varanasi: {
    state: 'Uttar Pradesh', perDay: 2200, best: 'October to March',
    spots: ['Dashashwamedh Ghat Ganga Aarti', 'Kashi Vishwanath Temple', 'Sunrise Boat Ride on the Ganges', 'Sarnath'],
    holiday: { title: 'Kashi Spiritual Retreat with Sarnath', days: 3, extra: [] },
  },
  Rishikesh: {
    state: 'Uttarakhand', perDay: 2000, best: 'September to November, February to April',
    spots: ['Laxman Jhula', 'Ganga River Rafting', 'Parmarth Niketan Evening Aarti', 'Beatles Ashram'],
    holiday: { title: 'Rishikesh Yoga & Adventure Retreat', days: 4, extra: [] },
  },
  Amritsar: {
    state: 'Punjab', perDay: 2000, best: 'October to March',
    spots: ['Golden Temple', 'Wagah Border Ceremony', 'Jallianwala Bagh', 'Kesar Da Dhaba'],
    holiday: { title: 'Amritsar Golden Heritage Trail', days: 3, extra: [] },
  },
  Shimla: {
    state: 'Himachal Pradesh', perDay: 2800, best: 'March to June, December to February',
    spots: ['The Ridge & Mall Road', 'Jakhu Temple', 'Kufri', 'Chadwick Falls'],
    holiday: { title: 'Himalayan Circuit — Shimla & Manali', days: 6, extra: ['Solang Valley', 'Hadimba Temple'] },
  },
  Darjeeling: {
    state: 'West Bengal', perDay: 2600, best: 'March to May, October to November',
    spots: ['Tiger Hill Sunrise', 'Darjeeling Himalayan Railway (Toy Train)', 'Happy Valley Tea Estate', 'Batasia Loop'],
    holiday: { title: 'Queen of the Hills — Darjeeling Holiday', days: 4, extra: [] },
  },
  Ooty: {
    state: 'Tamil Nadu', perDay: 2400, best: 'October to June',
    spots: ['Ooty Lake', 'Government Botanical Garden', 'Doddabetta Peak', 'Nilgiri Mountain Railway'],
    holiday: { title: 'Nilgiris Escape — Ooty & Mysore', days: 5, extra: ['Mysore Palace', 'Brindavan Gardens'] },
  },
  Mysore: {
    state: 'Karnataka', perDay: 2200, best: 'October to March',
    spots: ['Mysore Palace', 'Chamundi Hills', 'Devaraja Market', 'Brindavan Gardens'],
    holiday: { title: 'Royal Karnataka — Mysore & Hampi', days: 5, extra: ['Virupaksha Temple', 'Vittala Temple & Stone Chariot'] },
  },
  Hampi: {
    state: 'Karnataka', perDay: 1800, best: 'October to February',
    spots: ['Virupaksha Temple', 'Vittala Temple & Stone Chariot', 'Matanga Hill Sunrise', 'Hampi Bazaar Cycling Trail'],
    holiday: { title: 'Hampi UNESCO Ruins Explorer', days: 3, extra: [] },
  },
  Pondicherry: {
    state: 'Puducherry', perDay: 2600, best: 'October to March',
    spots: ['Promenade Beach', 'French Quarter (White Town)', 'Auroville', 'Paradise Beach (Plage Paradiso)'],
    holiday: { title: 'French Riviera of the East — Pondicherry', days: 3, extra: [] },
  },
  Nainital: {
    state: 'Uttarakhand', perDay: 2400, best: 'March to June, September to November',
    spots: ['Naini Lake Boating', 'Naina Devi Temple', 'Snow View Point', 'Mall Road Cafes'],
    holiday: { title: 'Lake District of India — Nainital', days: 4, extra: [] },
  },
};

// Nicer names for the day experience of famous places
const DAY_TITLES = {
  'Taj Mahal': 'Taj Mahal Sunrise Guided Tour',
  'Golden Temple': 'Golden Temple & Langar Experience',
  'Dal Lake Shikara Ride': 'Dal Lake Shikara & Floating Market Ride',
  'Alleppey Backwaters': 'Alleppey Houseboat Day Cruise',
  'Ganga River Rafting': 'Ganga White-Water Rafting (16 km)',
  'Gulmarg Gondola': 'Gulmarg Gondola Phase 1 & 2 Day Trip',
  'Wagah Border Ceremony': 'Wagah Border Beating Retreat Trip',
  'Dashashwamedh Ghat Ganga Aarti': 'Evening Ganga Aarti & Ghat Walk',
  'Darjeeling Himalayan Railway (Toy Train)': 'Toy Train Joy Ride to Ghum',
  'Nilgiri Mountain Railway': 'Nilgiri Toy Train Ride to Coonoor',
  'Mysore Palace': 'Mysore Palace Illumination Tour',
  'Lake Pichola Boat Ride': 'Lake Pichola Sunset Boat Cruise',
};

const CATEGORY_LABEL = {
  HISTORY: 'Heritage Tour', NATURE: 'Nature Experience', ADVENTURE: 'Adventure Day', SPIRITUAL: 'Spiritual Tour',
  FOOD: 'Food Walk', SHOPPING: 'Shopping Trail', BEACH: 'Beach Day', PHOTOGRAPHY: 'Photo Walk',
  NIGHTLIFE: 'Evening Experience', FAMILY: 'Family Day Out', LUXURY: 'Royal Experience',
};

const price = (n) => Math.max(499, Math.round(n / 100) * 100 - 1);

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Find which demo destination a place belongs to. */
export function resolveDestinationName(place) {
  const direct = place?.destination?.name;
  if (direct && DESTINATIONS[direct]) return direct;
  const hay = `${place?.address || ''} ${direct || ''}`.toLowerCase();
  const byAddress = Object.keys(DESTINATIONS).find((d) => hay.includes(d.toLowerCase()));
  if (byAddress) return byAddress;
  const bySpot = Object.entries(DESTINATIONS).find(([, d]) => d.spots.includes(place?.name));
  return bySpot ? bySpot[0] : direct || null;
}

function distribute(spots, days) {
  // Day 1 = arrival + 1 spot, last day = 1 spot + departure, the rest spread evenly.
  const plan = Array.from({ length: days }, () => []);
  spots.forEach((s, i) => {
    const day = days === 1 ? 0 : Math.min(days - 1, Math.floor((i * days) / spots.length));
    plan[day].push(s);
  });
  return plan;
}

function buildItinerary(spots, days, destName) {
  const plan = distribute(spots, days);
  return plan.map((daySpots, i) => {
    const isFirst = i === 0;
    const isLast = i === days - 1 && days > 1;
    let title;
    if (days === 1) title = `Guided visit in ${destName}`;
    else if (isFirst) title = `Arrive in ${destName}`;
    else if (isLast) title = 'Final sightseeing & departure';
    else title = daySpots.length ? `Explore ${daySpots[0]}` : 'Leisure day';
    const parts = [];
    if (isFirst && days > 1) parts.push('Pickup from airport / railway station and hotel check-in.');
    if (daySpots.length) parts.push(`Visit ${daySpots.join(', ')} with your local guide.`);
    else parts.push('Free time to relax, shop or explore on your own.');
    if (isLast) parts.push('Check-out and drop at airport / railway station.');
    return { day: i + 1, title, spots: daySpots, details: parts.join(' ') };
  });
}

/**
 * Returns 3 demo packages for a place on the Explore page.
 * `place` is the API place object ({ name, category, estimatedCost, destination, ... }).
 */
export function getPackagesForPlace(place) {
  if (!place) return [];
  const destName = resolveDestinationName(place) || place.destination?.name || place.address || 'India';
  const dest = DESTINATIONS[destName] || {
    state: place.destination?.state || '', perDay: Number(place.destination?.avgCostPerDay) || 2500,
    best: place.destination?.bestTimeToVisit || 'October to March', spots: [place.name], holiday: { title: `${destName} Holiday`, days: 3, extra: [] },
  };
  const entry = Number(place.estimatedCost) || 0;
  const others = dest.spots.filter((s) => s !== place.name);
  const base = slugify(place.name);

  // 1. Day experience
  const dayTitle = DAY_TITLES[place.name] || `${place.name} — ${CATEGORY_LABEL[place.category] || 'Guided Tour'}`;
  const dayInclusions = ['AC cab pickup & drop from your hotel', 'Certified English/Hindi speaking local guide', 'Bottled water & snacks'];
  if (entry > 0) dayInclusions.splice(2, 0, `Entry tickets (worth ₹${entry})`);
  if (place.category === 'FOOD') dayInclusions.push('Tasting menu at 4–5 local stops');
  const dayPkg = {
    id: `${base}-day`,
    kind: 'Day Tour',
    cover: place.name,
    tag: 'Most popular',
    title: dayTitle,
    destination: destName,
    state: dest.state,
    days: 1,
    nights: 0,
    durationLabel: place.avgDurationMinutes && place.avgDurationMinutes <= 180 ? 'Half day' : '1 day',
    price: price(900 + entry + dest.perDay * 0.2),
    stay: 'No overnight stay',
    meals: place.category === 'FOOD' ? 'Food tasting included' : 'Lunch at a local restaurant',
    spots: [place.name],
    highlights: [place.description, `Skip the planning — pickup, guide and ${entry > 0 ? 'tickets' : 'local tips'} sorted`, 'Small group or private option'].filter(Boolean),
    inclusions: dayInclusions,
    exclusions: ['Flights / train to the city', 'Personal expenses & tips', 'Camera fees where applicable'],
    itinerary: buildItinerary([place.name], 1, destName),
  };

  // 2. Short break 2D/1N
  const breakSpots = [place.name, ...others.slice(0, 2)];
  const breakPkg = {
    id: `${base}-2d1n`,
    kind: 'Short Break',
    cover: others[0] || place.name,
    tag: 'Best value',
    title: `${destName} Weekend Escape`,
    destination: destName,
    state: dest.state,
    days: 2,
    nights: 1,
    durationLabel: '2 Days / 1 Night',
    price: price(dest.perDay * 2 + 1200 + entry),
    stay: '3★ handpicked hotel (twin sharing)',
    meals: 'Breakfast included',
    spots: breakSpots,
    highlights: [`See ${breakSpots.join(', ')}`, '1 night in a comfortable centrally located hotel', 'Private cab for all sightseeing'],
    inclusions: ['1 night hotel stay with breakfast', 'Private AC cab for sightseeing', 'Local guide on day 1', 'All entry tickets for listed places', 'Pickup & drop from station / airport'],
    exclusions: ['Flights / train to the city', 'Lunch & dinner', 'Personal expenses & tips'],
    itinerary: buildItinerary(breakSpots, 2, destName),
  };

  // 3. Full holiday
  const h = dest.holiday;
  const holidaySpots = [...new Set([place.name, ...others, ...(h.extra || [])])];
  const holidayPkg = {
    id: `${base}-holiday`,
    kind: 'Holiday',
    cover: destName,
    tag: 'Premium',
    title: h.title,
    destination: destName,
    state: dest.state,
    days: h.days,
    nights: h.days - 1,
    durationLabel: `${h.days} Days / ${h.days - 1} Nights`,
    price: price(h.days * dest.perDay * 1.1 + 2500),
    stay: '4★ hotels (twin sharing)',
    meals: 'Breakfast & dinner included',
    spots: holidaySpots,
    highlights: [`Covers ${holidaySpots.length} top experiences`, `Best time to visit: ${dest.best}`, 'Dedicated trip coordinator on call 24×7'],
    inclusions: [`${h.days - 1} nights in 4★ hotels`, 'Daily breakfast & dinner', 'Private AC vehicle for the whole trip', 'Guided sightseeing at every stop', 'All entry tickets & toll/parking', 'Airport / railway transfers'],
    exclusions: ['Flights / train to the starting city', 'Lunch', 'Adventure activity add-ons', 'Personal expenses & tips'],
    itinerary: buildItinerary(holidaySpots, h.days, destName),
  };

  return [dayPkg, breakPkg, holidayPkg];
}

/** Lowest per-person price among a place's packages (for "from ₹X" labels). */
export function startingPrice(place) {
  const pkgs = getPackagesForPlace(place);
  return pkgs.length ? Math.min(...pkgs.map((p) => p.price)) : null;
}

export const PREMIUM_UPGRADE = 0.35; // +35% for premium hotels / private tour
