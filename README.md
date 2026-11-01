# TravelGuide

TravelGuide is a responsive, front-end travel guide for exploring sample destinations across India. It combines destination discovery, practical trip planning, map links, local food and stay guides, favourites, and a personal travel passport in one static web app.

The project uses HTML, CSS, and plain JavaScript. It has no build step, framework, account system, server-side API, or database. User changes are stored in the current browser on the current device.

## Contents

- [Run the app](#run-the-app)
- [Features](#features)
- [Project structure](#project-structure)
- [How the app works](#how-the-app-works)
- [Local data and privacy](#local-data-and-privacy)
- [Offline support and external services](#offline-support-and-external-services)
- [Testing and troubleshooting](#testing-and-troubleshooting)
- [Known limitations](#known-limitations)

## Run the app

Serve the project directory with a local HTTP server. Serving it from `localhost` enables service workers and gives the browser a secure context for features such as location access.

### Python

From this directory, run:

```sh
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

### Visual Studio Code

Open this directory in VS Code and use the Live Server extension. Open the local URL it provides.

Opening `index.html` directly with a `file://` URL can show the basic app, but service worker/offline caching and some browser APIs will not be available.

## Features

### Destination discovery

- Browse eight sample destinations: Jaipur, Manali, Nashik, Goa, Delhi, Varanasi, Agra, and Mumbai.
- Search across destination names, states, categories, descriptions, attractions, and foods.
- Filter by heritage, nature, spiritual, beach, adventure, and budget-friendly categories; sort by recommendation, name, or starting budget.
- Open destination details with suggested attractions, seasons, durations, illustrative costs, safety notes, foods, stays, and itinerary guidance.
- Save favourites, mark places as visited, and revisit recently viewed destinations.

### Trip planner

- Build an example itinerary by choosing a destination, trip length, budget level, interests, and food preference.
- Switch between itinerary days, review sample stops, and see an illustrative budget estimate.
- Print or save the itinerary through the browser print dialog, or download its JSON representation.

### Maps and navigation

- Choose a city and attraction and open driving or transit directions in Google Maps.
- Search nearby place categories, find restaurants along a route, and optionally center the live map on the device location.
- View a MapLibre map backed by OpenFreeMap / OpenStreetMap when the required library and network services are available.
- Use the illustrated Jaipur map when offline or when the live map cannot load. It is a schematic map and is not suitable for turn-by-turn navigation.

### Food and stays

- Browse sample dishes by destination and food category, including vegetarian, non-vegetarian, seafood, dessert, and budget filters.
- Explore sample food neighbourhoods and open current restaurant searches or directions in Google Maps.
- Filter illustrative stay listings by city and accommodation type, and open provider or Booking.com searches for current inventory.

### Travel passport

- Mark destinations as visited, collect on-device badges, and keep dated journal entries.
- Optionally attach a photo to a journal entry; the app resizes/compresses the image before keeping it in browser storage.
- Export a passport summary or print the passport.

### Local demo admin

- Review locally submitted destination notes, moderate them, and resolve information reports.
- Inspect built-in destination records for required fields, edit local overrides, and add or remove browser-local destinations.
- The dashboard is a demo content editor. It has no authentication, shared backend, or production security controls.

### Interface

- Responsive desktop and mobile layouts, dark mode, accessible navigation labels, and keyboard skip navigation.
- Installable web app metadata and an SVG app icon are provided through `manifest.json`.

## Project structure

```text
index.html                 Page markup, navigation, and script loading
css/
  style.css                Layout, components, responsive rules, and themes
js/
  data.js                  Sample destinations, stays, foods, and itinerary templates
  api.js                   Browser-side data helpers and localStorage operations
  map.js                   Live/offline map modes and map controls
  script.js                Page rendering, interaction handlers, and app state
assets/                    Local SVG illustrations, icons, and food images
manifest.json              Progressive web app metadata
sw.js                      Static asset caching and offline navigation fallback
README.md                  Project guide
```

Scripts are loaded in dependency order at the end of `index.html`: `data.js`, `api.js`, `map.js`, then `script.js`. Keep that order if the script tags are changed.

## How the app works

- `index.html` contains all page sections. Navigation switches the visible section without loading a new page.
- `js/data.js` is the source for the built-in destinations and sample listings. It also contains itinerary templates keyed by city.
- `js/api.js` exposes async helper functions for reading sample data, building itineraries, saving favourites and recents, and exporting a plan. These helpers run in the browser; “API” here does not mean a remote web service.
- `js/script.js` owns the UI state and rendering for destination cards, details, itinerary, food, stays, passport, reviews, reports, and the local admin page.
- `js/map.js` initializes MapLibre when available and switches to the illustrated map when it is unavailable or offline.
- `sw.js` precaches the app shell and local illustrations, serves same-origin cached files first, and provides the cached app page for offline navigation. External tiles and map libraries are not bulk-cached.

## Local data and privacy

Data is stored in the browser profile for the current site. It does not sync between browsers or devices and is cleared if that site’s browser storage is cleared.

| Data | Storage key |
| --- | --- |
| Favourites | `tg_favourites` |
| Recently viewed destinations | `tg_recent_destinations` |
| Last generated itinerary | `tg_itinerary` |
| Theme preference | `travelguide-theme` |
| Passport visits and journal | `travelguide-passport-v1` |
| Local destination edits, reviews, reports, and custom destinations | `travelguide-local-admin-v1` |

Passport photos and admin changes stay in that browser’s local storage. Avoid adding sensitive personal information: browser-local storage is not encrypted app storage, is accessible to scripts running on the same origin, and does not have account-level access controls. The demo admin page is not intended for use as a secure content management system.

## Offline support and external services

The app shell and listed local assets are precached by the service worker after a successful install. Offline use requires first visiting the site from a server over `https` or `localhost`, allowing the service worker to install, and having the required assets cached. The static guide, sample content, local planner, and illustrated Jaipur map are designed to work offline after that.

These features need a network connection:

- Live MapLibre code, OpenFreeMap map styles/tiles, and Wikipedia lookups for attraction imagery or coordinates.
- Remote destination and stay photos when a local illustration is not used.
- Google Maps directions, nearby searches, and current restaurant listings.
- External accommodation provider pages and current availability.

The app does not download map tiles in bulk. Map availability and tile coverage depend on the external providers. No API key is configured or required by this project for the public map style or Google Maps URL links.

## Testing and troubleshooting

There is no package manager manifest, build system, or automated test runner in this project. Basic checks can be run with Node.js:

```sh
node --check js/data.js
node --check js/api.js
node --check js/map.js
node --check js/script.js
node --check sw.js
```

For a manual smoke test, open the local URL and try destination search/detail, a generated itinerary, the offline map mode, food and stay filters, favourites, and the passport. Browser developer tools can help diagnose blocked external requests or service worker cache errors.

If the app looks stale after editing files, reload the page. The service worker uses a versioned cache (`travelguide-v15`); when changing the precached asset set or cache behavior, update `CACHE_NAME` in `sw.js` so returning users receive a fresh cache. If an old version persists during development, unregister the service worker or clear this site’s cache in browser developer tools, then reload while online.

If the map shows its offline illustration while online, check whether the MapLibre script/style or map tile requests are blocked, and use the map page’s retry control. The offline map remains available as a fallback.

## Known limitations

- Destination descriptions, attraction records, prices, meal budgets, and itinerary schedules are sample content. Confirm live details before travelling.
- The itinerary is a simple template, not a route optimizer. Stops may need rearranging to account for distance, opening times, weather, accessibility, or personal needs.
- Stay listings and food neighbourhoods are examples and search suggestions; the app does not verify availability, rates, reviews, dietary handling, or venue hours.
- The offline Jaipur map is illustrative and approximate. It does not provide GPS routing or authoritative street data.
- Favourites, journal entries, admin edits, and reports are local to one browser. There is no multi-user account, cloud backup, moderation service, or database.

Travel information is provided for planning inspiration only. Verify current prices, hours, routes, weather, and local advisories before a trip.
