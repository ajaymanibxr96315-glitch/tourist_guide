/**
 * Online map and navigation support.
 * MapLibre renders OpenStreetMap-based OpenFreeMap vector tiles; Google Maps
 * URLs handle exact place search and turn-by-turn navigation.
 */
'use strict';

var _liveMap = null; // Shared MapLibre instance for the navigation controls.
let _mapInitPending = false;
let _mapMode = 'auto';
let _userMarker = null;
let _activePlaceMarker = null;
let _destinationMarkers = [];
let _mapLoaded = false;

function isOnline() { return navigator.onLine; }

function googleMapsDirectionsUrl(destination, travelMode = 'driving') {
  const target = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;
  const params = new URLSearchParams({
    api: '1',
    destination: target,
    travelmode: ['driving', 'walking', 'bicycling', 'transit'].includes(travelMode) ? travelMode : 'driving',
    dir_action: 'navigate'
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function showMapNotice(message) {
  const status = document.getElementById('mapStatus');
  if (!status) return;
  let notice = status.querySelector('.notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.className = 'notice offline-notice';
    status.appendChild(notice);
  }
  notice.textContent = message;
}

function showLiveMap() {
  const offline = document.getElementById('map');
  const live = document.getElementById('live-map');
  if (offline) offline.style.display = 'none';
  if (live) { live.style.display = 'block'; live.style.height = '560px'; }
  if (typeof window.maplibregl === 'undefined') { showSchematicMap(); return; }

  if (!_liveMap && !_mapInitPending) {
    _mapInitPending = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          _liveMap = initLiveMap();
        } catch (error) {
          console.info('[TravelGuide] Live map could not be initialized:', error.message);
          showSchematicMap();
          showMapNotice('This browser could not start the live map. Use Google Maps directions or the offline map.');
        } finally {
          _mapInitPending = false;
        }
      });
    });
  } else if (_liveMap) {
    _liveMap.resize();
    if (typeof selectedDestination !== 'undefined') {
      focusMapOnDestination(selectedDestination, document.getElementById('mapAttraction')?.value || '');
    }
  }
}

function showSchematicMap() {
  const offline = document.getElementById('map');
  const live = document.getElementById('live-map');
  if (offline) offline.style.display = '';
  if (live) live.style.display = 'none';
}

function setMapMode(mode) {
  if (!['live', 'offline', 'auto'].includes(mode)) return;
  _mapMode = mode;
  updateMapModeButtons();
  if (mode === 'offline') { showSchematicMap(); return; }
  checkMapAvailability();
}

function updateMapModeButtons() {
  const liveAvailable = isOnline() && typeof window.maplibregl !== 'undefined';
  const active = _mapMode === 'offline' || !liveAvailable ? 'offline' : 'live';
  document.querySelectorAll('[data-map-mode]').forEach(button =>
    button.setAttribute('aria-pressed', String(button.dataset.mapMode === active))
  );
}

function initLiveMap() {
  const el = document.getElementById('live-map');
  if (!el || typeof window.maplibregl === 'undefined') return null;

  const map = new window.maplibregl.Map({
    container: el,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [78.9629, 20.5937],
    zoom: 4.3,
    minZoom: 3,
    maxZoom: 18,
    attributionControl: true,
    cooperativeGestures: true
  });
  map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
  map.addControl(new window.maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserLocation: true
  }), 'top-right');
  let mapErrors = 0;
  map.on('load', () => {
    _mapLoaded = true;
    addDestinationMarkers(map);
    if (typeof focusSelectedPlace === 'function') focusSelectedPlace();
    map.resize();
    document.querySelector('.offline-notice')?.remove();
  });
  map.on('error', () => {
    mapErrors += 1;
    if (mapErrors >= 5 && document.getElementById('mapPage')?.classList.contains('active')) {
      showSchematicMap();
      showMapNotice('The live map tiles could not load. Try again when connected, or use the offline map and Google Maps links.');
    }
  });
  setTimeout(() => {
    if (!_mapLoaded && document.getElementById('mapPage')?.classList.contains('active')) {
      showSchematicMap();
      showMapNotice('The live map is taking too long to load. Use the offline map or open Google Maps directions.');
    }
  }, 15000);
  return map;
}

function addDestinationMarkers(map) {
  if (!map || typeof window.maplibregl === 'undefined') return;
  _destinationMarkers.forEach(marker => marker.remove());
  _destinationMarkers = [];
  DESTINATIONS.forEach(destination => {
    if (!Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) return;
    const popup = new window.maplibregl.Popup({ offset: 24 }).setHTML(
      `<strong>${escapeMapHTML(destination.name)}</strong><br>${escapeMapHTML(destination.tagline)}<br>` +
      `<a href="${googleMapsDirectionsUrl({ lat: destination.lat, lng: destination.lng })}" target="_blank" rel="noopener">Google Maps directions ↗</a>`
    );
    const marker = new window.maplibregl.Marker({ color: '#1675d1' })
      .setLngLat([destination.lng, destination.lat]).setPopup(popup).addTo(map);
    _destinationMarkers.push(marker);
  });
  JAIPUR_STOPS.forEach(stop => {
    const popup = new window.maplibregl.Popup({ offset: 24 }).setHTML(
      `<strong>${escapeMapHTML(stop[0])}</strong><br>${escapeMapHTML(stop[3])}<br>` +
      `<a href="${googleMapsDirectionsUrl({ lat: stop[1], lng: stop[2] })}" target="_blank" rel="noopener">Google Maps directions ↗</a>`
    );
    _destinationMarkers.push(new window.maplibregl.Marker({ color: '#db7a31' })
      .setLngLat([stop[2], stop[1]]).setPopup(popup).addTo(map));
  });
  const coords = DESTINATIONS.filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lng))
    .map(d => [d.lng, d.lat]);
  if (coords.length > 1) {
    const bounds = coords.reduce((b, coord) => b.extend(coord), new window.maplibregl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, { padding: 45, maxZoom: 5, duration: 0 });
  }
}

function escapeMapHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function focusMapOnDestination(destination, attractionName = '') {
  if (!_liveMap || !destination) return;
  if (!Number.isFinite(destination.lat) || !Number.isFinite(destination.lng)) {
    showMapNotice('This destination needs checked map coordinates. You can still open its place search in Google Maps.');
    return;
  }
  let point = [destination.lng, destination.lat];
  let zoom = 11.5;
  const attraction = destination.attractions?.find(item => item[0] === attractionName);
  const wikiTitle = String(attraction?.[4] || attractionName).replace(/_/g, ' ').trim().toLowerCase();
  const exactPoint = window._attractionCoords?.[wikiTitle];
  if (exactPoint) {
    point = [exactPoint.lng, exactPoint.lat];
    zoom = 15;
  } else if (destination.name === 'Jaipur' && attractionName) {
    const stop = JAIPUR_STOPS.find(item => item[0].toLowerCase() === attractionName.toLowerCase());
    if (stop) { point = [stop[2], stop[1]]; zoom = 15; }
  }
  _liveMap.flyTo({ center: point, zoom, essential: true });
  if (_activePlaceMarker) _activePlaceMarker.remove();
  const popup = new window.maplibregl.Popup({ offset: 24 }).setText(attractionName || destination.name);
  _activePlaceMarker = new window.maplibregl.Marker({ color: '#e24b4b' })
    .setLngLat(point).setPopup(popup).addTo(_liveMap);
}

function resetMapView() {
  if (!_liveMap) return false;
  const coords = DESTINATIONS.filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lng))
    .map(d => [d.lng, d.lat]);
  if (coords.length > 1) {
    const bounds = coords.reduce((b, coord) => b.extend(coord), new window.maplibregl.LngLatBounds(coords[0], coords[0]));
    _liveMap.fitBounds(bounds, { padding: 45, maxZoom: 5 });
  }
  return true;
}

async function locateUser(map) {
  if (!navigator.geolocation) {
    showMapNotice('This browser does not provide location access. Google Maps can still open directions to your selected place.');
    throw new Error('Geolocation is unavailable');
  }
  const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: true, timeout: 12000, maximumAge: 60000
  }));
  const { latitude, longitude } = position.coords;
  if (_userMarker) _userMarker.remove();
  _userMarker = new window.maplibregl.Marker({ color: '#16834b' })
    .setLngLat([longitude, latitude]).setPopup(new window.maplibregl.Popup().setText('You are here')).addTo(map);
  map.flyTo({ center: [longitude, latitude], zoom: 14, essential: true });
  return { lat: latitude, lng: longitude };
}

function checkMapAvailability() {
  updateConnectivityBadge(navigator.onLine);
  updateMapModeButtons();
  if (_mapMode === 'offline') { showSchematicMap(); return false; }
  if (!navigator.onLine) {
    showSchematicMap();
    showMapNotice('You are offline. The approximate Jaipur map is available; Google Maps directions need internet.');
    return false;
  }
  if (typeof window.maplibregl === 'undefined') {
    showSchematicMap();
    showMapNotice('The live map library has not loaded yet. Retry Live map, or use Google Maps directions.');
    return false;
  }
  document.querySelector('.offline-notice')?.remove();
  showLiveMap();
  return true;
}

function updateConnectivityBadge(online) {
  document.querySelectorAll('.connectivity-badge, #connectivityBadge').forEach(badge => {
    badge.textContent = online ? '● Online' : '● Offline';
    badge.classList.toggle('offline', !online);
  });
}

window.addEventListener('online', () => {
  updateConnectivityBadge(true);
  updateMapModeButtons();
  if (document.getElementById('mapPage')?.classList.contains('active') && _mapMode !== 'offline') checkMapAvailability();
});

window.addEventListener('offline', () => {
  updateConnectivityBadge(false);
  updateMapModeButtons();
  showSchematicMap();
  showMapNotice('You are offline. The approximate Jaipur map is available; Google Maps directions need internet.');
});

window.addEventListener('maplibrarystarted', () => {
  // Module load can finish after the initial page scripts have run.
  updateMapModeButtons();
  if (document.getElementById('mapPage')?.classList.contains('active') && isOnline() && _mapMode !== 'offline') checkMapAvailability();
});
