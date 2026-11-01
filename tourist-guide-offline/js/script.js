/**
 * script.js — Main application logic for TravelGuide
 *
 * Depends on (load order in index.html):
 *   1. js/data.js   — DESTINATIONS, STAYS, FOODS, PLANS, JAIPUR_STOPS
 *   2. js/api.js    — local storage and sample-data helpers
 *   3. js/map.js    — MapLibre map, online / offline switching, Google Maps links
 *   4. js/script.js — this file (app logic, UI rendering)
 *
 * Phase readiness:
 *   Phase 1  ✅  UI — handled by style.css + this file's render functions
 *   Phase 2  ✅  Destination explorer with search, filters, detail tabs
 *   Phase 3  ✅  OpenFreeMap live map (map.js) + schematic offline fallback
 *   Phase 4  ✅  Trip planner, budget breakdown, export, localStorage favs
 *   Phase 5  ✅  Service worker registered in index.html; offline handled in map.js
 *   Phase 6  ✅  Front-end-only sample data and local browser storage
 */

'use strict';

const ADMIN_STORAGE_KEY = 'travelguide-local-admin-v1';
const PASSPORT_STORAGE_KEY = 'travelguide-passport-v1';
const BUILT_IN_DESTINATIONS = new Map(DESTINATIONS.map(destination => [destination.name, JSON.parse(JSON.stringify(destination))]));

function readLocalObject(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (_) { return fallback; }
}

function loadLocalAdminData() {
  const data = readLocalObject(ADMIN_STORAGE_KEY, {});
  if (!data.destinationOverrides || typeof data.destinationOverrides !== 'object') data.destinationOverrides = {};
  if (!Array.isArray(data.customDestinations)) data.customDestinations = [];
  if (!Array.isArray(data.reviews)) data.reviews = [];
  if (!Array.isArray(data.reports)) data.reports = [];
  DESTINATIONS.forEach(destination => {
    if (data.destinationOverrides[destination.name]) Object.assign(destination, data.destinationOverrides[destination.name]);
  });
  data.customDestinations.forEach(destination => {
    if (destination?.name && !DESTINATIONS.some(item => item.name === destination.name)) DESTINATIONS.push(destination);
  });
  return data;
}

function saveLocalAdminData() {
  try { localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(localAdminData)); return true; }
  catch (error) { console.warn('[TravelGuide] Could not save local admin data:', error); return false; }
}

function loadPassportData() {
  const data = readLocalObject(PASSPORT_STORAGE_KEY, {});
  return {
    visited: Array.isArray(data.visited) ? data.visited : [],
    journal: Array.isArray(data.journal) ? data.journal : []
  };
}

function savePassportData() {
  try { localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(passportData)); return true; }
  catch (error) { console.warn('[TravelGuide] Could not save travel passport:', error); return false; }
}

const localAdminData = loadLocalAdminData();
let passportData = loadPassportData();

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let activeCategory    = 'All';
let activeStay        = 'All';
let activeStayCity     = 'All';
let activeFood        = 'All';
let selectedDestination = DESTINATIONS[0];
let recentlyViewed = [];

/** @type {Set<string>} In-memory set; hydrated from localStorage on load */
let saved = new Set();
let visitedNames = new Set(passportData.visited.map(item => item.name));

/** Current generated plan state */
let currentPlan = [];
let currentDay  = 1;
let currentPlanMeta = {};   // { city, days, budget, food }

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/** Restore saved favourites from localStorage on page load */
(function hydrateFavourites() {
  apiGetFavourites().then(favs => {
    saved = new Set(favs);
    renderHome();
    renderDestinations();
    renderSavedDestinations();
    updateFavouriteNavCount();
  });
})();

apiGetRecentDestinations().then(names => {
  recentlyViewed = names;
  renderRecentlyViewed();
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/**
 * Shows the named page section and updates nav state.
 * @param {string} id - page section id
 */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p =>
    p.classList.toggle('active', p.id === id)
  );
  document.querySelectorAll('.navlinks button').forEach(b =>
    b.classList.toggle('active', b.dataset.page === id)
  );
  document.getElementById('navlinks').classList.remove('open');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) {
    menuToggle.textContent = '☰';
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'favourites') renderSavedDestinations();
  if (id === 'passport') renderPassport();
  if (id === 'admin') renderAdminDashboard();

  // Trigger map init when navigating to map page
  if (id === 'mapPage') {
    // Wait for CSS display:block to take effect before measuring map container
    requestAnimationFrame(() => {
      checkMapAvailability();
      initMap(); // also prepares the selectable schematic fallback
    });
  }
}

/** Toggle the left-side vertical navigation dropdown. */
function toggleMenu() {
  const navlinks = document.getElementById('navlinks');
  const isOpen = navlinks.classList.toggle('open');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle?.setAttribute('aria-expanded', String(isOpen));
  if (menuToggle) {
    menuToggle.textContent = isOpen ? '×' : '☰';
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }
}

// Wire up nav buttons
document.querySelectorAll('.navlinks button').forEach(b =>
  b.addEventListener('click', () => showPage(b.dataset.page))
);

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

/**
 * Shows a brief toast notification.
 * @param {string} msg
 */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

/** Escapes HTML special characters to prevent XSS in template literals */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------------------------------------------------------------------------
// Destination cards
// ---------------------------------------------------------------------------

/**
 * Renders a single destination card as an HTML string.
 * @param {object} d - destination object from DESTINATIONS
 * @returns {string} HTML string
 */
function cardHTML(d) {
  const isSaved = saved.has(d.name);
  return `
    <article class="place-card">
      <div class="place-image" style="background-image:linear-gradient(135deg,#d9e6df,#8fae9d)">
        <img src="${d.img}" alt="${escapeHtml(d.name)} destination photo" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">
        <a class="photo-credit" href="${escapeHtml(d.photoSource || d.img || '#')}" target="_blank" rel="noopener" aria-label="Open photo source for ${escapeHtml(d.name)}">Photo source ↗</a>
        <span class="tag">${escapeHtml(d.category)}</span>
        <button class="heart ${isSaved ? 'saved' : ''}"
          aria-label="${isSaved ? 'Remove' : 'Save'} ${escapeHtml(d.name)}"
          onclick="toggleSave('${escapeHtml(d.name)}', event)">
          ${isSaved ? '♥' : '♡'}
        </button>
      </div>
      <div class="place-body">
        <h3>${escapeHtml(d.name)}, ${escapeHtml(d.state)}</h3>
        <div class="muted">${escapeHtml(d.tagline)}</div>
        <div class="place-meta">
          <span>☀ ${escapeHtml(d.season.split(';')[0])}</span>
          <span class="rating">★ ${escapeHtml(d.rating || 'Unrated')}</span>
        </div>
        <button class="text-btn" style="padding:12px 0 0"
          onclick="openDestination('${escapeHtml(d.name)}')">Explore destination →</button>
        <button class="visited-stamp ${visitedNames.has(d.name) ? 'is-visited' : ''}" onclick="toggleVisited('${escapeHtml(d.name)}',event)" aria-pressed="${visitedNames.has(d.name)}">
          ${visitedNames.has(d.name) ? '✓ Passport stamp added' : '+ Mark as visited'}
        </button>
      </div>
    </article>`;
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

/** Renders the first 4 destinations on the home page */
function renderHome() {
  const el = document.getElementById('homeCards');
  if (!el) return;
  el.innerHTML = DESTINATIONS.slice(0, 4).map(cardHTML).join('');
  const total = document.getElementById('destinationTotal');
  if (total) total.textContent = String(DESTINATIONS.length).padStart(2, '0');
  renderRecentlyViewed();
}

// ---------------------------------------------------------------------------
// Destinations page
// ---------------------------------------------------------------------------

/** Renders destination cards filtered by search text and category */
function renderDestinations() {
  const q = normalizeSearchText(document.getElementById('destinationSearch')?.value || '');
  const terms = q.split(/\s+/).filter(Boolean);
  let list = DESTINATIONS.filter(d => {
    const categoryMatch = activeCategory === 'All' ||
      (activeCategory === 'Adventure' ? ['Nature', 'Beach'].includes(d.category) :
        activeCategory === 'Budget-friendly' ? getStartingBudget(d) <= 2000 : d.category === activeCategory);
    const searchable = normalizeSearchText([
      d.name, d.state, d.category, d.tagline, d.desc, d.season, d.budget, d.food, d.stayArea,
      ...(d.attractions || []).flatMap(a => [a[0], a[1]]),
      ...(d.foods || []).flatMap(f => [f.name, f.desc])
    ].join(' '));
    return categoryMatch && terms.every(term => searchable.includes(term));
  });

  const sort = document.getElementById('destinationSort')?.value || 'recommended';
  if (sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'budget') list = list.slice().sort((a, b) => getStartingBudget(a) - getStartingBudget(b));

  const el = document.getElementById('destinationCards');
  el.innerHTML = list.length
    ? list.map(cardHTML).join('')
    : '<div class="empty-state">No destinations match your search. Try another name or category.</div>';

  const countEl = document.getElementById('destinationCount');
  if (countEl) countEl.textContent = `${list.length} destination${list.length !== 1 ? 's' : ''}`;
}

function normalizeSearchText(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function getStartingBudget(destination) {
  const amount = String(destination.budget || '').replace(/,/g, '').match(/\d+/);
  return amount ? Number(amount[0]) : Number.MAX_SAFE_INTEGER;
}

function clearDestinationFilters() {
  activeCategory = 'All';
  document.getElementById('destinationSearch').value = '';
  document.getElementById('destinationSort').value = 'recommended';
  document.querySelectorAll('#destinationFilters button')
    .forEach(button => button.classList.toggle('active', button.dataset.filter === 'All'));
  renderDestinations();
}

// Filter pills
document.querySelectorAll('#destinationFilters button').forEach(b =>
  b.addEventListener('click', () => {
    activeCategory = b.dataset.filter;
    document.querySelectorAll('#destinationFilters button')
    .forEach(x => x.classList.toggle('active', x === b));
    renderDestinations();
  })
);

/**
 * Navigates to Destinations page with a category pre-selected.
 * Called from home page category grid.
 */
function categoryFilter(c) {
  if (c === 'Food') {
    showPage('food');
    return;
  }
  // Outdoor trips are currently represented by the Nature collection.
  const filter = c;
  document.querySelectorAll('#destinationFilters button')
    .forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
  document.getElementById('destinationSearch').value = '';
  showPage('destinations');
  renderDestinations();
}

/** Copies search text from home and navigates to Destinations */
function searchFromHome() {
  document.getElementById('destinationSearch').value =
    document.getElementById('homeSearch').value;
  activeCategory = 'All';
  document.querySelectorAll('#destinationFilters button')
    .forEach(b => b.classList.toggle('active', b.dataset.filter === 'All'));
  showPage('destinations');
  renderDestinations();
}

// ---------------------------------------------------------------------------
// Favourites
// ---------------------------------------------------------------------------

/**
 * Toggles a destination's saved/favourite state.
 * Persists to localStorage via api.js.
 */
async function toggleSave(name, e) {
  if (e) e.stopPropagation();

  if (saved.has(name)) {
    saved.delete(name);
    await apiRemoveFavourite(name);
    toast(`${name} removed from favourites`);
  } else {
    saved.add(name);
    await apiSaveFavourite(name);
    toast(`${name} saved to favourites ♥`);
  }

  renderHome();
  renderDestinations();
  renderRecentlyViewed();
  renderSavedDestinations();
  updateFavouriteNavCount();
}

function renderRecentlyViewed() {
  const section = document.getElementById('recentSection');
  const host = document.getElementById('recentCards');
  if (!section || !host) return;
  const destinations = recentlyViewed.map(name => DESTINATIONS.find(d => d.name === name)).filter(Boolean);
  section.hidden = !destinations.length;
  host.innerHTML = destinations.map(cardHTML).join('');
}

async function clearRecentlyViewed() {
  recentlyViewed = [];
  await apiClearRecentDestinations();
  renderRecentlyViewed();
  toast('Recently viewed history cleared');
}

function renderSavedDestinations() {
  const host = document.getElementById('favouriteCards');
  if (!host) return;
  const destinations = DESTINATIONS.filter(destination => saved.has(destination.name));
  host.innerHTML = destinations.length
    ? destinations.map(cardHTML).join('')
    : '<div class="empty-state"><h3>No favourites saved yet</h3><p>Tap the heart on any destination card to keep it here.</p><button class="btn primary" onclick="showPage(\'destinations\')">Explore destinations</button></div>';
}

function updateFavouriteNavCount() {
  const count = document.getElementById('navFavouriteCount');
  if (count) count.textContent = saved.size ? String(saved.size) : '';
}

// ---------------------------------------------------------------------------
// Destination detail
// ---------------------------------------------------------------------------

/**
 * Opens the detail page for a named destination.
 * @param {string} name
 */
function openDestination(name) {
  selectedDestination = DESTINATIONS.find(d => d.name === name) || DESTINATIONS[0];
  apiTrackRecentDestination(selectedDestination.name).then(names => {
    recentlyViewed = names;
    renderRecentlyViewed();
  });
  renderDetail();
  showPage('detail');
}

function toggleVisited(name, event) {
  event?.stopPropagation();
  if (visitedNames.has(name)) {
    visitedNames.delete(name);
    passportData.visited = passportData.visited.filter(entry => entry.name !== name);
    toast(name + ' removed from your passport');
  } else {
    visitedNames.add(name);
    passportData.visited.unshift({ name, date: new Date().toISOString().slice(0, 10) });
    toast(name + ' added to your passport');
  }
  savePassportData();
  renderHome();
  renderDestinations();
  renderRecentlyViewed();
  renderSavedDestinations();
  renderPassport();
}

function passportBadges() {
  const places = passportData.visited.map(entry => DESTINATIONS.find(d => d.name === entry.name)).filter(Boolean);
  const states = new Set(places.map(place => place.state));
  const photoNotes = passportData.journal.filter(entry => entry.photo).length;
  return [
    { icon:'🛂', title:'First stamp', detail:'Visit your first destination', earned:places.length >= 1 },
    { icon:'🧭', title:'City explorer', detail:'Visit 3 destinations', earned:places.length >= 3 },
    { icon:'🗺️', title:'State collector', detail:'Explore 3 different states or regions', earned:states.size >= 3 },
    { icon:'📓', title:'Memory keeper', detail:'Write 3 journal entries', earned:passportData.journal.length >= 3 },
    { icon:'📸', title:'Photo storyteller', detail:'Save 3 journal photos', earned:photoNotes >= 3 }
  ];
}

function passportSummaryText() {
  const places = passportData.visited.map(entry => DESTINATIONS.find(d => d.name === entry.name)).filter(Boolean);
  if (!places.length && !passportData.journal.length) return 'Mark a destination as visited or add a journal entry to start your personal travel story.';
  const states = [...new Set(places.map(place => place.state))];
  const names = places.map(place => place.name);
  return `You have visited ${places.length} destination${places.length === 1 ? '' : 's'}${states.length ? ' across ' + states.length + ' region' + (states.length === 1 ? '' : 's') : ''}${names.length ? ': ' + names.join(', ') : ''}. Your journal has ${passportData.journal.length} entr${passportData.journal.length === 1 ? 'y' : 'ies'} and ${passportData.journal.filter(entry => entry.photo).length} saved photo memories.`;
}

function renderPassport() {
  const summaryText = document.getElementById('passportSummaryText');
  if (!summaryText) return;
  const visited = passportData.visited.map(entry => ({ entry, destination: DESTINATIONS.find(d => d.name === entry.name) })).filter(item => item.destination);
  const places = visited.map(item => item.destination);
  const stateCount = new Set(places.map(place => place.state)).size;
  document.getElementById('passportSummaryTitle').textContent = places.length ? 'A journey taking shape' : 'Your journey is just beginning';
  summaryText.textContent = passportSummaryText();
  document.getElementById('passportStats').innerHTML = `
    <div class="passport-stat"><strong>${places.length}</strong><span>Places visited</span></div>
    <div class="passport-stat"><strong>${stateCount}</strong><span>Regions explored</span></div>
    <div class="passport-stat"><strong>${passportData.journal.length}</strong><span>Journal entries</span></div>`;
  document.getElementById('passportBadges').innerHTML = passportBadges().map(badge => `
    <article class="passport-badge ${badge.earned ? 'earned' : 'locked'}"><span aria-hidden="true">${badge.icon}</span><div><strong>${escapeHtml(badge.title)}</strong><small>${escapeHtml(badge.detail)}</small></div><em>${badge.earned ? 'Earned' : 'Locked'}</em></article>`).join('');
  document.getElementById('passportVisited').innerHTML = visited.length ? visited.map(({ entry, destination }) => `
    <article class="passport-visited-card"><div class="place-card">${cardHTML(destination).replace('<article class="place-card">','').replace(/<\/article>\s*$/, '')}</div><span class="passport-visit-date">Visited ${escapeHtml(entry.date || 'date not set')}</span></article>`).join('')
    : '<div class="empty-state"><h3>No passport stamps yet</h3><p>Mark a destination as visited to add your first stamp.</p><button class="btn primary" onclick="showPage(\'destinations\')">Find a destination</button></div>';
  const journalHost = document.getElementById('journalEntries');
  journalHost.innerHTML = passportData.journal.length ? passportData.journal.map(entry => `
    <article class="journal-entry">
      ${entry.photo ? `<img src="${entry.photo}" alt="Photo memory from ${escapeHtml(entry.destination)}" loading="lazy">` : ''}
      <div class="journal-entry-copy"><div class="journal-entry-meta">${escapeHtml(entry.destination)} · ${escapeHtml(entry.date)}</div><p>${escapeHtml(entry.note)}</p><button class="text-btn" onclick="deleteJournalEntry('${escapeHtml(entry.id)}')">Delete entry</button></div>
    </article>`).join('')
    : '<div class="empty-state">Your journal is empty. Add a note to keep a memory from your trip.</div>';
  const journalDestination = document.getElementById('journalDestination');
  if (journalDestination && !journalDestination.options.length) {
    journalDestination.innerHTML = DESTINATIONS.map(destination => `<option value="${escapeHtml(destination.name)}">${escapeHtml(destination.name)}</option>`).join('');
  }
}

async function compressJournalPhoto(file) {
  if (!file) return '';
  if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) throw new Error('Choose an image smaller than 12 MB.');
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('This photo could not be read.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This image format could not be opened.'));
    img.src = source;
  });
  const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  let quality = 0.68;
  let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  while (blob && blob.size > 180000 && quality > 0.36) {
    quality -= 0.1;
    blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  }
  if (!blob || blob.size > 180000) throw new Error('Please choose a smaller photo.');
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The photo could not be saved.'));
    reader.readAsDataURL(blob);
  });
}

document.getElementById('journalForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const file = document.getElementById('journalPhoto').files[0];
  try {
    const photo = await compressJournalPhoto(file);
    passportData.journal.unshift({
      id: String(Date.now()), destination: document.getElementById('journalDestination').value,
      date: document.getElementById('journalDate').value,
      note: document.getElementById('journalNote').value.trim(), photo
    });
    if (!savePassportData()) throw new Error('Browser storage is full. Remove a large photo and try again.');
    visitedNames.add(passportData.journal[0].destination);
    if (!passportData.visited.some(entry => entry.name === passportData.journal[0].destination)) {
      passportData.visited.unshift({ name: passportData.journal[0].destination, date: passportData.journal[0].date });
    }
    savePassportData();
    // Keep visit buttons and passport counts in sync with the journal's
    // automatic visit stamp without requiring a page reload.
    renderHome();
    renderDestinations();
    renderRecentlyViewed();
    renderSavedDestinations();
    event.currentTarget.reset();
    document.getElementById('journalDate').value = new Date().toISOString().slice(0, 10);
    renderPassport();
    toast('Journal memory saved in this browser');
  } catch (error) { toast(error.message || 'The journal entry could not be saved'); }
});

function deleteJournalEntry(id) {
  passportData.journal = passportData.journal.filter(entry => entry.id !== id);
  savePassportData();
  renderPassport();
}

function exportPassportSummary() {
  const payload = { summary: passportSummaryText(), visited: passportData.visited, badges: passportBadges(), journal: passportData.journal };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'travelguide-passport.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function printPassport() {
  const host = document.getElementById('printPassportContent');
  host.innerHTML = `<h1>My TravelGuide Passport</h1><p>${escapeHtml(passportSummaryText())}</p><h2>Visited destinations</h2><ul>${passportData.visited.map(entry => `<li>${escapeHtml(entry.name)} · ${escapeHtml(entry.date)}</li>`).join('')}</ul><h2>Travel journal</h2>${passportData.journal.map(entry => `<article class="print-journal">${entry.photo ? `<img src="${entry.photo}" alt="">` : ''}<h3>${escapeHtml(entry.destination)} · ${escapeHtml(entry.date)}</h3><p>${escapeHtml(entry.note)}</p></article>`).join('')}`;
  document.body.classList.add('printing-passport');
  window.print();
  setTimeout(() => document.body.classList.remove('printing-passport'), 1000);
}

function submitDestinationReview(event, destination) {
  event.preventDefault();
  const form = event.currentTarget;
  localAdminData.reviews.unshift({
    id:String(Date.now()), destination, rating:Number(form.elements.rating.value),
    text:form.elements.review.value.trim(), date:new Date().toISOString().slice(0, 10), status:'pending'
  });
  if (!saveLocalAdminData()) { toast('Browser storage is unavailable for this review'); return; }
  form.reset();
  renderAdminDashboard();
  toast('Review submitted for local moderation');
}

function submitDestinationReport(event, destination) {
  event.preventDefault();
  const form = event.currentTarget;
  localAdminData.reports.unshift({
    id:String(Date.now()), destination, text:form.elements.report.value.trim(),
    date:new Date().toISOString().slice(0, 10), status:'open'
  });
  if (!saveLocalAdminData()) { toast('Browser storage is unavailable for this report'); return; }
  form.reset();
  renderAdminDashboard();
  toast('Information report added to the local admin queue');
}

function renderAdminDashboard() {
  const stats = document.getElementById('adminStats');
  if (!stats) return;
  const pendingReviews = localAdminData.reviews.filter(review => review.status === 'pending');
  const openReports = localAdminData.reports.filter(report => report.status === 'open');
  const qualityIssues = DESTINATIONS.reduce((total, destination) => total + getDestinationQualityIssues(destination).length, 0);
  stats.innerHTML = `
    <div class="admin-stat"><strong>${DESTINATIONS.length}</strong><span>Destinations</span></div>
    <div class="admin-stat"><strong>${pendingReviews.length}</strong><span>Reviews to moderate</span></div>
    <div class="admin-stat"><strong>${openReports.length}</strong><span>Open reports</span></div>
    <div class="admin-stat"><strong>${qualityIssues}</strong><span>Data checks to review</span></div>`;

  const selector = document.getElementById('adminDestinationSelect');
  if (selector) {
    const selected = selector.value || DESTINATIONS[0].name;
    selector.innerHTML = '<option value="__new__">＋ Add a local destination</option>' +
      DESTINATIONS.map(destination => `<option value="${escapeHtml(destination.name)}">${escapeHtml(destination.name)} · ${escapeHtml(destination.state)}</option>`).join('');
    selector.value = selected === '__new__' ? '__new__' : DESTINATIONS.some(destination => destination.name === selected) ? selected : DESTINATIONS[0].name;
    populateAdminDestinationForm();
  }

  const reviewsHost = document.getElementById('adminReviews');
  reviewsHost.innerHTML = pendingReviews.length ? pendingReviews.map(review => `
    <article class="admin-queue-item"><div><strong>${escapeHtml(review.destination)} · ${review.rating}/5</strong><small>${escapeHtml(review.date)}</small><p>${escapeHtml(review.text)}</p></div><div class="admin-queue-actions"><button class="btn soft" onclick="moderateReview('${review.id}','approved')">Approve</button><button class="btn" onclick="moderateReview('${review.id}','rejected')">Reject</button></div></article>`).join('') : '<p class="muted">No pending reviews.</p>';
  const reportsHost = document.getElementById('adminReports');
  reportsHost.innerHTML = openReports.length ? openReports.map(report => `
    <article class="admin-queue-item"><div><strong>${escapeHtml(report.destination)}</strong><small>${escapeHtml(report.date)}</small><p>${escapeHtml(report.text)}</p></div><button class="btn soft" onclick="resolveAdminReport('${report.id}')">Mark checked</button></article>`).join('') : '<p class="muted">No open reports.</p>';
  const qualityHost = document.getElementById('adminQuality');
  qualityHost.innerHTML = DESTINATIONS.map(destination => {
    const issues = getDestinationQualityIssues(destination);
    return `<article class="quality-row"><strong>${escapeHtml(destination.name)}</strong><span class="${issues.length ? 'quality-warning' : 'quality-ok'}">${issues.length ? escapeHtml(issues.join(' · ')) : 'Required fields present'}</span><button class="text-btn" onclick="selectAdminDestination('${escapeHtml(destination.name)}')">Edit →</button></article>`;
  }).join('');
}

function getDestinationQualityIssues(destination) {
  const issues = [];
  if (!destination.name?.trim()) issues.push('Missing name');
  if (!destination.state?.trim()) issues.push('Missing state or region');
  if (!destination.tagline?.trim()) issues.push('Missing tagline');
  if (!destination.desc?.trim()) issues.push('Missing description');
  if (!destination.img?.trim()) issues.push('Missing destination image');
  if (!destination.photoSource?.trim()) issues.push('Missing image source');
  if (!destination.season?.trim()) issues.push('Missing season');
  if (!Array.isArray(destination.attractions) || !destination.attractions.length) issues.push('No attraction records');
  else if (destination.attractions.some(attraction => !attraction?.[0] || !attraction?.[4])) issues.push('Incomplete attraction details');
  if (!Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) issues.push('Missing map coordinates');
  return issues;
}

function selectAdminDestination(name) {
  document.getElementById('adminDestinationSelect').value = name;
  populateAdminDestinationForm();
  document.getElementById('adminDestinationForm').scrollIntoView({ behavior:'smooth', block:'center' });
}

function populateAdminDestinationForm() {
  const selector = document.getElementById('adminDestinationSelect');
  if (!selector) return;
  const isNew = selector.value === '__new__';
  const destination = DESTINATIONS.find(item => item.name === selector.value);
  document.getElementById('adminName').value = isNew ? '' : destination?.name || '';
  document.getElementById('adminName').readOnly = !isNew;
  document.getElementById('adminState').value = destination?.state || '';
  document.getElementById('adminCategory').value = destination?.category || 'Heritage';
  document.getElementById('adminSeason').value = destination?.season || '';
  document.getElementById('adminTagline').value = destination?.tagline || '';
  document.getElementById('adminDescription').value = destination?.desc || '';
  document.getElementById('adminImage').value = destination?.img?.startsWith('https://') ? destination.img : '';
  document.getElementById('adminLatitude').value = Number.isFinite(destination?.lat) ? destination.lat : '';
  document.getElementById('adminLongitude').value = Number.isFinite(destination?.lng) ? destination.lng : '';
  document.getElementById('adminAttractions').value = (destination?.attractions || [])
    .map(attraction => [attraction[0], attraction[1], attraction[4] || attraction[0]].join(' | ')).join('\n');
  const isCustom = localAdminData.customDestinations.some(item => item.name === selector.value);
  document.getElementById('resetDestinationButton').hidden = isNew || isCustom;
  document.getElementById('deleteDestinationButton').hidden = !isCustom;
}

function moderateReview(id, status) {
  const review = localAdminData.reviews.find(item => item.id === id);
  if (!review || !['approved', 'rejected'].includes(status)) return;
  review.status = status;
  saveLocalAdminData();
  renderAdminDashboard();
  if (selectedDestination.name === review.destination) renderDetail();
}

function resolveAdminReport(id) {
  const report = localAdminData.reports.find(item => item.id === id);
  if (!report) return;
  report.status = 'checked';
  saveLocalAdminData();
  renderAdminDashboard();
}

document.getElementById('adminDestinationSelect')?.addEventListener('change', populateAdminDestinationForm);
document.getElementById('adminDestinationForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const selector = document.getElementById('adminDestinationSelect');
  const isNew = selector.value === '__new__';
  const name = document.getElementById('adminName').value.trim();
  const image = document.getElementById('adminImage').value.trim();
  if (!name || (isNew && !/^[A-Za-z0-9][A-Za-z0-9 .&-]{0,59}$/.test(name)) ||
      (isNew && DESTINATIONS.some(destination => destination.name.toLowerCase() === name.toLowerCase()))) {
    toast(isNew ? 'Choose a new, unique destination name' : 'Destination name is required');
    return;
  }
  if (image && !image.startsWith('https://')) { toast('Use a secure https image address'); return; }
  const latitude = document.getElementById('adminLatitude').value === '' ? null : Number(document.getElementById('adminLatitude').value);
  const longitude = document.getElementById('adminLongitude').value === '' ? null : Number(document.getElementById('adminLongitude').value);
  if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude)) ||
      (latitude !== null && Math.abs(latitude) > 90) || (longitude !== null && Math.abs(longitude) > 180) ||
      ((latitude === null) !== (longitude === null))) {
    toast('Enter both valid latitude and longitude, or leave both blank');
    return;
  }
  const attractions = document.getElementById('adminAttractions').value.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const [title, description, article] = line.split('|').map(part => part.trim());
    return [title, description || 'Add a verified description', '', 'Check current hours', article || title];
  });
  if (attractions.some(attraction => !attraction[0])) { toast('Give each attraction a name'); return; }
  const record = {
    state:document.getElementById('adminState').value.trim(),
    category:document.getElementById('adminCategory').value,
    season:document.getElementById('adminSeason').value.trim(),
    tagline:document.getElementById('adminTagline').value.trim(),
    desc:document.getElementById('adminDescription').value.trim(),
    lat:latitude, lng:longitude,
    attractions
  };
  const existing = DESTINATIONS.find(destination => destination.name === selector.value);
  if (isNew) {
    const destination = {
      name, ...record, time:'Flexible', duration:'1–2 days', budget:'Check local rates',
      food:'Add verified local dishes', stayArea:'Check nearby accommodation options',
      img:image || 'assets/heritage-hotel.svg', photoSource:image || '',
      lat:latitude, lng:longitude, attractions,
      foods:[], safetyTips:[], expenses:{ accommodation:'Check current rates', food:'Check local rates', transport:'Check local rates', misc:'Check local rates', total:'Check current rates' }
    };
    localAdminData.customDestinations.push(destination);
  } else {
    record.img = image || existing.img;
    record.photoSource = image || existing.photoSource;
    if (BUILT_IN_DESTINATIONS.has(existing.name)) localAdminData.destinationOverrides[existing.name] = record;
    else Object.assign(existing, record);
  }
  if (!saveLocalAdminData()) { toast('Could not save destination in this browser'); return; }
  toast('Destination saved. Refreshing local records…');
  setTimeout(() => window.location.reload(), 450);
});

function resetAdminDestination() {
  const name = document.getElementById('adminDestinationSelect').value;
  if (!BUILT_IN_DESTINATIONS.has(name)) return;
  delete localAdminData.destinationOverrides[name];
  saveLocalAdminData();
  window.location.reload();
}

function deleteAdminDestination() {
  const name = document.getElementById('adminDestinationSelect').value;
  if (!window.confirm('Delete ' + name + ' from this browser’s local destination list?')) return;
  localAdminData.customDestinations = localAdminData.customDestinations.filter(destination => destination.name !== name);
  delete localAdminData.destinationOverrides[name];
  saveLocalAdminData();
  window.location.reload();
}

/** Renders the detail hero section for the selected destination */
function renderDetail() {
  const d = selectedDestination;
  document.getElementById('detailHero').style.backgroundImage = `url('${d.img}'),linear-gradient(135deg,#1769e8 0%,#0f4a8a 100%)`;
  document.getElementById('detailState').textContent = `${d.state} · ${d.category}`;
  document.getElementById('detailName').textContent = d.name;
  document.getElementById('detailTagline').textContent = d.tagline;

  // Reset tabs to Overview
  document.querySelectorAll('.detail-tabs button')
    .forEach((b, i) => b.classList.toggle('active', i === 0));
  detailTab('overview', document.querySelector('.detail-tabs button'));
}

function destinationFeedbackHTML(destination) {
  const reviews = localAdminData.reviews.filter(review =>
    review.destination === destination.name && review.status === 'approved'
  );
  const reviewCards = reviews.length ? reviews.map(review => `
    <article class="visitor-review"><div class="review-stars" aria-label="${review.rating} out of 5 stars">${'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 1)))}</div><p>${escapeHtml(review.text)}</p><small>${escapeHtml(review.date || 'Visitor review')}</small></article>`).join('')
    : '<p class="muted">No published visitor reviews yet. Share a useful note for other travellers.</p>';
  const name = escapeHtml(destination.name);
  return `
    <section class="panel destination-feedback">
      <div class="section-head"><div><h2>Traveller notes</h2><p>Reviews are shown after local demo moderation.</p></div></div>
      <div class="visitor-review-list">${reviewCards}</div>
      <form class="feedback-form" onsubmit="submitDestinationReview(event,'${name}')">
        <h3>Write a review</h3>
        <label>Rating<select name="rating" required><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label>
        <label>Your note<textarea name="review" rows="3" maxlength="600" placeholder="Share helpful, respectful travel feedback..." required></textarea></label>
        <button class="btn soft" type="submit">Submit review</button>
      </form>
      <form class="report-form" onsubmit="submitDestinationReport(event,'${name}')">
        <label>Report outdated or incorrect information<textarea name="report" rows="2" maxlength="400" placeholder="Tell us what should be checked..." required></textarea></label>
        <button class="text-btn" type="submit">Send information report</button>
      </form>
    </section>`;
}

/**
 * Renders content for a detail page tab.
 * @param {string} tab - 'overview'|'attractions'|'besttime'|'stay'|'food'|'itinerary'
 * @param {HTMLElement} button - the clicked tab button
 */
function detailTab(tab, button) {
  document.querySelectorAll('.detail-tabs button')
    .forEach(b => b.classList.toggle('active', b === button));

  const d = selectedDestination;

  // Build attraction cards with visit hours
  const attractionHTML = d.attractions.map(a => {
    const exactStop = JAIPUR_STOPS.find(stop => stop[0].toLowerCase() === a[0].toLowerCase());
    const destination = exactStop
      ? { lat: exactStop[1], lng: exactStop[2] }
      : `${a[0]}, ${d.name}`;
    return `
    <article class="attraction">
      <img src="assets/heritage-hotel.svg" data-wiki-title="${escapeHtml(a[4])}" alt="${escapeHtml(a[0])} in ${escapeHtml(d.name)}" loading="lazy">
      <div>
        <h4>${escapeHtml(a[0])}</h4>
        <p>${escapeHtml(a[1])}</p>
        ${a[3] ? `<p class="muted" style="margin-top:4px">🕐 ${escapeHtml(a[3])}</p>` : ''}
        <a class="attraction-photo-source" href="https://en.wikipedia.org/wiki/${encodeURIComponent(a[4]).replace(/%20/g, '_')}" target="_blank" rel="noopener">Photo source · Wikipedia ↗</a>
        <a class="google-directions-link" href="${googleMapsDirectionsUrl(destination)}" target="_blank" rel="noopener noreferrer">Navigate with Google Maps ↗</a>
      </div>
    </article>`;
  }).join('') || '<p class="muted">Attraction information needs local verification. Use the city map or report to add checked details.</p>';

  // Expense breakdown grid (Phase 4)
  const expHTML = d.expenses ? `
    <div class="panel" style="margin-top:0">
      <h3>Estimated daily expenses <small class="muted">(illustrative)</small></h3>
      <div class="expense-grid">
        <div class="expense-item"><span style="font-size:20px">🛏️</span><small>Accommodation</small><strong>${escapeHtml(d.expenses.accommodation)}</strong></div>
        <div class="expense-item"><span style="font-size:20px">🍽️</span><small>Food</small><strong>${escapeHtml(d.expenses.food)}</strong></div>
        <div class="expense-item"><span style="font-size:20px">🚌</span><small>Transport</small><strong>${escapeHtml(d.expenses.transport)}</strong></div>
        <div class="expense-item"><span style="font-size:20px">🛍️</span><small>Misc</small><strong>${escapeHtml(d.expenses.misc)}</strong></div>
      </div>
      <p style="margin:10px 0 0;font-size:13px;color:var(--muted)">Total estimate: <strong>${escapeHtml(d.expenses.total)}</strong> — verify before travel.</p>
    </div>` : '';

  // Safety tips (Phase 2)
  const safetyHTML = d.safetyTips && d.safetyTips.length ? `
    <div class="panel">
      <h3>Safety tips</h3>
      <ul style="margin:0;padding-left:18px;color:var(--muted);line-height:1.8;font-size:14px">
        ${d.safetyTips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
      </ul>
    </div>` : '';

  let content = '';

  if (tab === 'overview') {
    content = `
      <div class="stats">
        <div class="stat"><span class="emoji">☀️</span><small>Best season</small><strong>${escapeHtml(d.season)}</strong></div>
        <div class="stat"><span class="emoji">🕘</span><small>Best time of day</small><strong>${escapeHtml(d.time)}</strong></div>
        <div class="stat"><span class="emoji">💰</span><small>Est. budget</small><strong>${escapeHtml(d.budget)}</strong></div>
        <div class="stat"><span class="emoji">🗓️</span><small>Suggested duration</small><strong>${escapeHtml(d.duration)}</strong></div>
      </div>
      <div class="detail-grid">
        <div>
          <div class="panel">
            <h3>About ${escapeHtml(d.name)}</h3>
            <p>${escapeHtml(d.desc)}</p>
            ${d.visitHours ? `<p class="muted" style="font-size:13px">🕐 General hours: ${escapeHtml(d.visitHours)}</p>` : ''}
          </div>
          <div class="panel">
            <h3>Top attractions</h3>
            <div class="attraction-list">${attractionHTML}</div>
          </div>
          ${expHTML}
        </div>
        <div>
          <div class="panel">
            <h3>How to start exploring</h3>
            <p>1. Start early at a major attraction.<br>
               2. Visit nearby sights together to reduce travel time.<br>
               3. Take a local food break around lunchtime.<br>
               4. Keep the afternoon flexible for museums, markets, or rest.<br>
               5. Check current opening times and local transport before setting out.</p>
            <button class="btn primary" style="width:100%;margin-top:10px"
              onclick="showPage('planner');document.getElementById('planDestination').value='${escapeHtml(d.name)}'">
              Plan my trip →
            </button>
          </div>
          <div class="panel">
            <h3>Where to stay</h3>
            <p>${escapeHtml(d.stayArea)}.</p>
            <p>Compare recent reviews, total fees, transport links, and check-in details before booking.</p>
            <button class="btn" onclick="showPage('stay')">Explore stays</button>
          </div>
          <div class="panel">
            <h3>Local food</h3>
            <p>${escapeHtml(d.food)}</p>
            <button class="btn" onclick="showPage('food')">Open food guide</button>
          </div>
          ${safetyHTML}
        </div>
      </div>
      <div class="notice">Travel information is general guidance. Verify current opening hours, fees, weather, route conditions, and local advisories before your visit.</div>
      ${destinationFeedbackHTML(d)}`;
  }

  if (tab === 'attractions') {
    content = `
      <div class="panel">
        <h3>Places to visit in ${escapeHtml(d.name)}</h3>
        <p>Choose attractions that match your time and interests.</p>
        <div class="attraction-list">${attractionHTML}</div>
      </div>`;
  }

  if (tab === 'besttime') {
    content = `
      <div class="two-col">
        <div class="panel">
          <h3>Best season</h3>
          <p>${escapeHtml(d.season)}</p>
          <p>Check a current forecast before travelling. Seasonal conditions and local events can affect comfort and availability.</p>
        </div>
        <div class="panel">
          <h3>Best time of day</h3>
          <p>${escapeHtml(d.time)}</p>
          ${d.visitHours ? `<p class="muted" style="font-size:13px">General hours: ${escapeHtml(d.visitHours)}</p>` : ''}
          <p>Start outdoor sightseeing early when possible, allow breaks, and check each attraction's official hours.</p>
        </div>
      </div>`;
  }

  if (tab === 'stay') {
    content = `
      <div class="panel">
        <h3>Suggested areas to stay</h3>
        <p>${escapeHtml(d.stayArea)}.</p>
        <p>Compare recent guest reviews, cancellation policies, transport access, and the final price before booking.</p>
        <button class="btn primary" onclick="showPage('stay')">Browse sample stays</button>
      </div>`;
  }

  if (tab === 'food') {
    content = `
      <div class="panel">
        <h3>Local food to try</h3>
        <p>${escapeHtml(d.food)}.</p>
        <p>Ask vendors about ingredients and allergens, and choose food places that suit your dietary needs.</p>
        <button class="btn primary" onclick="showPage('food')">Browse food guide</button>
      </div>`;
  }

  if (tab === 'itinerary') {
    content = `
      <div class="panel">
        <h3>Build your ${escapeHtml(d.name)} itinerary</h3>
        <p>Suggested duration: ${escapeHtml(d.duration)}. Estimated budget guide: ${escapeHtml(d.budget)}.</p>
        ${expHTML}
        ${safetyHTML}
        <button class="btn primary" style="margin-top:12px"
          onclick="showPage('planner');document.getElementById('planDestination').value='${escapeHtml(d.name)}'">
          Customise itinerary →
        </button>
      </div>`;
  }

  document.getElementById('detailContent').innerHTML = content;
  loadAttractionImages(d);
}

/** Load landmark-specific article thumbnails from Wikipedia's public pageimages API. */
async function loadAttractionImages(destination) {
  const cards = [...document.querySelectorAll('#detailContent .attraction img[data-wiki-title]')];
  if (!cards.length || !navigator.onLine) return;
  const titles = cards.map(img => img.dataset.wikiTitle);
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', prop: 'pageimages|coordinates',
    piprop: 'thumbnail', pithumbsize: '900', coprimary: 'primary', redirects: '1', titles: titles.join('|')
  });
  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Wikipedia returned HTTP ${response.status}`);
    const payload = await response.json();
    const aliases = new Map();
    [...(payload.query?.normalized || []), ...(payload.query?.redirects || [])]
      .forEach(item => aliases.set(normalizeWikiTitle(item.from), normalizeWikiTitle(item.to)));
    const resolve = title => {
      let key = normalizeWikiTitle(title);
      for (let i = 0; i < 5 && aliases.has(key); i += 1) key = aliases.get(key);
      return key;
    };
    const pages = Object.values(payload.query?.pages || {});
    const imageByTitle = new Map(pages.filter(page => page.thumbnail?.source)
      .map(page => [resolve(page.title), page.thumbnail.source]));
    window._attractionCoords = window._attractionCoords || {};
    pages.forEach(page => {
      const coordinate = page.coordinates?.[0];
      if (coordinate && Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lon)) {
        window._attractionCoords[resolve(page.title)] = { lat: coordinate.lat, lng: coordinate.lon };
      }
    });
    cards.forEach(img => {
      const src = imageByTitle.get(resolve(img.dataset.wikiTitle));
      if (src) img.src = src;
    });
  } catch (error) {
    console.info(`[TravelGuide] Could not load landmark photos for ${destination.name}:`, error.message);
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeWikiTitle(title) {
  return String(title || '').replace(/_/g, ' ').trim().toLocaleLowerCase();
}

// ---------------------------------------------------------------------------
// Schematic offline map (fallback)
// ---------------------------------------------------------------------------

/** Projects Jaipur attraction coordinates onto the illustrated offline map. */
function getOfflineMapPositions() {
  const minLat = 26.885, maxLat = 26.995;
  const minLng = 75.810, maxLng = 75.860;
  return JAIPUR_STOPS.map(stop => ({
    x: Math.max(5, Math.min(95, ((stop[2] - minLng) / (maxLng - minLng)) * 100)),
    y: Math.max(7, Math.min(94, ((maxLat - stop[1]) / (maxLat - minLat)) * 100))
  }));
}

/** Initialises the offline Jaipur street map markers. */
function initMap() {
  const host = document.getElementById('offlineMapMarkers');
  if (!host || host.dataset.ready === 'yes') return;
  host.dataset.ready = 'yes';
  const positions = getOfflineMapPositions();

  host.innerHTML = JAIPUR_STOPS.map((s, i) => `
    <button class="offline-marker ${i === 0 ? 'active' : ''}"
      style="left:${positions[i].x}%;top:${positions[i].y}%"
      title="${escapeHtml(s[0])}"
      aria-label="${escapeHtml(s[0])}"
      onclick="selectOfflineMarker(${i})">
      <span>${i + 1}</span>
    </button>`).join('');

  host.insertAdjacentHTML('beforeend',
    `<div class="offline-popup" id="offlineMapPopup" style="left:${positions[0].x}%;top:${positions[0].y}%">
       <strong>${escapeHtml(JAIPUR_STOPS[0][0])}</strong><br>${escapeHtml(JAIPUR_STOPS[0][3])}<br>
       <a href="${googleMapsDirectionsUrl({ lat: JAIPUR_STOPS[0][1], lng: JAIPUR_STOPS[0][2] })}" target="_blank" rel="noopener noreferrer">Navigate with Google Maps ↗</a>
     </div>`);
}

/**
 * Selects a marker on the offline schematic map.
 * @param {number} index
 */
function selectOfflineMarker(index) {
  initMap();
  const host = document.getElementById('offlineMapMarkers');
  if (!host || !Number.isInteger(index) || index < 0 || index >= JAIPUR_STOPS.length) return;
  const positions = getOfflineMapPositions();
  host.querySelectorAll('.offline-marker')
    .forEach((m, i) => m.classList.toggle('active', i === index));

  const s = JAIPUR_STOPS[index];
  const p = positions[index];
  const popup = document.getElementById('offlineMapPopup');
  if (popup) {
    popup.style.left = p.x + '%';
    popup.style.top  = p.y + '%';
    popup.innerHTML  = `<strong>${escapeHtml(s[0])}</strong><br>${escapeHtml(s[3])}<br>
      <a href="${googleMapsDirectionsUrl({ lat: s[1], lng: s[2] })}" target="_blank" rel="noopener noreferrer">Navigate with Google Maps ↗</a>`;
  }
  toast(`${s[0]} selected`);
}

/** Centre / reset the schematic map */
function centerMap() {
  initMap();
  if (resetMapView()) toast('Showing all destinations');
  else toast('Live map is unavailable; the offline Jaipur view is shown');
}

/** Opens external directions (fallback for schematic map) */
function openDirections() {
  toast('Open Google Maps or a routing app for live turn-by-turn directions.');
}

// ---------------------------------------------------------------------------
// Route stops sidebar
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Map page — place selection and Google Maps navigation
// ---------------------------------------------------------------------------

function initNavigationSelectors() {
  const citySelect = document.getElementById('mapDestination');
  const placeSelect = document.getElementById('mapAttraction');
  if (!citySelect || !placeSelect) return;
  citySelect.innerHTML = DESTINATIONS.map(d => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`).join('');
  citySelect.value = selectedDestination.name;
  const populatePlaces = () => {
    selectedDestination = DESTINATIONS.find(d => d.name === citySelect.value) || DESTINATIONS[0];
    const places = selectedDestination.attractions.length ? selectedDestination.attractions.map(a => a[0]) : [selectedDestination.name];
    placeSelect.innerHTML = places.map(place => `<option value="${escapeHtml(place)}">${escapeHtml(place)}</option>`).join('');
    updateSelectedDirectionsLink();
    focusSelectedPlace();
  };
  citySelect.addEventListener('change', populatePlaces);
  placeSelect.addEventListener('change', updateSelectedDirectionsLink);
  populatePlaces();
}

function updateSelectedDirectionsLink() {
  const city = document.getElementById('mapDestination')?.value || selectedDestination.name;
  const place = document.getElementById('mapAttraction')?.value || selectedDestination.attractions[0]?.[0] || city;
  const destination = `${place}, ${city}, India`;
  const link = document.getElementById('selectedDirectionsLink');
  if (link) link.href = googleMapsDirectionsUrl(destination);
  const transitLink = document.getElementById('transitDirectionsLink');
  if (transitLink) transitLink.href = googleMapsDirectionsUrl(destination, 'transit');
  const foodLink = document.getElementById('routeFoodLink');
  if (foodLink) {
    const params = new URLSearchParams({
      api: '1', origin: destination,
      destination: `restaurants near ${place}, ${city}, India`, travelmode: 'driving', dir_action: 'navigate'
    });
    foodLink.href = `https://www.google.com/maps/dir/?${params.toString()}`;
  }
}

async function focusSelectedPlace() {
  const city = document.getElementById('mapDestination')?.value;
  const place = document.getElementById('mapAttraction')?.value;
  const destination = DESTINATIONS.find(d => d.name === city) || DESTINATIONS[0];
  if (!window._liveMap) return;
  const attraction = destination.attractions.find(item => item[0] === place);
  if (attraction?.[4] && navigator.onLine) {
    const key = normalizeWikiTitle(attraction[4]);
    if (!window._attractionCoords?.[key]) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const params = new URLSearchParams({
          action: 'query', format: 'json', origin: '*', prop: 'coordinates',
          coprimary: 'primary', redirects: '1', titles: attraction[4]
        });
        const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { signal: controller.signal });
        if (response.ok) {
          const payload = await response.json();
          const pages = Object.values(payload.query?.pages || {});
          const page = pages.find(item => item.coordinates?.length);
          const coords = page?.coordinates?.[0];
          if (coords) {
            window._attractionCoords = window._attractionCoords || {};
            window._attractionCoords[key] = { lat: coords.lat, lng: coords.lon };
          }
        }
      } catch { /* The city marker and Google Maps link still work if lookup fails. */ }
      finally { clearTimeout(timeoutId); }
    }
  }
  if (document.getElementById('mapDestination')?.value !== destination.name ||
      document.getElementById('mapAttraction')?.value !== place) return;
  if (typeof focusMapOnDestination === 'function') focusMapOnDestination(destination, place);
}

/** Browser geolocation is optional; Google Maps directions work without it. */
async function locateMe() {
  if (!_liveMap) {
    toast('Live map is still loading. You can use Google Maps directions now.');
    return;
  }
  try {
    await locateUser(_liveMap);
    toast('Your location is shown on the map');
  } catch {
    showMapNotice('Location could not be read. Allow location access in your browser and try again; Google Maps directions remain available.');
  }
}

/** Use Google Maps search instead of relying on a rate-limited nearby API. */
function searchNearby() {
  const city = document.getElementById('mapDestination')?.value || selectedDestination.name;
  const type = document.getElementById('nearbyType')?.value || 'restaurants';
  const place = document.getElementById('mapAttraction')?.value || selectedDestination.attractions[0]?.[0] || city;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(type + ' near ' + place + ', ' + city + ', India')}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ---------------------------------------------------------------------------
// Trip Planner (Phase 4)
// ---------------------------------------------------------------------------

/** Generates the day-wise itinerary plan */
async function generatePlan() {
  const city   = document.getElementById('planDestination').value;
  const days   = parseInt(document.getElementById('planDays').value, 10);
  const budget = document.getElementById('planBudget').value;
  const food   = document.getElementById('planFood').value;
  const interests = [...document.querySelectorAll('#plannerForm input[type="checkbox"]:checked')]
    .map(input => input.value);

  currentPlan = await apiGetItinerary(city, days, budget);
  currentDay  = 1;
  currentPlanMeta = { city, days, budget, food, interests, plan: currentPlan };

  document.getElementById('itineraryTitle').textContent = `${city} itinerary`;
  document.getElementById('itinerarySubtitle').textContent =
    `${days} day${days > 1 ? 's' : ''} · ${budget} · ${food}`;

  // Budget estimate
  const dest  = DESTINATIONS.find(x => x.name === city) || DESTINATIONS[0];
  const mult  = budget === 'Budget-friendly' ? 1 : budget === 'Moderate' ? 1.7 : 2.8;
  const baseRate = dest.expenses
    ? parseInt(dest.expenses.total.replace(/[^0-9]/g, '').slice(0, 4), 10) || 1500
    : 1500;
  const estimate = Math.round(baseRate * mult * days);
  currentPlanMeta.estimate = estimate;
  const budgetEl = document.getElementById('budgetSummary');
  if (budgetEl) {
    budgetEl.innerHTML =
      `Illustrative budget estimate: <strong>₹${estimate.toLocaleString('en-IN')}</strong>
       per person for ${days} day(s), excluding travel to the city.
       Actual costs vary by dates, bookings, and preferences.`;
  }

  const coverFiles = {
    Jaipur: 'jaipur.svg', Manali: 'manali.svg', Nashik: 'nashik.svg',
    Goa: 'goa.svg', Delhi: 'delhi.svg', Varanasi: 'varanasi.svg'
  };
  const coverSrc = coverFiles[city] ? `assets/${coverFiles[city]}` : dest.img;
  document.getElementById('itineraryCover').innerHTML = `
    <img src="${escapeHtml(coverSrc)}" alt="Illustration of ${escapeHtml(city)}" onerror="this.onerror=null;this.src='assets/icon-192.svg'">
    <div class="itinerary-cover-copy">
      <span class="itinerary-eyebrow">YOUR TRIP, AT A GLANCE</span>
      <h3>${escapeHtml(city)}</h3>
      <p>${days} day${days === 1 ? '' : 's'} · ${escapeHtml(budget)} · ${escapeHtml(food)}</p>
      <div class="itinerary-interest-tags">${(interests.length ? interests : ['Easy pace']).map(x => `<span>${escapeHtml(x)}</span>`).join('')}</div>
    </div>`;

  document.getElementById('daySwitch').innerHTML = currentPlan.map((items, i) =>
    `<button class="${i === 0 ? 'active' : ''}" onclick="renderPlanDay(${i + 1})">
      <span>Day ${i + 1}</span><small>${items.length} stops</small>
    </button>`
  ).join('');

  renderPlanDay(1);

  // Persist to localStorage
  await apiSaveItinerary(currentPlanMeta);
  toast('Your sample itinerary is ready');
}

/**
 * Renders a single day in the itinerary timeline.
 * @param {number} day - 1-indexed day number
 */
function renderPlanDay(day) {
  currentDay = day;
  document.querySelectorAll('#daySwitch button')
    .forEach((b, i) => b.classList.toggle('active', i === day - 1));

  const items = currentPlan[day - 1] || [];
  const highlights = document.getElementById('itineraryHighlights');
  if (highlights) {
    highlights.innerHTML = `
      <div><span>DAY</span><strong>${day} of ${currentPlan.length}</strong></div>
      <div><span>STOPS</span><strong>${items.length} places</strong></div>
      <div><span>ESTIMATED TRIP</span><strong>₹${(currentPlanMeta.estimate || 0).toLocaleString('en-IN')}</strong></div>`;
  }
  document.getElementById('itineraryTimeline').innerHTML = items.map(x => `
    <div class="timeline-item">
      <div class="timeline-time">${escapeHtml(x[0])}</div>
      <div class="timeline-rail"><span>${getItineraryIcon(x[1])}</span></div>
      <div class="timeline-copy">
        <div class="timeline-stop-heading"><strong>${escapeHtml(x[1])}</strong><span>STOP</span></div>
        <p>${escapeHtml(x[2])}</p>
        <a href="${googleMapsDirectionsUrl(`${x[1]}, ${currentPlanMeta.city || ''}`)}" target="_blank" rel="noopener noreferrer">Open directions ↗</a>
      </div>
    </div>`).join('');
}

function getItineraryIcon(title) {
  const value = String(title).toLowerCase();
  if (/lunch|breakfast|dinner|food|meal|cafe/.test(value)) return '🍽️';
  if (/beach|sunset|sunrise|river|garden|nature|riverside/.test(value)) return '🌅';
  if (/market|shopping|bazaar|shopping/.test(value)) return '🛍️';
  if (/temple|fort|palace|tomb|monument|heritage|cave|museum|gate/.test(value)) return '🏛️';
  if (/walk|stroll|explor|lane|city/.test(value)) return '🚶';
  return '📍';
}

/** Prints the itinerary using the browser print dialog */
function printItinerary() {
  if (!currentPlanMeta.city || !currentPlan.length) {
    toast('Generate an itinerary first');
    return;
  }
  const host = document.getElementById('printItineraryContent');
  const interests = currentPlanMeta.interests?.length ? currentPlanMeta.interests.join(', ') : 'Easy pace';
  host.innerHTML = `
    <header class="print-itinerary-header">
      <p>TRAVELGUIDE · YOUR TRIP PLAN</p>
      <h1>${escapeHtml(currentPlanMeta.city)} itinerary</h1>
      <div>${currentPlanMeta.days} days · ${escapeHtml(currentPlanMeta.budget)} · ${escapeHtml(currentPlanMeta.food)} food</div>
      <p>Interests: ${escapeHtml(interests)} · Estimated budget: ₹${Number(currentPlanMeta.estimate || 0).toLocaleString('en-IN')} per person</p>
    </header>
    ${currentPlan.map((day, index) => `
      <section class="print-day">
        <h2>Day ${index + 1}</h2>
        <ol>${day.map(stop => `<li><strong>${escapeHtml(stop[0])} · ${escapeHtml(stop[1])}</strong><p>${escapeHtml(stop[2])}</p></li>`).join('')}</ol>
      </section>`).join('')}
    <footer class="print-itinerary-footer">Sample itinerary · Check local opening times, travel conditions, and prices before your visit.</footer>`;
  host.setAttribute('aria-hidden', 'false');
  document.body.classList.add('printing-itinerary');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-itinerary');
    host.setAttribute('aria-hidden', 'true');
  }, 1000);
}

/** Exports the current itinerary as a JSON download */
async function exportItinerary() {
  if (!currentPlanMeta.city) {
    toast('Generate an itinerary first');
    return;
  }
  await apiExportItinerary(currentPlanMeta);
  toast('Itinerary exported as JSON');
}

// Wire planner form submission
document.getElementById('plannerForm').addEventListener('submit', e => {
  e.preventDefault();
  generatePlan();
});

// ---------------------------------------------------------------------------
// Stay page
// ---------------------------------------------------------------------------

const STAY_SEARCH_TYPES = [
  { type:'Hotel', title:'Hotels', icon:'🏨', description:'Full-service and independent hotels for short stays.' },
  { type:'Hostel', title:'Hostels', icon:'🛌', description:'Dorm beds and private rooms, often suited to budget travel.' },
  { type:'Resort', title:'Resorts', icon:'🌴', description:'Leisure properties, often with on-site facilities.' },
  { type:'Homestay', title:'Homestays', icon:'🏡', description:'Guest rooms and homes hosted by local owners.' },
  { type:'Guest house', title:'Guest houses & B&Bs', icon:'🛎️', description:'Smaller owner-run stays and bed-and-breakfasts.' },
  { type:'Serviced apartment', title:'Serviced apartments', icon:'🏢', description:'Furnished apartments for short or extended visits.' },
  { type:'PG / monthly', title:'PG & monthly rooms', icon:'🗓️', description:'Paying guest rooms and longer-term rentals; verify directly.' },
  { type:'Villa', title:'Villas & holiday rentals', icon:'🏘️', description:'Entire homes for families, groups, or longer stays.' },
  { type:'Camping', title:'Camping & glamping', icon:'⛺', description:'Campsites, tents, and nature stays; check seasonal access.' }
];

function staySearchQuery(type, city) {
  const label = type === 'All' ? 'accommodation' : type === 'PG / monthly' ? 'paying guest rooms and monthly rentals' : type === 'Camping' ? 'campsites and glamping' : type;
  return label + ' in ' + city + ', India';
}

function stayMapSearchUrl(type, city) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(staySearchQuery(type, city));
}

function stayBookingSearchUrl(city, type = 'All') {
  if (type === 'PG / monthly' || type === 'Camping') return stayMapSearchUrl(type, city);
  const query = type === 'All' ? city + ', India' : type + ' in ' + city + ', India';
  return 'https://www.booking.com/searchresults.html?ss=' + encodeURIComponent(query);
}

function renderStayOptions(city) {
  const host = document.getElementById('stayOptionCards');
  if (!host) return;
  const options = activeStay === 'All' ? STAY_SEARCH_TYPES : STAY_SEARCH_TYPES.filter(option => option.type === activeStay);
  host.innerHTML = options.map(option => `
    <article class="stay-option-card">
      <span class="stay-option-icon" aria-hidden="true">${option.icon}</span>
      <div class="stay-option-copy"><h3>${escapeHtml(option.title)}</h3><p>${escapeHtml(option.description)}</p></div>
      <div class="stay-option-links">
        <a class="btn soft" href="${stayMapSearchUrl(option.type, city)}" target="_blank" rel="noopener noreferrer">Live local listings ↗</a>
        ${option.type === 'PG / monthly' || option.type === 'Camping' ? '' : `<a class="text-btn" href="${stayBookingSearchUrl(city, option.type)}" target="_blank" rel="noopener noreferrer">Check Booking.com ↗</a>`}
      </div>
    </article>`).join('');
}

/** Renders stay cards filtered by type */
async function renderStays() {
  const list = (await apiGetStays('All')).filter(s =>
    (activeStayCity === 'All' || s.city === activeStayCity) &&
    (activeStay === 'All' || s.type === activeStay)
  );
  const el   = document.getElementById('stayCards');
  if (!el) return;

  const city = activeStayCity === 'All' ? 'Jaipur' : activeStayCity;
  const bookingLink = document.getElementById('bookingSearchLink');
  if (bookingLink) {
    bookingLink.href = stayBookingSearchUrl(city, activeStay);
    bookingLink.textContent = activeStay === 'PG / monthly' ? 'Find PG & monthly stays ↗'
      : activeStay === 'Camping' ? 'Find campsites ↗' : 'Search stays & availability ↗';
  }
  renderStayOptions(city);

  el.innerHTML = list.length ? list.map(s => `
    <article class="stay-card">
      <img src="${s.img}" alt="${escapeHtml(s.name)} in ${escapeHtml(s.city)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/hostel.svg'">
      <div class="stay-body">
        <div class="stay-city">${escapeHtml(s.city)} · ${escapeHtml(s.type)}</div>
        <h3>${escapeHtml(s.name)}</h3>
        <div class="muted">📍 ${escapeHtml(s.area)}</div>
        <p class="stay-address">${escapeHtml(s.address)}</p>
        <div class="chips">
          <span class="chip">${escapeHtml(s.type)}</span>
          <span class="chip">Property listing</span>
        </div>
        <div class="stay-links"><a class="btn primary" href="${s.url}" target="_blank" rel="noopener">Property &amp; availability ↗</a><a class="btn soft" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ', ' + s.address)}" target="_blank" rel="noopener">Open map ↗</a></div>
      </div>
    </article>`).join('')
    : `<div class="notice stay-empty">No individual ${activeStay === 'All' ? '' : escapeHtml(activeStay.toLowerCase() + ' ')}property is featured for ${escapeHtml(city)}. Search live listings and availability by area.</div>`;
}

// Populate destination selector from the destination guide.
const stayCitySelect = document.getElementById('stayDestFilter');
if (stayCitySelect) {
  stayCitySelect.innerHTML = '<option value="All">All destinations</option>' + DESTINATIONS.map(d => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`).join('');
  stayCitySelect.value = 'Jaipur';
  activeStayCity = 'Jaipur';
  stayCitySelect.addEventListener('change', () => { activeStayCity = stayCitySelect.value; renderStays(); });
}

// Stay filter pills
document.querySelectorAll('#stayFilters button').forEach(b =>
  b.addEventListener('click', () => {
    activeStay = b.dataset.stay;
    document.querySelectorAll('#stayFilters button')
      .forEach(x => x.classList.toggle('active', x === b));
    renderStays();
  })
);

// ---------------------------------------------------------------------------
// Food guide page
// ---------------------------------------------------------------------------

/** Match each dish to its own locally stored photograph. */
function getFoodImage(food) {
  const dishImages = {
    'dal baati churma': 'food-dal-baati-churma.webp', 'sabudana khichdi': 'food-sabudana-khichdi.webp',
    'mughlai biryani': 'food-mughlai-biryani.webp', 'biryani': 'food-biryani.webp',
    'pyaaz kachori': 'food-pyaaz-kachori.webp', 'kachori sabzi': 'food-kachori-sabzi.webp',
    'chole bhature': 'food-chole-bhature.webp', 'bedai & sabzi': 'food-bedai-sabzi.webp',
    'vada pav': 'food-vada-pav.webp', 'pav bhaji': 'food-pav-bhaji.webp', 'misal pav': 'food-misal-pav.webp',
    'seekh kebab': 'food-seekh-kebab.webp', 'lassi': 'food-lassi.webp', 'banarasi lassi': 'food-banarasi-lassi.webp',
    'street chaat': 'food-street-chaat.webp', 'dilli chaat': 'food-dilli-chaat.webp',
    'tamatar chaat': 'food-tamatar-chaat.webp', 'bhel puri': 'food-bhel-puri.webp',
    'ghewar': 'food-ghewar.webp', 'bebinca': 'food-bebinca.webp', 'malaiyyo': 'food-malaiyyo.webp',
    'petha': 'food-petha.webp', 'jalebi': 'food-jalebi.webp', 'seasonal sweet': 'food-seasonal-sweet.webp',
    'puran poli': 'food-puran-poli.webp', 'aktori': 'food-aktori.webp',
    'goan fish curry & rice': 'food-goan-fish-curry-rice.webp', 'goan fish curry': 'food-goan-fish-curry.webp',
    'trout fish curry': 'food-trout-fish-curry.webp', 'bombil fry': 'food-bombil-fry.webp',
    'prawn balchão': 'food-prawn-balchao.webp', 'xacuti chicken': 'food-xacuti-chicken.webp',
    'butter chicken': 'food-butter-chicken.webp', 'siddu': 'food-siddu.webp', 'thukpa': 'food-thukpa.webp'
  };
  const image = dishImages[String(food.name).toLowerCase()];
  if (image) return `assets/${image}`;
  return 'assets/food-meal.svg';
}

/** Build a Google Maps search for a dish in the selected city when available. */
function googleMapsFoodSearchUrl(food) {
  const city = document.getElementById('foodDestFilter')?.value;
  const query = [`restaurants serving ${food.name}`, city && city !== 'All' ? city : 'India'].join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const NON_VEGETARIAN_DISHES = new Set([
  'trout fish curry', 'goan fish curry & rice', 'goan fish curry', 'xacuti chicken',
  'prawn balchão', 'butter chicken', 'seekh kebab', 'mughlai biryani', 'bombil fry', 'bebinca'
]);
const FLEXIBLE_DISHES = new Set(['thukpa', 'biryani']);

function foodDietClass(food) {
  const name = String(food.name).toLocaleLowerCase();
  if (NON_VEGETARIAN_DISHES.has(name) || /fish|chicken|prawn|kebab/.test(name)) return 'Non-vegetarian';
  if (FLEXIBLE_DISHES.has(name)) return 'Veg or non-veg';
  return 'Vegetarian';
}

function isBudgetFriendlyDish(food) {
  const firstAmount = Number(String(food.price || '').replace(/,/g, '').match(/\d+/)?.[0]);
  return Number.isFinite(firstAmount) && firstAmount <= 150;
}

function getFoodRouteAnchor(city) {
  const destination = DESTINATIONS.find(d => d.name === city) || DESTINATIONS[0];
  const navPlace = document.getElementById('mapDestination')?.value === destination.name
    ? document.getElementById('mapAttraction')?.value : '';
  const attraction = destination.attractions.find(a => a[0] === navPlace) || destination.attractions[0];
  return `${attraction?.[0] || destination.name}, ${destination.name}, India`;
}

function googleMapsFoodAreaUrl(area) {
  const query = `${area.name}, ${area.area}, ${area.city}, India restaurants`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function googleMapsFoodRouteUrl(area) {
  const params = new URLSearchParams({
    api: '1', origin: getFoodRouteAnchor(area.city),
    destination: `${area.name}, ${area.city}, India`, travelmode: 'driving', dir_action: 'navigate'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function renderFoodAreas() {
  const host = document.getElementById('foodAreaCards');
  if (!host) return;
  const city = document.getElementById('foodDestFilter')?.value || 'All';
  const areas = city === 'All' ? FOOD_AREAS : FOOD_AREAS.filter(area => area.city === city);
  host.innerHTML = areas.map(area => `
    <article class="food-area-card">
      <div class="food-area-top"><span class="food-area-icon" aria-hidden="true">⌖</span><span>${escapeHtml(area.city)}</span></div>
      <h3>${escapeHtml(area.name)}</h3>
      <p class="muted">${escapeHtml(area.area)} · ${escapeHtml(area.dishes)}</p>
      <div class="food-area-meta"><span>Budget guide</span><strong>${escapeHtml(area.budget)}</strong></div>
      <p class="food-hours-note">Venue hours and menus vary. Check current listings before you go.</p>
      <div class="food-area-links">
        <a class="btn soft" href="${googleMapsFoodAreaUrl(area)}" target="_blank" rel="noopener noreferrer">Restaurants &amp; hours ↗</a>
        <a class="text-btn" href="${googleMapsFoodRouteUrl(area)}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
      </div>
    </article>`).join('');
}

/** Renders food cards filtered by type and optionally by destination */
async function renderFoods() {
  const destFilter = document.getElementById('foodDestFilter')?.value || 'All';
  const el = document.getElementById('foodCards');
  if (!el) return;
  renderFoodAreas();

  let list;

  if (destFilter !== 'All') {
    // Show foods specific to the selected destination
    const dest = DESTINATIONS.find(d => d.name === destFilter);
    if (dest && Array.isArray(dest.foods) && dest.foods.length) {
      list = activeFood === 'All'
        ? dest.foods
        : dest.foods.filter(f => {
          if (activeFood === 'Vegetarian' || activeFood === 'Non-vegetarian') {
            return foodDietClass(f) === activeFood || foodDietClass(f) === 'Veg or non-veg';
          }
          if (activeFood === 'Budget-friendly') return isBudgetFriendlyDish(f);
          return f.type === activeFood;
        });
    } else {
      list = [];
    }
  } else {
    // Show global food list filtered by type
    list = await apiGetFoods(['Vegetarian', 'Non-vegetarian', 'Budget-friendly'].includes(activeFood) ? 'All' : activeFood);
    if (activeFood === 'Vegetarian' || activeFood === 'Non-vegetarian') {
      list = list.filter(f => foodDietClass(f) === activeFood || foodDietClass(f) === 'Veg or non-veg');
    } else if (activeFood === 'Budget-friendly') list = list.filter(isBudgetFriendlyDish);
  }

  if (!list || !list.length) {
    el.innerHTML = '<div class="empty-state">No food items found for this filter. Try another category or destination.</div>';
    return;
  }

  el.innerHTML = list.map(f => `
    <article class="food-card">
      <img src="${getFoodImage(f)}" alt="${escapeHtml(f.name)} illustration" loading="lazy">
      <div class="food-body">
        <h3>${escapeHtml(f.name)}</h3>
        <div class="muted">${escapeHtml(f.desc)}</div>
        <div class="food-foot">
          <span class="price">${escapeHtml(f.price)} <small>per serving</small></span>
          <span class="chip">${escapeHtml(foodDietClass(f))}</span>
        </div>
        <a class="text-btn" style="display:inline-block;padding:12px 0 0"
          href="${googleMapsFoodSearchUrl(f)}" target="_blank" rel="noopener noreferrer">
          Restaurants, prices &amp; hours ↗
        </a>
      </div>
    </article>`).join('');
}

// Food filter pills
document.querySelectorAll('#foodFilters button').forEach(b =>
  b.addEventListener('click', () => {
    activeFood = b.dataset.food;
    document.querySelectorAll('#foodFilters button')
      .forEach(x => x.classList.toggle('active', x === b));
    renderFoods();
  })
);

// ---------------------------------------------------------------------------
// User-selected appearance
// ---------------------------------------------------------------------------

function applyTheme(theme, persist = false) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const button = document.getElementById('themeToggle');
  if (button) {
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('aria-pressed', String(dark));
    button.innerHTML = `<span aria-hidden="true">${dark ? '☀' : '☾'}</span>`;
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#17221e' : '#1769e8');
  if (persist) {
    try { localStorage.setItem('travelguide-theme', dark ? 'dark' : 'light'); } catch (_) {}
  }
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
}

applyTheme(document.documentElement.dataset.theme || 'light');

// ---------------------------------------------------------------------------
// Bootstrap all sections on first load
// ---------------------------------------------------------------------------

for (const id of ['foodDestFilter', 'planDestination']) {
  const select = document.getElementById(id);
  if (!select) continue;
  DESTINATIONS.forEach(destination => {
    if (![...select.options].some(option => option.value === destination.name || option.text === destination.name)) {
      select.add(new Option(destination.name, destination.name));
    }
  });
}
document.getElementById('journalDate').value = new Date().toISOString().slice(0, 10);
renderHome();
renderDestinations();
initNavigationSelectors();
renderStays();
renderFoods();
generatePlan();
renderPassport();
renderAdminDashboard();
