// Language-independent page data. Copy for each language lives in ja.js / en.js
// and is matched to these entries by index.

export const REWARDS = [
  { price: 3000, left: 40, image: '/assets/reward-3000.png', itemId: '155698632' },
  { price: 5000, left: 30, image: '/assets/reward-5000.png', itemId: '155699333' },
  { price: 6000, left: 80, image: '/assets/reward-6000.png', itemId: '155699770' },
  { price: 12000, left: 30, image: '/assets/reward-12000.png', itemId: '155699896' },
  { price: 15000, left: 15, image: '/assets/reward-15000.png', itemId: '155700597' },
  { price: 20000, left: 15, image: '/assets/reward-20000.png', itemId: '155702192' },
  { price: 22000, left: 5, image: '/assets/reward-22000.png', itemId: '155701267' },
  { price: 25000, left: 12, image: '/assets/reward-25000.png', itemId: '155702722' },
  { price: 40000, left: 8, image: '/assets/reward-40000.png', itemId: '155702823' },
  { price: 80000, left: 3, image: '/assets/reward-80000.png', itemId: '155702966' },
  { price: 100000, left: 2, image: '/assets/reward-100000.png', itemId: '155703259' },
  { price: 300000, left: 1, image: '/assets/reward-300000.png', itemId: '155703648' },
  { price: 380000, left: 1, image: '/assets/reward-380000.png', itemId: '155705721' },
];

export const itemUrl = (itemId) => `https://www.yagiribrewery.com/items/${itemId}`;

export const FEATURED_IMAGES = [
  '/assets/reward-6000.png',
  '/assets/reward-20000.png',
  '/assets/reward-25000.png',
  '/assets/reward-15000.png',
];

export const HERO_SLIDES = [
  '/assets/shop_entrance.webp',
  '/assets/slide_flooded_kegs.webp',
  '/assets/damage_tanks.webp',
  '/assets/slide_mud_floor.webp',
  '/assets/slide_flood_waterline.webp',
  '/assets/slide_damaged_coldroom.webp',
  '/assets/damage_floor.webp',
  '/assets/damage_kegs.webp',
  '/assets/taproom-bar.webp',
  '/assets/patrons_cheer.webp',
];

export const TAPROOM_IMAGES = [
  '/assets/taproom-exterior.webp',
  '/assets/taproom-counter.webp',
  '/assets/taproom-bar.webp',
  '/assets/taproom-seats.webp',
  '/assets/taproom-jukebox.webp',
  '/assets/taproom-terrace.webp',
];

export const DAMAGE_DOC_IMAGES = [
  '/assets/flooded-kegs.webp',
  '/assets/flood-waterline.webp',
  '/assets/damaged-cold-room.webp',
];

export const OFFICIAL_URL = 'https://www.yagiribrewery.com/';
export const LAW_URL = 'https://www.yagiribrewery.com/law';
export const TARGET_AMOUNT = 1_000_000;
