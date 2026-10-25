/**
 * placeImages.js
 * -----------------------------------------------------------------
 * Real photos (Wikimedia Commons, free licence) for every seeded
 * destination and place, keyed by name. Every URL was checked to load.
 * Anything not in this map is resolved at runtime from Wikipedia
 * (see hooks/usePlaceImage.js).
 * -----------------------------------------------------------------
 */
const W = 'https://upload.wikimedia.org/wikipedia/commons/';
const t = (path, file) => `${W}thumb/${path}/${file}/960px-${file}`;

export const PLACE_IMAGES = {
  // ---------- Goa ----------
  'Goa': t('f/fc', 'BeachFun.jpg'),
  'Fort Aguada': t('a/ad', 'Fort_aguada.jpg'),
  'Baga Beach': t('8/80', 'Baga_Beach_25012016.jpg'),
  'Anjuna Flea Market': t('c/cf', 'Anjuna_Beach%2C_Goa%2C_India%2C_Legendary_Curlies_beach_shack.jpg'),
  'Cabo de Rama Fort': t('1/1e', 'Cabo_de_Rama_Entrance.jpg'),
  'Butterfly Beach': t('9/9c', 'Palolem_Beach%2C_South_Goa.jpg'),
  'Mandrem Beach Shack Food Trail': t('7/7a', 'Mandrem_Beach_and_Mandrem_River%2C_Mandrem%2C_Goa%2C_India_%28edit%29.jpg'),
  // ---------- Kashmir ----------
  'Kashmir': t('f/f6', 'Pahalgam_Valley.jpg'),
  'Dal Lake Shikara Ride': t('e/e1', 'Dal_Lake_Hazratbal_Srinagar.jpg'),
  'Gulmarg Gondola': t('a/a2', 'Gulmarg_gondola.JPG'),
  'Mughal Gardens': t('d/d6', 'Shalimar_Bagh_1.jpg'),
  'Doodhpathri Meadows': t('a/ae', 'A_bench_with_scenic_view_Doodhpathri_southwest_Jammu_Kashmir_India.jpg'),
  'Aru Valley': t('e/ef', 'Aruvillage.jpg'),
  // ---------- Manali ----------
  'Manali': t('0/03', 'Manali_City.jpg'),
  'Solang Valley': t('f/f1', 'Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG'),
  'Hadimba Temple': `${W}thumb/9/99/Hidimba_Devi_Temple_-_North-east_View_-_Manali_2014-05-11_2648-2649.TIF/lossy-page1-960px-Hidimba_Devi_Temple_-_North-east_View_-_Manali_2014-05-11_2648-2649.TIF.jpg`,
  'Old Manali Cafes': t('1/1a', 'Old_Manali%2C_Manali%2C_India_%28Unsplash_MSK-2kuYJDE%29.jpg'),
  'Jogini Waterfall Trek': t('7/7a', 'Paul_Evans%2C_Jogini_Waterfall_Manali_%282%29.jpg'),
  'Naggar Castle': t('b/be', 'Naggar_Castle_-_2.jpg'),
  // ---------- Jaipur ----------
  'Jaipur': t('4/41', 'East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg'),
  'Amber Fort': t('f/fb', '20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg'),
  'Hawa Mahal': t('4/41', 'East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg'),
  'Johari Bazaar': t('0/0c', 'Johari_Bazaar%2C_Jaipur.jpg'),
  'Nahargarh Fort Sunset Point': t('4/47', 'Nahargarh_13.jpg'),
  'Panna Meena ka Kund': t('2/21', 'Stepwell_in_Amer_Village.jpg'),
  // ---------- Mumbai ----------
  'Mumbai': t('2/2b', 'Mumbai_Bandra-Worli_Sea_Link.jpg'),
  'Gateway of India': t('3/3a', 'Mumbai_03-2016_30_Gateway_of_India.jpg'),
  'Marine Drive': t('7/74', 'Mumbai_03-2016_27_skyline_at_Marine_Drive.jpg'),
  'Mohammed Ali Road Food Street': `${W}3/31/Mumbai_Minara_Masjid.JPG`,
  'Khotachiwadi Heritage Lanes': t('c/c9', 'Khotachiwadi_-_Street.jpg'),
  'Kanheri Caves': t('6/6d', 'Kanheri_Caves_prayer_hall.JPG'),
  // ---------- Kerala ----------
  'Kerala': t('e/ee', 'House_Boat_DSW.jpg'),
  'Alleppey Backwaters': t('e/ee', 'House_Boat_DSW.jpg'),
  'Munnar Tea Gardens': t('b/b9', 'Munnar_Overview.jpg'),
  'Fort Kochi Heritage Walk': t('8/87', 'Chinese_fishingnet_kochi.jpg'),
  'Gavi Rainforest': t('b/b9', 'Gavi_Eco_tourism_center_kochupamba.jpg'),
  'Marari Beach': t('2/29', 'Marari_Beach_Sunset_01.JPG'),
  // ---------- Delhi ----------
  'Delhi': t('4/40', 'Jama_Masjid_2011.jpg'),
  'India Gate': t('3/3b', 'India_Gate_front.jpg'),
  'Red Fort': t('2/2a', 'Delhi_fort.jpg'),
  'Chandni Chowk': t('a/a9', 'Gurudwara_Sisganj_Sahib_Chandni_Chowk_19.jpg'),
  "Humayun's Tomb": t('d/d2', 'Tomb_of_Humayun%2C_Delhi.jpg'),
  'Hauz Khas Village': t('4/4f', 'Feroze_Shah%27s_Tomb.JPG'),
  // ---------- Agra ----------
  'Agra': t('6/68', 'Taj_Mahal%2C_Agra%2C_India.jpg'),
  'Taj Mahal': t('1/1d', 'Taj_Mahal_%28Edited%29.jpeg'),
  'Agra Fort': t('8/8d', 'Agra_03-2016_16_Agra_Fort.jpg'),
  'Fatehpur Sikri': t('b/b5', 'Fatehput_Sikiri_Buland_Darwaza_gate_2010.jpg'),
  'Mehtab Bagh': t('8/8d', 'Mehtab_Bagh_facing_Taj_Mahal.JPG'),
  'Sadar Bazaar': t('8/8d', 'Sadar_Bazar%2C_Agra.jpg'),
  // ---------- Udaipur ----------
  'Udaipur': t('6/6f', 'Evening_view%2C_City_Palace%2C_Udaipur.jpg'),
  'City Palace': t('6/69', 'Udaipur_City_Palace.jpg'),
  'Lake Pichola Boat Ride': t('d/d2', 'Udaipur_Lake_India.JPG'),
  'Saheliyon Ki Bari': t('8/84', 'Saheliyon-ki-Bari_Fountain.JPG'),
  'Sajjangarh (Monsoon Palace)': `${W}2/20/Monsoon_Palace.jpg`,
  // ---------- Jodhpur ----------
  'Jodhpur': t('9/99', 'Mehrangarh_Fort_sanhita.jpg'),
  'Mehrangarh Fort': t('9/99', 'Mehrangarh_Fort_sanhita.jpg'),
  'Blue City Old Town Walk': t('6/64', 'Jodhpur_the_blue_city_view_over_the_maze_of_houses_India_25Aug2006.jpg'),
  'Jaswant Thada': t('a/ad', 'Jaswant_Thada_Dawn.jpg'),
  'Umaid Bhawan Palace': t('9/9a', '1996_-218-20A_Jodhpur_Hotel_Umaid_Bhawan_Palace_%282233393509%29.jpg'),
  // ---------- Varanasi ----------
  'Varanasi': t('0/04', 'Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg'),
  'Dashashwamedh Ghat Ganga Aarti': t('a/ad', 'Dasaswamedh_ghat-varanasi_india-andres_larin.jpg'),
  'Kashi Vishwanath Temple': `${W}f/ff/Kashi_Vishwanath.jpg`,
  'Sunrise Boat Ride on the Ganges': t('0/04', 'Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg'),
  'Sarnath': t('d/d9', 'Ancient_Buddhist_monasteries_near_Dhamekh_Stupa_Monument_Site%2C_Sarnath.jpg'),
  // ---------- Rishikesh ----------
  'Rishikesh': t('7/74', 'Trayambakeshwar_Temple_VK.jpg'),
  'Laxman Jhula': t('7/75', 'Rishikesh-Lakshman_Jhula_by_Kaustubh_Nayyar.jpg'),
  'Ganga River Rafting': t('1/15', 'Rafting_in_the_Ganga%2C_Rishikesh.jpg'),
  'Parmarth Niketan Evening Aarti': `${W}3/3c/Parmarth.jpg`,
  'Beatles Ashram': t('9/96', 'Beatles_Ashram_03.jpg'),
  // ---------- Amritsar ----------
  'Amritsar': t('e/ea', 'Golden_Temple_Amritsar_Gurudwara_%28cropped%29.jpg'),
  'Golden Temple': t('9/94', 'The_Golden_Temple_of_Amrithsar_7.jpg'),
  'Wagah Border Ceremony': t('4/49', 'BeatingRetreat.jpg'),
  'Jallianwala Bagh': t('b/b5', 'Jallianwala_Bagh%2C_Amritsar_01.jpg'),
  'Kesar Da Dhaba': t('d/dd', 'Chole_Kulcha_Meal_-_Order_Food_Online_in_Mumbai_%2831013272937%29.jpg'),
  // ---------- Shimla ----------
  'Shimla': t('b/ba', 'Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg'),
  'The Ridge & Mall Road': t('2/25', 'The_Ridge_Shimla_5.jpg'),
  'Jakhu Temple': t('1/1c', 'Jakhoo_temple.jpg'),
  'Kufri': t('a/a9', 'Kufri_Simla_Himachal_India_%285%29.jpg'),
  'Chadwick Falls': `${W}4/4a/ChadwickFallShimla.jpg`,
  // ---------- Darjeeling ----------
  'Darjeeling': t('1/11', 'Batasia_Loop_War_Memorial_with_Kanchanjunga.jpg'),
  'Tiger Hill Sunrise': t('d/d8', 'Tiger_Hill_Darjeeling_West_Bengal_India_%283%29.JPG'),
  'Darjeeling Himalayan Railway (Toy Train)': t('1/1e', 'Darjeeling_Himalayan_Railway%2Ctoy_train_%283%29.jpg'),
  'Happy Valley Tea Estate': t('a/aa', 'Happy_Valley_Tea_Estate%2C_Darjeeling.jpg'),
  'Batasia Loop': t('1/11', 'Batasia_Loop_War_Memorial_with_Kanchanjunga.jpg'),
  // ---------- Ooty ----------
  'Ooty': t('d/db', 'Ooty_lake.jpg'),
  'Ooty Lake': t('c/c8', 'Ooty_Lake_in_Tamil_Nadu_04.jpg'),
  'Government Botanical Garden': t('1/1a', 'Sunken_Garden_Botanical_Garden_Ooty_Aug26_A7CR_12465.jpg'),
  'Doddabetta Peak': t('6/6b', 'Panoramic_view_of_Doddabetta_peak_with_the_telescope_house.jpg'),
  'Nilgiri Mountain Railway': t('4/41', 'NMR_train_at_Ketti_05-02-26_75.jpeg'),
  // ---------- Mysore ----------
  'Mysore': t('a/a4', 'Mysore_Palace_Morning.jpg'),
  'Mysore Palace': t('a/a4', 'Mysore_Palace_Morning.jpg'),
  'Chamundi Hills': t('d/d1', 'Chamundeshwari_Temple%2C_Mysuru%2C_Karnataka%2C_India_Temple.jpg'),
  'Devaraja Market': t('2/25', 'Devaraja_Market%2C_Mysore_%28306989724%29.jpg'),
  'Brindavan Gardens': t('0/0f', 'Brindavan_Gardens.JPG'),
  // ---------- Hampi ----------
  'Hampi': t('d/dd', 'Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg'),
  'Virupaksha Temple': t('b/b9', 'Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg'),
  'Vittala Temple & Stone Chariot': t('b/ba', 'Iconic_Stone_Chariot_%40_Vittala_Temple%2C_Hampi%2C_Karnataka.jpg'),
  'Matanga Hill Sunrise': t('b/b0', 'Enroute_to_Matanga_hills%2C_Hampi.jpg'),
  'Hampi Bazaar Cycling Trail': t('4/49', 'Hampi%2C_India%2C_View_of_Hampi_Bazaar_from_Matanga_Hill.jpg'),
  // ---------- Pondicherry ----------
  'Pondicherry': t('8/8c', 'Pondicherry-Rock_beach_aerial_view.jpg'),
  'Promenade Beach': t('8/82', 'Beach_Promenade%2C_Pondicherry%2C_India.jpg'),
  'French Quarter (White Town)': t('9/98', 'White_Town.jpg'),
  'Auroville': t('f/f6', 'The_Matrimandir_in_Auroville%2C_Tamil_Nadu%2C_India.jpg'),
  'Paradise Beach (Plage Paradiso)': t('4/41', 'Paradise_beach_in_pondicherry.jpg'),
  // ---------- Nainital ----------
  'Nainital': t('6/6f', 'Nainital_metro.jpg'),
  'Naini Lake Boating': t('2/28', 'The_Boat_and_The_Lake.jpg'),
  'Naina Devi Temple': t('d/de', 'Maa_Naina_Devi_Temple%2C_Mallital%2C_Nainital%2C_Uttarakhand%2C_India.jpg'),
  'Snow View Point': t('d/d5', 'View_of_Nainital_from_Snow_View_Point.jpg'),
  'Mall Road Cafes': t('d/d4', 'Nainital%2C_Mall_Road.jpg'),
};

// Other common spellings that should map to the same photo
const ALIASES = {
  'srinagar': 'Kashmir', 'jammu and kashmir': 'Kashmir', 'jammu & kashmir': 'Kashmir', 'gulmarg': 'Gulmarg Gondola', 'pahalgam': 'Kashmir',
  'new delhi': 'Delhi', 'mysuru': 'Mysore', 'puducherry': 'Pondicherry', 'alleppey': 'Alleppey Backwaters', 'alappuzha': 'Alleppey Backwaters',
  'munnar': 'Munnar Tea Gardens', 'kochi': 'Fort Kochi Heritage Walk', 'cochin': 'Fort Kochi Heritage Walk', 'fort kochi': 'Fort Kochi Heritage Walk',
  'udhagamandalam': 'Ooty', 'benares': 'Varanasi', 'banaras': 'Varanasi', 'kashi': 'Varanasi',
  'amer fort': 'Amber Fort', 'amer': 'Amber Fort', 'lake pichola': 'Lake Pichola Boat Ride', 'dal lake': 'Dal Lake Shikara Ride',
  'north goa': 'Baga Beach', 'south goa': 'Butterfly Beach', 'panaji': 'Goa', 'bombay': 'Mumbai', 'simla': 'Shimla',
};

const LOOKUP = Object.fromEntries(Object.entries(PLACE_IMAGES).map(([k, v]) => [k.toLowerCase(), v]));

function lookupKey(key) {
  return LOOKUP[key] || (ALIASES[key] ? PLACE_IMAGES[ALIASES[key]] : null);
}

/** Returns a curated real photo for a known place/destination name, or null. */
export function findPlaceImage(name) {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  const direct = lookupKey(key);
  if (direct) return direct;
  // "Agra, Uttar Pradesh" / "Taj Mahal, Agra" -> try each comma part
  for (const part of key.split(',').map((p) => p.trim()).filter(Boolean)) {
    const hit = lookupKey(part);
    if (hit) return hit;
  }
  return null;
}
