/**
 * data.js — Sample travel data for TravelGuide
 *
 * ⚠️  SAMPLE DATA NOTICE: All destination information, prices, ratings, hotel names,
 * restaurant names, and safety tips in this file are illustrative examples for UI
 * demonstration purposes. They are not verified live listings and may not reflect
 * current conditions, prices, or availability. Always verify travel information from
 * official sources before making any bookings or travel plans.
 *
 * Destination and dish photos use their configured photo URLs. Attraction cards
 * retrieve landmark-specific Wikipedia page thumbnails when online and show a
 * local SVG fallback while offline.
 *
 * The website runs entirely in the browser. The guide data lives in these arrays;
 * browser-only preferences and saved itineraries are handled in api.js.
 */

const DESTINATIONS = [
  // ─────────────────────────────────────────────────────────────────────────
  // JAIPUR
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    rating: '4.8',
    season: 'October – March',
    time: 'Early morning',
    duration: '2–3 days',
    budget: '₹1,500–3,000/day',
    tagline: 'The Pink City of India',
    desc: 'Explore royal forts, pink-hued architecture, lively bazaars, and the rich food traditions of Rajasthan.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Jaipur_03-2016_27_Hawa_Mahal_-_Palace_of_the_Winds.jpg/960px-Jaipur_03-2016_27_Hawa_Mahal_-_Palace_of_the_Winds.jpg',
    photoSource: 'https://commons.wikimedia.org/wiki/File:Jaipur_03-2016_27_Hawa_Mahal_-_Palace_of_the_Winds.jpg',
    lat: 26.9124,
    lng: 75.7873,
    attractions: [
      ['Hawa Mahal',   'Iconic palace facade and city landmark',          '', '9 AM – 5 PM', 'Hawa Mahal'],
      ['Amber Fort',   'Hilltop fort with courtyards and grand gateways', '', '8 AM – 6 PM', 'Amber Fort'],
      ['City Palace',  'Royal residence, courtyards, and museum',         '', '9:30 AM – 5 PM', 'City Palace, Jaipur'],
      ['Jantar Mantar','Historic astronomical instruments',               '', '9 AM – 4:30 PM', 'Jantar Mantar, Jaipur']
    ],
    foods: [
      { name: 'Dal Baati Churma', type: 'Traditional', price: '₹150–350', desc: 'Rajasthani trilogy of lentil curry, baked wheat balls, and sweet crushed grain.', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80' },
      { name: 'Pyaaz Kachori',    type: 'Street food', price: '₹25–70',   desc: 'Crispy, deep-fried pastry stuffed with a spiced onion filling.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
      { name: 'Lassi',            type: 'Vegetarian',  price: '₹40–100',  desc: 'Thick, chilled yoghurt drink — sweet or salted, best after a long morning of sightseeing.', img: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80' },
      { name: 'Ghewar',           type: 'Dessert',     price: '₹100–300', desc: 'Honeycomb-textured disc soaked in sugar syrup and topped with malai — a Rajasthani festive sweet.', img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Dal baati churma, pyaaz kachori, ghewar',
    stayArea: 'MI Road, Bani Park, and areas with convenient transport',
    safetyTips: [
      'Keep a copy of your ID and hotel address with you at all times.',
      'Use metered auto-rickshaws or app-based cabs to avoid overcharging.',
      'Drink bottled or filtered water; avoid uncooked street food if your stomach is sensitive.',
      'Stay aware of your belongings in crowded bazaars and temple areas.'
    ],
    expenses: {
      accommodation: '₹800–3,500/day',
      food:          '₹300–800/day',
      transport:     '₹200–600/day',
      misc:          '₹200–500/day',
      total:         '₹1,500–5,400/day'
    },
    visitHours: 'Most monuments open 9 AM – 5 PM; bazaars accessible longer hours.'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MANALI
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Manali',
    state: 'Himachal Pradesh',
    category: 'Nature',
    rating: '4.7',
    season: 'March – June; December – February for snow',
    time: 'Morning for outdoor activities',
    duration: '3–4 days',
    budget: '₹1,800–3,500/day',
    tagline: 'Mountain views and fresh alpine air',
    desc: 'A mountain escape with pine forests, riverside walks, scenic drives, and seasonal outdoor adventures.',
    img: 'https://images.unsplash.com/photo-1676712753566-8d6c2ff42b9d?auto=format&fit=crop&w=1400&q=85',
    photoSource: 'https://unsplash.com/photos/a-view-of-a-city-with-mountains-in-the-background-3QYhhmv9PRs',
    lat: 32.2396,
    lng: 77.1887,
    attractions: [
      ['Hadimba Temple', 'Woodland temple surrounded by cedar trees',    '', '8 AM – 6 PM', 'Hidimba Devi Temple'],
      ['Old Manali',     'Cafes, walks, and mountain-town lanes',         '', 'Open all day', 'Old Manali'],
      ['Solang Valley',  'Seasonal mountain activities and views',        '', '9 AM – 5 PM', 'Solang Valley'],
      ['Vashisht',       'Village lanes and hot-spring area',             '', '7 AM – 9 PM', 'Vashisht, Himachal Pradesh']
    ],
    foods: [
      { name: 'Siddu',           type: 'Traditional', price: '₹80–180',  desc: 'Steamed wheat bread stuffed with poppy seeds or walnuts — a Himachali staple.', img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80' },
      { name: 'Trout Fish Curry',type: 'Traditional', price: '₹250–500', desc: 'Fresh river trout cooked in local spices — a Manali mountain speciality.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
      { name: 'Thukpa',          type: 'Street food', price: '₹80–180',  desc: 'Tibetan noodle soup — warm and filling after a day in the mountains.', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=600&q=80' },
      { name: 'Aktori',          type: 'Dessert',     price: '₹60–150',  desc: 'Buckwheat pancake — a traditional Himachali sweet treat often served with honey.', img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Siddu, trout, thukpa, mountain-style meals',
    stayArea: 'Old Manali, Mall Road, and nearby villages depending on transport',
    safetyTips: [
      'Check road and weather conditions before heading to high-altitude areas.',
      'Carry warm layers even in summer; temperatures drop sharply at night.',
      'Acclimatise for a day before undertaking strenuous hikes or treks.',
      'Keep emergency contacts for local mountain rescue and medical services.'
    ],
    expenses: {
      accommodation: '₹700–4,000/day',
      food:          '₹400–900/day',
      transport:     '₹300–800/day',
      misc:          '₹300–600/day',
      total:         '₹1,700–6,300/day'
    },
    visitHours: 'Outdoor areas accessible from sunrise to sunset; check seasonal closures for high passes.'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NASHIK
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Nashik',
    state: 'Maharashtra',
    category: 'Spiritual',
    rating: '4.6',
    season: 'October – February',
    time: 'Early morning for temple visits',
    duration: '1–2 days',
    budget: '₹1,000–2,500/day',
    tagline: 'Sacred riverfronts and vineyard country',
    desc: 'Visit historic temples, explore the Godavari riverfront, discover local food, and enjoy the countryside.',
    img: 'https://i0.wp.com/somanytraveltales.com/wp-content/uploads/2022/01/Ram-Kund-scaled.jpg?fit=1600%2C1017&ssl=1',
    photoSource: 'https://somanytraveltales.com/things-to-see-and-do-in-nashik-travel-guide/',
    lat: 19.9975,
    lng: 73.7898,
    attractions: [
      ['Trimbakeshwar', 'Important temple town near the hills',                               '', '5:30 AM – 9 PM', 'Trimbakeshwar Shiva Temple'],
      ['Ramkund',       'Historic riverfront and pilgrimage site',                            '', 'Open all day', 'Ramkund, Nashik'],
      ['Pandav Leni',   'Ancient rock-cut caves',                                             '', '9 AM – 5 PM', 'Pandav Leni'],
      ['Anjaneri Hills','Popular outdoor destination; check conditions before hiking',        '', 'Sunrise – Sunset', 'Anjaneri']
    ],
    foods: [
      { name: 'Misal Pav',       type: 'Street food', price: '₹60–120',  desc: 'Spicy sprouted lentil curry topped with farsan, served with bread rolls.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
      { name: 'Sabudana Khichdi',type: 'Vegetarian',  price: '₹60–150',  desc: 'Sago pearls cooked with peanuts and mild spices — a popular Maharashtra breakfast.', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80' },
      { name: 'Vada Pav',        type: 'Street food', price: '₹15–40',   desc: 'Deep-fried potato dumpling in a bread roll — Maharashtra street food icon.', img: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=600&q=80' },
      { name: 'Puran Poli',      type: 'Traditional', price: '₹80–180',  desc: 'Sweet flatbread stuffed with jaggery and lentil filling — a festive Maharashtrian sweet.', img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Misal pav, vada pav, sabudana khichdi',
    stayArea: 'Central Nashik and areas convenient to your planned attractions',
    safetyTips: [
      'Dress modestly and remove footwear before entering temples.',
      'Start treks early to avoid midday heat; carry sufficient water.',
      'Follow crowd-management guidelines during major pilgrim festivals.',
      'Confirm vineyard tour availability in advance during peak season.'
    ],
    expenses: {
      accommodation: '₹600–2,500/day',
      food:          '₹200–600/day',
      transport:     '₹150–400/day',
      misc:          '₹150–400/day',
      total:         '₹1,100–3,900/day'
    },
    visitHours: 'Temples open from early morning (~5:30 AM); caves and outdoor sites generally 9 AM – 5 PM.'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GOA
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Goa',
    state: 'Goa',
    category: 'Beach',
    rating: '4.8',
    season: 'November – February',
    time: 'Morning beaches and late-afternoon sunsets',
    duration: '3–5 days',
    budget: '₹1,800–4,000/day',
    tagline: 'Coastal escapes and colourful culture',
    desc: 'Discover sandy beaches, Portuguese-influenced streets, seafood, markets, and laid-back coastal experiences.',
    img: 'https://www.explorebees.com/uploads/Anjuna%20Beach%20%283%29.jpg',
    photoSource: 'https://www.explorebees.com/Goa/activity/Anjuna-Beach/pl11751',
    lat: 15.2993,
    lng: 74.1240,
    attractions: [
      ['Baga Beach',    'Busy beach area with cafes and activities',                  '', 'Open all day', 'Baga Beach'],
      ['Fontainhas',    'Colourful heritage quarter in Panaji',                        '', '9 AM – 6 PM', 'Fontainhas, Goa'],
      ['Fort Aguada',   'Coastal fort and sea views',                                 '', '9:30 AM – 6 PM', 'Fort Aguada'],
      ['Palolem Beach', 'Scenic southern beach and relaxed atmosphere',               '', 'Open all day', 'Palolem Beach']
    ],
    foods: [
      { name: 'Goan Fish Curry & Rice', type: 'Seafood',     price: '₹180–450', desc: 'Tangy coconut-based fish curry served with steamed rice — the Goan staple.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bebinca',                type: 'Dessert',     price: '₹120–280', desc: 'Layered Goan pudding made from coconut milk and eggs — a Portuguese-influenced classic.', img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' },
      { name: 'Xacuti Chicken',         type: 'Traditional', price: '₹200–400', desc: 'Rich, aromatic chicken curry with roasted spices and coconut.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
      { name: 'Prawn Balchão',          type: 'Seafood',     price: '₹250–500', desc: 'Pickled prawn preparation with a fiery, tangy masala — a classic Goan preserve.', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Goan fish curry, bebinca, xacuti, vegetarian thalis',
    stayArea: 'Choose North or South Goa based on beaches and transport plans',
    safetyTips: [
      'Swim only at patrolled beaches and follow lifeguard flag warnings.',
      'Lock valuables in your room; avoid leaving bags unattended on the beach.',
      'Use registered taxis or app cabs; negotiate fares in advance if using local autos.',
      'Stay hydrated and use sun protection during peak daytime hours.'
    ],
    expenses: {
      accommodation: '₹800–5,000/day',
      food:          '₹400–1,200/day',
      transport:     '₹300–700/day',
      misc:          '₹300–800/day',
      total:         '₹1,800–7,700/day'
    },
    visitHours: 'Beaches are accessible at all hours; forts and heritage sites generally 9:30 AM – 6 PM.'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DELHI
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Delhi',
    state: 'Delhi',
    category: 'Heritage',
    rating: '4.7',
    season: 'October – March',
    time: 'Morning for monuments; evenings for markets',
    duration: '2–3 days',
    budget: '₹1,500–3,500/day',
    tagline: 'A capital of stories, monuments, and food',
    desc: 'Explore centuries of history, grand monuments, bustling bazaars, museums, and a huge range of street food.',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/India_Gate_2014-11-01.jpg/800px-India_Gate_2014-11-01.jpg',
    photoSource: 'https://commons.wikimedia.org/wiki/File:India_Gate_2014-11-01.jpg',
    lat: 28.6139,
    lng: 77.2090,
    attractions: [
      ["Humayun's Tomb", 'Mughal garden tomb and UNESCO-listed heritage',       '', '6 AM – 6 PM', "Humayun's Tomb"],
      ['Red Fort',        'Historic fort complex in Old Delhi',                   '', '9:30 AM – 4:30 PM', 'Red Fort'],
      ['Qutub Minar',     'Historic minaret and archaeological complex',          '', '7 AM – 5 PM', 'Qutb Minar'],
      ['India Gate',      'War memorial and prominent city landmark',             '', 'Open all day', 'India Gate']
    ],
    foods: [
      { name: 'Chole Bhature', type: 'Street food', price: '₹80–200',  desc: 'Spiced chickpea curry served with deep-fried puffed bread — a Delhi breakfast favourite.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
      { name: 'Butter Chicken',type: 'Traditional', price: '₹200–450', desc: 'Tender chicken in a creamy tomato-butter gravy — Delhi is where this dish was invented.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
      { name: 'Dilli Chaat',   type: 'Street food', price: '₹40–120',  desc: 'Aloo tikki, papdi chaat, dahi bhalle — the iconic chaat experience of Old Delhi.', img: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=600&q=80' },
      { name: 'Seekh Kebab',   type: 'Traditional', price: '₹150–350', desc: 'Minced meat grilled on skewers with herbs and spices — an Old Delhi Mughal-era classic.', img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Chole bhature, parathas, chaat, kebabs',
    stayArea: 'Choose a well-connected area near Metro stations and your main attractions',
    safetyTips: [
      'Use the Delhi Metro where possible — it is safe, affordable, and avoids traffic.',
      'Stay alert in crowded markets; keep bags zipped and close to your body.',
      'Avoid unmarked taxis; use app-based cabs or pre-paid taxi counters.',
      'Check air quality index before planning long outdoor walks, especially in winter.'
    ],
    expenses: {
      accommodation: '₹700–4,000/day',
      food:          '₹300–900/day',
      transport:     '₹150–500/day',
      misc:          '₹200–600/day',
      total:         '₹1,350–6,000/day'
    },
    visitHours: 'Major monuments open 7 AM – 5 PM (closed Mondays at some sites); markets active till late evening.'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VARANASI
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Spiritual',
    rating: '4.7',
    season: 'October – March',
    time: 'Sunrise at the ghats; evening for the aarti',
    duration: '2 days',
    budget: '₹1,200–2,800/day',
    tagline: 'Ancient ghats and living traditions',
    desc: "Experience riverside ghats, historic lanes, classical culture, temples, and the city's distinctive food.",
    img: 'https://www.easeindiatrip.com/images/up-img/dashashwamedh-ghat-bg.jpg',
    photoSource: 'https://www.easeindiatrip.com/india/uttar-pradesh/varanasi/dashashwamedh-ghat.html',
    lat: 25.3176,
    lng: 82.9739,
    attractions: [
      ['Dashashwamedh Ghat', 'Famous riverside ghat and evening ceremony area',                '', '4 AM – 11 PM', 'Dashashwamedh Ghat'],
      ['Assi Ghat',          'Popular area for early-morning river views',                     '', 'Open all day', 'Assi Ghat'],
      ['Sarnath',            'Important Buddhist heritage destination outside the city centre', '', '9 AM – 5 PM', 'Sarnath'],
      ['Kashi Vishwanath Temple', 'Historic temple in the heart of the old city',              '', 'Check current temple hours', 'Kashi Vishwanath Temple']
    ],
    foods: [
      { name: 'Kachori Sabzi',  type: 'Street food', price: '₹30–80',  desc: 'Flaky fried bread served with spiced potato curry — a Varanasi morning ritual.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
      { name: 'Tamatar Chaat',  type: 'Street food', price: '₹40–100', desc: 'Tangy tomato-based chaat unique to Varanasi — served on a leaf plate at the ghats.', img: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=600&q=80' },
      { name: 'Malaiyyo',       type: 'Dessert',     price: '₹50–120', desc: 'Seasonal winter sweet — frothy saffron-flavoured milk foam, available October–February.', img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' },
      { name: 'Banarasi Lassi', type: 'Vegetarian',  price: '₹60–150', desc: 'Extra-thick lassi served in earthen cups, topped with cream and dry fruits.', img: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Kachori sabzi, tamatar chaat, malaiyyo in season, lassi',
    stayArea: 'Compare accommodation near the ghats or in better-connected areas based on mobility needs',
    safetyTips: [
      'Respect ongoing ceremonies at the ghats; maintain a quiet, observant distance.',
      'Stick to well-lit paths in the old city lanes after dark.',
      "Drink only bottled or filtered water — the city's tap water is not safe for tourists.",
      'Book boat rides from official ghats; agree on the fare before boarding.'
    ],
    expenses: {
      accommodation: '₹600–3,000/day',
      food:          '₹200–600/day',
      transport:     '₹150–400/day',
      misc:          '₹150–400/day',
      total:         '₹1,100–4,400/day'
    },
    visitHours: 'Ghats accessible 24 hours; Sarnath museums and temples 9 AM – 5 PM; evening aarti around 6:30–7 PM.'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AGRA
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Heritage',
    rating: '4.8',
    season: 'October – March',
    time: 'Sunrise for Taj Mahal; early morning recommended',
    duration: '1–2 days',
    budget: '₹1,200–3,000/day',
    tagline: 'Home of the Taj Mahal and Mughal splendour',
    desc: "Visit one of the world's most iconic monuments, explore Mughal forts, wander marble-crafts bazaars, and taste the city's famous sweets.",
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Taj_Mahal_2012.jpg/1280px-Taj_Mahal_2012.jpg',
    photoSource: 'https://commons.wikimedia.org/wiki/File:Taj_Mahal_2012.jpg',
    lat: 27.1767,
    lng: 78.0081,
    attractions: [
      ['Taj Mahal',      'UNESCO World Heritage white marble mausoleum',                    '', '6 AM – 6:30 PM (closed Fri)', 'Taj Mahal'],
      ['Agra Fort',      'Massive Mughal fortification with palaces and pavilions',         '', '6 AM – 6 PM', 'Agra Fort'],
      ['Fatehpur Sikri', 'Abandoned Mughal capital city — 40 km from Agra',                 '', '9 AM – 5 PM', 'Fatehpur Sikri'],
      ['Mehtab Bagh',    'Garden complex with stunning moonlit views of the Taj Mahal',    '', '6 AM – 6 PM', 'Mehtab Bagh']
    ],
    foods: [
      { name: 'Petha',          type: 'Dessert',     price: '₹50–200',  desc: "Translucent white sweet made from ash gourd — Agra's most famous souvenir food.", img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bedai & Sabzi',  type: 'Street food', price: '₹40–100',  desc: 'Crispy fried bread with spiced potato curry — the classic Agra morning breakfast.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
      { name: 'Mughlai Biryani',type: 'Traditional', price: '₹200–500', desc: 'Fragrant long-grain rice with marinated meat — influenced by Mughal royal kitchens.', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
      { name: 'Jalebi',         type: 'Dessert',     price: '₹30–80',   desc: 'Hot, syrup-soaked spiral sweets — best eaten fresh off the kadai on a cold morning.', img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Petha, bedai-sabzi, mughlai biryani, jalebi',
    stayArea: 'Taj Ganj area for proximity to the Taj Mahal; Sadar Bazaar for better transport links',
    safetyTips: [
      'Book Taj Mahal entry tickets online in advance to avoid long queues.',
      'Use only official entrances; beware of touts directing you to "guides" or alternate gates.',
      'Carry minimal metal items — security checks at the Taj are thorough.',
      'The Taj is closed on Fridays; plan your visit on any other day of the week.'
    ],
    expenses: {
      accommodation: '₹700–3,500/day',
      food:          '₹250–700/day',
      transport:     '₹200–500/day',
      misc:          '₹200–500/day',
      total:         '₹1,350–5,200/day'
    },
    visitHours: 'Taj Mahal 6 AM – 6:30 PM (closed Fridays); Agra Fort 6 AM – 6 PM; Fatehpur Sikri 9 AM – 5 PM.'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MUMBAI
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    category: 'Heritage',
    rating: '4.6',
    season: 'November – February',
    time: 'Evening for Marine Drive; morning for heritage walks',
    duration: '2–3 days',
    budget: '₹2,000–5,000/day',
    tagline: 'The city that never sleeps',
    desc: "Experience the energy of India's financial capital — art deco buildings, colonial heritage, coastal promenades, Bollywood culture, and street food at every corner.",
    img: 'https://s7ap1.scene7.com/is/image/incredibleindia/gateway-of-india-mumbai-maharashtra-2-attr-hero?qlt=82&ts=1727355556744',
    photoSource: 'https://www.incredibleindia.gov.in/en/maharashtra/mumbai/the-gateway-of-india',
    lat: 19.0760,
    lng: 72.8777,
    attractions: [
      ['Gateway of India',  'Iconic harbour arch monument and tourist landmark',            '', 'Open all day', 'Gateway of India'],
      ['Marine Drive',      "Scenic coastal promenade known as the Queen's Necklace",      '', 'Open all day', 'Marine Drive, Mumbai'],
      ['Elephanta Caves',   'UNESCO-listed cave temples on an island in the harbour',       '', '9 AM – 5:30 PM (closed Mon)', 'Elephanta Caves'],
      ['Dharavi',           "One of Asia's largest urban communities; guided tours available", '', '9 AM – 6 PM', 'Dharavi']
    ],
    foods: [
      { name: 'Vada Pav',  type: 'Street food', price: '₹15–40',  desc: "Mumbai's beloved potato fritter in a bread roll — the city's unofficial fast food.", img: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=600&q=80' },
      { name: 'Pav Bhaji', type: 'Street food', price: '₹80–180', desc: 'Spiced mixed vegetable mash served with buttered bread rolls — a Marine Drive staple.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bombil Fry',type: 'Seafood',     price: '₹150–350',desc: 'Crispy fried Bombay duck (a fish) — a beloved coastal Mumbai delicacy.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bhel Puri', type: 'Street food', price: '₹30–80',  desc: 'Puffed rice, sev, and tamarind chutney tossed together — best eaten at Chowpatty Beach.', img: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=600&q=80' }
    ],
    food: 'Vada pav, pav bhaji, bombil fry, bhel puri',
    stayArea: 'Colaba and Fort area for heritage sights; Bandra or Andheri for nightlife and airport access',
    safetyTips: [
      'Use the Mumbai suburban railway (local trains) for fast, affordable commutes — keep bags secure during rush hours.',
      'Stick to licensed tourist boats for Elephanta Caves ferry crossings.',
      'Keep emergency numbers for the local police and your hotel reception handy.',
      'Monsoon (June–September) can cause significant flooding — check weather advisories before travel.'
    ],
    expenses: {
      accommodation: '₹1,200–6,000/day',
      food:          '₹400–1,500/day',
      transport:     '₹150–600/day',
      misc:          '₹300–800/day',
      total:         '₹2,050–8,900/day'
    },
    visitHours: 'Gateway of India and Marine Drive accessible all day; Elephanta Caves 9 AM – 5:30 PM (closed Mondays).'
  }
];

// ---------------------------------------------------------------------------
// STAYS — real properties with provider pages and property-specific photos
// ---------------------------------------------------------------------------
const STAYS = [
  { city:'Jaipur', name:'Zostel Jaipur', type:'Hostel', area:'Chandi ki Taksal, near Hawa Mahal', address:'First Floor, 85-A, Rajamal Ka Talab, Chandi ki Taksal, Jaipur 302002', url:'https://www.zostel.com/destination/jaipur/stay/jaipur-jprh038', img:'https://r1imghtlak.mmtcdn.com/453a6ed6b69f11e8b02f0204e80e7934.jpg' },
  { city:'Manali', name:'Zostel Old Manali', type:'Hostel', area:'Old Manali, near Manu Temple Road', address:'Manu Temple Road, Old Manali, Manali, Himachal Pradesh 175131', url:'https://www.zostel.com/destination/old-manali/stay/manali-mnlh056', img:'https://img.cdn.zostel.com/cache/_8060a55d13923f98994f685361e03f4e/ZostelManali_Exterior_01_1000x800.jpg' },
  { city:'Nashik', name:'Raahgir Backpackers Hostel', type:'Hostel', area:'Central Nashik', address:'Raahgir Backpackers Hostel, Nashik, Maharashtra', url:'https://www.raahgirhostel.com/', img:'https://assets.zyrosite.com/cdn-cgi/image/format%3Dauto%2Cw%3D1920%2Cfit%3Dcrop/mePJZa86JwT5MNNY/img20250227144141-AoPJBjqvwRuzLKED.jpg' },
  { city:'Goa', name:'Home of Gaia', type:'Hostel', area:'Morjim, North Goa', address:'Survey no 107/2K, near Vidya Prasarak High School, Morjim, Goa 403512', url:'https://www.gaiahostels.com/', img:'https://gaiahostels.com/public/community-home-of-gaia-morjim-goa.jpg' },
  { city:'Delhi', name:'Zostel Delhi', type:'Hostel', area:'Paharganj, opposite New Delhi Railway Station', address:'5, Arakashan Road, opposite New Delhi Railway Station, New Delhi 110005', url:'https://old.zostel.com/zostel/delhi/', img:'https://img.cdn.zostel.com/cache/_4cc338f66fa93d8dbab57d6661d5c282/6_Bed_Mixed_Dorm_10_1000x800.jpg' },
  { city:'Varanasi', name:'Mosaic Hostel', type:'Hostel', area:'Assi Ghat Road, Anandbagh', address:'B1/85C, Assi Ghat Road, Anandbagh, Varanasi 221005', url:'https://www.mosaichostels.com/', img:'https://images.trvl-media.com/lodging/126000000/125060000/125053800/125053779/aea13350.jpg?impolicy=resizecrop&ra=fill&rh=575&rw=575' },
  { city:'Agra', name:'Bedweiser Backpackers Hostel', type:'Hostel', area:'Taj Nagari Phase 1, near Shilpgram', address:'M-i-G-57, near Shilpgram, Taj Nagari Phase 1, Tajganj, Agra 282001', url:'https://bedweiser.com/', img:'https://bedweiser.com/img/2ec58ea6d6c31bc7.webp' },
  { city:'Mumbai', name:'Abode Bombay', type:'Hotel', area:'Colaba, near Gateway of India', address:'First Floor, Lansdowne House, M.B. Marg, Apollo Bunder, Colaba, Mumbai 400001', url:'https://www.abodeboutiquehotels.com/', img:'https://assets.cntraveller.in/photos/60b9fdbd689bf55e0664e5ef/16%3A9/w_1024%2Cc_limit/abode-800px.jpg' }
];

// ---------------------------------------------------------------------------
// FOODS — global illustrative sample dishes (shown when "All destinations" is selected)
// ---------------------------------------------------------------------------
const FOODS = [
  { name: 'Dal Baati Churma', type: 'Traditional', price: '₹150–350', desc: 'A hearty Rajasthani trilogy of lentil curry, baked wheat balls, and sweet crushed grain.', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pyaaz Kachori',    type: 'Street food', price: '₹25–70',   desc: 'Crispy, deep-fried pastry stuffed with a spiced onion filling — a beloved Jaipur street snack.', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { name: 'Lassi',            type: 'Vegetarian',  price: '₹40–100',  desc: 'A thick, chilled yoghurt drink served sweet or salted — an ideal refresher after sightseeing.', img: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80' },
  { name: 'Ghewar',           type: 'Dessert',     price: '₹100–300', desc: 'A honeycomb-textured disc soaked in sugar syrup and topped with malai or rabri.', img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Goan Fish Curry',  type: 'Seafood',     price: '₹180–450', desc: 'Tangy coconut-based fish curry with steamed rice — the definitive Goan meal.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
  { name: 'Street Chaat',     type: 'Street food', price: '₹40–120',  desc: 'A tangy, sweet, and spicy medley of crispy wafers, chickpeas, yoghurt, and chutneys.', img: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=600&q=80' },
  { name: 'Biryani',          type: 'Traditional', price: '₹180–450', desc: 'Fragrant basmati rice layered with spiced meat or vegetables — a pan-Indian celebration dish.', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Seasonal Sweet',   type: 'Dessert',     price: '₹60–180',  desc: 'Every region and season brings its own sweet specialty — ask locals what is freshest right now.', img: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' }
];

// Local food neighbourhoods: use Google Maps for current venues, routes, and hours.
const FOOD_AREAS = [
  { city:'Jaipur', name:'Masala Chowk', area:'Ram Niwas Garden', dishes:'Pyaaz kachori, chaat, kulhad lassi', budget:'₹100–300 per person' },
  { city:'Manali', name:'Old Manali & Mall Road', area:'Manali town', dishes:'Siddu, trout, thukpa', budget:'₹150–450 per person' },
  { city:'Nashik', name:'Saraf Bazaar & College Road', area:'Central Nashik', dishes:'Misal pav, sabudana khichdi, vada pav', budget:'₹80–300 per person' },
  { city:'Goa', name:'Mapusa Market & Panaji', area:'North Goa / Panaji', dishes:'Goan fish curry, xacuti, bebinca', budget:'₹150–500 per person' },
  { city:'Delhi', name:'Chandni Chowk & Jama Masjid', area:'Old Delhi', dishes:'Parathas, chaat, jalebi, kebabs', budget:'₹80–350 per person' },
  { city:'Varanasi', name:'Kachori Gali & Godowlia', area:'Old Varanasi', dishes:'Kachori sabzi, tamatar chaat, lassi', budget:'₹60–250 per person' },
  { city:'Agra', name:'Sadar Bazaar', area:'Agra Cantt', dishes:'Bedai sabzi, petha, Mughlai dishes', budget:'₹80–400 per person' },
  { city:'Mumbai', name:'Mohammed Ali Road & Crawford Market', area:'South Mumbai', dishes:'Vada pav, pav bhaji, bhel puri, kebabs', budget:'₹60–400 per person' }
];

// ---------------------------------------------------------------------------
// PLANS — day-by-day itinerary templates per destination
// ---------------------------------------------------------------------------
const PLANS = {
  Jaipur: [
    ['8:00 AM',  'Hawa Mahal',      'Start early for photos and cooler weather.'],
    ['10:00 AM', 'City Palace',     'Explore the courtyards and museum.'],
    ['12:30 PM', 'Lunch break',     'Try a local thali or a vegetarian Rajasthani meal.'],
    ['2:00 PM',  'Jantar Mantar',   'Visit the historic astronomical instruments.'],
    ['4:00 PM',  'Local market',    'Browse crafts and textiles; agree prices before buying.'],
    ['6:00 PM',  'Sunset / dinner', 'Choose a nearby viewpoint or relaxed dinner spot.']
  ],
  Manali: [
    ['8:00 AM',  'Hadimba Temple', 'Visit the cedar forest area in the morning.'],
    ['10:30 AM', 'Old Manali',     'Walk the lanes and explore cafes.'],
    ['1:00 PM',  'Lunch break',    'Try a local Himachali meal.'],
    ['3:00 PM',  'Vashisht',       'Explore the village; check local access and timings.'],
    ['5:00 PM',  'Riverside walk', 'Keep outdoor plans weather-dependent.']
  ],
  Nashik: [
    ['7:30 AM',  'Ramkund',               'Start with a quiet riverfront visit.'],
    ['9:30 AM',  'Local breakfast',       'Try misal pav or another local favourite.'],
    ['11:00 AM', 'Pandav Leni',           'Allow time for steps and the outdoor setting.'],
    ['1:30 PM',  'Lunch break',           'Choose a nearby restaurant.'],
    ['3:30 PM',  'Local city exploration','Adjust for travel time and opening hours.']
  ],
  Goa: [
    ['8:00 AM',  'Beach walk',    'Enjoy the coast before the midday heat.'],
    ['10:30 AM', 'Heritage area', 'Explore a historic quarter or fort.'],
    ['1:00 PM',  'Lunch break',   'Try Goan cuisine or a vegetarian meal.'],
    ['3:30 PM',  'Beach time',    'Choose a beach near your stay to reduce travel.'],
    ['5:30 PM',  'Sunset',        'Check local conditions and transport options.']
  ],
  Delhi: [
    ['8:00 AM',  "Humayun's Tomb", 'Start with a major heritage site.'],
    ['10:30 AM', 'India Gate area', 'Explore nearby landmarks.'],
    ['1:00 PM',  'Lunch break',     'Choose a local restaurant or food market.'],
    ['3:00 PM',  'Qutub Minar',     'Check entry hours and travel time.'],
    ['5:30 PM',  'Market stroll',   'Finish near a convenient Metro route.']
  ],
  Varanasi: [
    ['5:30 AM',  'Sunrise at the ghats', 'Keep a respectful distance from ceremonies.'],
    ['8:00 AM',  'Breakfast',            'Try a local breakfast spot.'],
    ['10:00 AM', 'Old City lanes',       'Explore with care in crowded lanes.'],
    ['1:00 PM',  'Lunch break',          'Try a local meal.'],
    ['5:30 PM',  'Evening aarti area',   'Check current timing and crowd guidance.']
  ],
  Agra: [
    ['6:00 AM',  'Taj Mahal at sunrise', 'Arrive at opening time for the golden-hour light and smaller crowds.'],
    ['9:30 AM',  'Breakfast',            'Try bedai-sabzi at a popular local eatery near Sadar Bazaar.'],
    ['11:00 AM', 'Agra Fort',            'Explore the massive Mughal fort; allow 90–120 minutes.'],
    ['1:30 PM',  'Lunch break',          'Try mughlai cuisine or a regional thali nearby.'],
    ['3:30 PM',  'Mehtab Bagh',          'Walk through the garden for a clear view across to the Taj.'],
    ['5:30 PM',  'Petha shopping',       "Pick up the city's famous white pumpkin sweet as a souvenir."]
  ],
  Mumbai: [
    ['8:00 AM',  'Heritage walk — Fort area', 'Explore Victorian Gothic and art deco buildings around CST and Oval Maidan.'],
    ['10:30 AM', 'Gateway of India',          'Visit the iconic arch on the harbour front.'],
    ['12:00 PM', 'Ferry to Elephanta Caves',  'Book a licensed ferry; the crossing takes about an hour.'],
    ['2:30 PM',  'Lunch break',               'Try vada pav or pav bhaji at a local stall or restaurant.'],
    ['4:30 PM',  'Marine Drive walk',         'Stroll the promenade as the sun begins to set.'],
    ['7:00 PM',  'Dinner in Bandra or Colaba','Explore a neighbourhood restaurant or street food market.']
  ]
};

// ---------------------------------------------------------------------------
// JAIPUR_STOPS — schematic offline map waypoints (used by initMap() in script.js)
// ---------------------------------------------------------------------------
const JAIPUR_STOPS = [
  ['Hawa Mahal',        26.9239, 75.8267, 'Start with the iconic facade'],
  ['City Palace',       26.9258, 75.8237, 'Explore royal courtyards'],
  ['Jantar Mantar',     26.9248, 75.8246, 'Historic astronomical site'],
  ['Albert Hall Museum',26.9117, 75.8197, 'Museum and architecture'],
  ['Birla Mandir',      26.8925, 75.8150, 'White marble temple'],
  ['Amber Fort',        26.9855, 75.8513, 'Hilltop fort; allow extra travel time']
];
