/**
 * api.js — Local data helpers for the front-end TravelGuide website
 *
 * Sample travel data is read from data.js; favourites, preferences, and the
 * latest itinerary stay in this browser's localStorage.
 *
 * LocalStorage keys:
 *   tg_favourites   → JSON array of destination names
 *   tg_recent_destinations → most recently viewed destination names
 *   tg_itinerary    → JSON object with last saved itinerary
 *   tg_preferences  → JSON object with user preferences
 */

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

/**
 * Returns a filtered list of destinations.
 * @param {object} filters - Optional filter keys: { category, search, minRating }
 * @returns {Promise<Array>}
 */
async function apiGetDestinations(filters = {}) {
  let results = Array.isArray(DESTINATIONS) ? [...DESTINATIONS] : [];

  if (filters.category && filters.category !== 'All') {
    results = results.filter(d => d.category === filters.category);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(d =>
      `${d.name} ${d.state} ${d.category} ${d.tagline}`.toLowerCase().includes(q)
    );
  }

  if (filters.minRating) {
    results = results.filter(d => parseFloat(d.rating) >= parseFloat(filters.minRating));
  }

  return results;
}

/**
 * Returns a single destination by name (case-insensitive).
 * @param {string} name
 * @returns {Promise<object|null>}
 */
async function apiGetDestination(name) {
  if (!name) return null;
  return (
    DESTINATIONS.find(d => d.name.toLowerCase() === name.toLowerCase()) || null
  );
}

// ---------------------------------------------------------------------------
// Stays
// ---------------------------------------------------------------------------

/**
 * Returns a filtered list of stay options.
 * @param {string} type - 'All' | 'Budget' | 'Mid-range' | 'Premium' | 'Luxury'
 * @returns {Promise<Array>}
 */
async function apiGetStays(type = 'All') {
  if (type === 'All') return [...STAYS];
  return STAYS.filter(s => s.type === type);
}

// ---------------------------------------------------------------------------
// Foods
// ---------------------------------------------------------------------------

/**
 * Returns a filtered list of food items.
 * @param {string} type - 'All' | 'Street food' | 'Traditional' | 'Vegetarian' | 'Dessert'
 * @returns {Promise<Array>}
 */
async function apiGetFoods(type = 'All') {
  if (type === 'All') return [...FOODS];
  // 'Vegetarian' filter matches Traditional, Vegetarian, and Dessert (mirrors script.js logic)
  if (type === 'Vegetarian') {
    return FOODS.filter(f => ['Traditional', 'Vegetarian', 'Dessert'].includes(f.type));
  }
  return FOODS.filter(f => f.type === type);
}

// ---------------------------------------------------------------------------
// Itinerary
// ---------------------------------------------------------------------------

/**
 * Returns the day-plan array for a given city and trip duration.
 * @param {string} city  - Destination name matching a key in PLANS
 * @param {number} days  - Number of days
 * @param {string} budget - 'Budget-friendly' | 'Moderate' | 'Premium'
 * @returns {Promise<Array>} Array of day arrays, each containing timeline entries
 */
async function apiGetItinerary(city, days, budget) {
  const basePlan = (PLANS && PLANS[city]) ? PLANS[city] : [
    ['9:00 AM', city + ' city centre', 'Start near your accommodation and check current local transport.'],
    ['11:00 AM', 'Local attraction visit', 'Choose an attraction with verified opening hours.'],
    ['1:00 PM', 'Regional food break', 'Try a local speciality and confirm dietary needs.'],
    ['3:00 PM', 'Explore a nearby neighbourhood', 'Keep this stop flexible for weather and travel time.'],
    ['5:30 PM', 'Relaxed evening', 'Check your route back and local conditions.']
  ];
  const planDays = [];

  for (let day = 1; day <= days; day++) {
    let dayEntries = basePlan.map(x => x.slice()); // shallow clone each entry
    if (day > 1) {
      const times = ['9:00 AM', '10:30 AM', '12:30 PM', '2:00 PM', '4:00 PM', '6:00 PM'];
      dayEntries = dayEntries.slice().reverse().map((x, i) => [
        times[i] || 'Later',
        x[1],
        x[2]
      ]);
    }
    planDays.push(dayEntries);
  }

  return planDays;
}

// ---------------------------------------------------------------------------
// Favourites (localStorage)
// ---------------------------------------------------------------------------

const LS_FAVS_KEY = 'tg_favourites';
const LS_RECENT_KEY = 'tg_recent_destinations';

async function apiGetRecentDestinations() {
  try {
    const raw = localStorage.getItem(LS_RECENT_KEY);
    const names = raw ? JSON.parse(raw) : [];
    return Array.isArray(names) ? names.filter(name => typeof name === 'string') : [];
  } catch (e) {
    console.warn('[TravelGuide] Could not read recent destinations:', e);
    return [];
  }
}

async function apiTrackRecentDestination(name) {
  const names = [name, ...(await apiGetRecentDestinations()).filter(item => item !== name)].slice(0, 6);
  try { localStorage.setItem(LS_RECENT_KEY, JSON.stringify(names)); }
  catch (e) { console.warn('[TravelGuide] Could not save recent destinations:', e); }
  return names;
}

async function apiClearRecentDestinations() {
  try { localStorage.removeItem(LS_RECENT_KEY); }
  catch (e) { console.warn('[TravelGuide] Could not clear recent destinations:', e); }
}

/**
 * Saves a destination name to the favourites list in localStorage.
 * @param {string} name
 * @returns {Promise<string[]>} Updated favourites array
 */
async function apiSaveFavourite(name) {
  const favs = await apiGetFavourites();
  if (!favs.includes(name)) {
    favs.push(name);
    try { localStorage.setItem(LS_FAVS_KEY, JSON.stringify(favs)); }
    catch (e) { console.warn('[TravelGuide] Could not save favourites to localStorage:', e); }
  }
  return favs;
}

/**
 * Removes a destination name from the favourites list in localStorage.
 * @param {string} name
 * @returns {Promise<string[]>} Updated favourites array
 */
async function apiRemoveFavourite(name) {
  const favs = (await apiGetFavourites()).filter(f => f !== name);
  try { localStorage.setItem(LS_FAVS_KEY, JSON.stringify(favs)); }
  catch (e) { console.warn('[TravelGuide] Could not save favourites to localStorage:', e); }
  return favs;
}

/**
 * Retrieves the favourites list from localStorage.
 * @returns {Promise<string[]>}
 */
async function apiGetFavourites() {
  try {
    const raw = localStorage.getItem(LS_FAVS_KEY);
    const favourites = raw ? JSON.parse(raw) : [];
    return Array.isArray(favourites)
      ? [...new Set(favourites.filter(name => typeof name === 'string'))]
      : [];
  } catch (e) {
    console.warn('[TravelGuide] Could not read favourites from localStorage:', e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Itinerary persistence (localStorage)
// ---------------------------------------------------------------------------

const LS_ITINERARY_KEY = 'tg_itinerary';

/**
 * Persists a generated itinerary object to localStorage.
 * @param {object} itinerary - { city, days, budget, plan }
 * @returns {Promise<void>}
 */
async function apiSaveItinerary(itinerary) {
  try {
    localStorage.setItem(LS_ITINERARY_KEY, JSON.stringify(itinerary));
  } catch (e) {
    console.warn('[TravelGuide] Could not save itinerary to localStorage:', e);
  }
}

/**
 * Triggers a browser download of the itinerary as a JSON file.
 * @param {object} itinerary - { city, days, budget, plan, exportedAt }
 * @returns {Promise<void>}
 */
async function apiExportItinerary(itinerary) {
  const payload = {
    ...itinerary,
    exportedAt: new Date().toISOString(),
    notice: 'This itinerary is a sample generated for UI demonstration. Verify all details before travel.'
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const city  = (itinerary.city  || 'destination').replace(/\s+/g, '-').toLowerCase();
  const days  = itinerary.days   || 1;
  a.href     = url;
  a.download = `travelguide-itinerary-${city}-${days}day.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
