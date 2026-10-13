/**
 * Destination Manifest & Photography Library
 * Authoritative destination data with local optimized assets and fallback resolution
 */

export interface DestinationRecord {
  id: string;
  name: string;
  country: string;
  aliases: string[];
  imagePath: string;
  altText: string;
  tagline: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  featuredAirport?: string;
  prominentLandmarks: string[];
}

export const FALLBACK_DESTINATION_IMAGE = '/images/destinations/fallback.jpg';

export const DESTINATION_CATALOG: DestinationRecord[] = [
  {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    aliases: ['goa', 'goa airport', 'dabolim', 'mopa', 'north goa', 'south goa'],
    imagePath: '/images/destinations/goa.jpg',
    altText: 'Tropical palm-fringed sandy beach in Goa with turquoise ocean waters',
    tagline: 'Tropical Paradise',
    description: 'Sun-kissed Arabian Sea beaches, vibrant coastal nightlife, and Portuguese colonial architecture.',
    coordinates: { lat: 15.2993, lng: 74.124 },
    featuredAirport: 'GOI',
    prominentLandmarks: ['Calangute Beach', 'Fort Aguada', 'Basilica of Bom Jesus'],
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    aliases: ['paris', 'cdg', 'orly', 'city of lights', 'paris, france'],
    imagePath: '/images/destinations/paris.jpg',
    altText: 'Eiffel Tower rising above the Seine river and Parisian architectural boulevards',
    tagline: 'City of Lights',
    description: 'Iconic art museums, haute cuisine, romantic Seine riverbanks, and timeless architecture.',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    featuredAirport: 'CDG',
    prominentLandmarks: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    aliases: ['tokyo', 'haneda', 'narita', 'tokyo, japan'],
    imagePath: '/images/destinations/tokyo.jpg',
    altText: 'Illuminated neon Tokyo skyline with bustling Shibuya crossing and Tokyo Tower',
    tagline: 'Neon Wonderland',
    description: 'Futuristic skyscrapers meet historic Edo temples, culinary perfection, and high-speed transit.',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    featuredAirport: 'HND',
    prominentLandmarks: ['Shibuya Crossing', 'Sensō-ji Temple', 'Tokyo Skytree'],
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    aliases: ['dubai', 'dxb', 'uae', 'dubai, uae'],
    imagePath: '/images/destinations/dubai.jpg',
    altText: 'Burj Khalifa gleaming over Downtown Dubai fountains and futuristic architectural towers',
    tagline: 'Desert Luxury',
    description: 'World-record architectural marvels, ultra-luxury shopping, desert safaris, and pristine marinas.',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    featuredAirport: 'DXB',
    prominentLandmarks: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Marina'],
  },
  {
    id: 'kerala',
    name: 'Kerala',
    country: 'India',
    aliases: ['kerala', 'alleppey', 'alappuzha', 'gods own country', 'munnar', 'wayanad'],
    imagePath: '/images/destinations/kerala.jpg',
    altText: 'Traditional houseboat gently cruising serene emerald green Kerala backwaters',
    tagline: 'Gods Own Country',
    description: 'Tranquil palm-fringed lagoons, emerald tea plantations, and ayurvedic wellness retreats.',
    coordinates: { lat: 9.9312, lng: 76.2673 },
    featuredAirport: 'COK',
    prominentLandmarks: ['Alleppey Backwaters', 'Munnar Tea Hills', 'Varkala Cliff'],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    country: 'India',
    aliases: ['jaipur', 'pink city', 'jai', 'rajasthan'],
    imagePath: '/images/destinations/jaipur.jpg',
    altText: 'Hawa Mahal Palace of Winds with ornate pink sandstone honeycomb architecture',
    tagline: 'The Pink City',
    description: 'Majestic Rajput fortresses, jewel-toned palaces, royal heritage, and bustling artisan bazaars.',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    featuredAirport: 'JAI',
    prominentLandmarks: ['Hawa Mahal', 'Amber Fort', 'City Palace'],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    aliases: ['hyderabad', 'hyd', 'secunderabad', 'hitec city', 'cyberabad'],
    imagePath: '/images/destinations/hyderabad.jpg',
    altText: 'Historic Charminar monument with grand four arches glowing at twilight',
    tagline: 'City of Pearls',
    description: 'Rich Nizami heritage, legendary biryani traditions, Falaknuma palace, and dynamic IT corridors.',
    coordinates: { lat: 17.385, lng: 78.4867 },
    featuredAirport: 'HYD',
    prominentLandmarks: ['Charminar', 'Golconda Fort', 'Falaknuma Palace'],
  },
  {
    id: 'manali',
    name: 'Manali',
    country: 'India',
    aliases: ['manali', 'kullu', 'kullu manali', 'himachal'],
    imagePath: '/images/destinations/manali.jpg',
    altText: 'Snow-capped peaks of the Pir Panjal range overlooking Manali alpine pine valleys',
    tagline: 'Himalayan Adventure',
    description: 'Crisp alpine air, snow-capped Himalayan panoramas, Rohtang Pass excursions, and mountain trails.',
    coordinates: { lat: 32.2432, lng: 77.1892 },
    featuredAirport: 'KUU',
    prominentLandmarks: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple'],
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    aliases: ['bali', 'denpasar', 'dps', 'ubud', 'seminyak', 'kuta', 'bali, indonesia'],
    imagePath: '/images/destinations/bali.jpg',
    altText: 'Water temple Ulun Danu Beratan mirrored on calm mountain lake in Bali',
    tagline: 'Island of the Gods',
    description: 'Spiritual cliffside temples, terraced emerald rice paddies, world-class surf breaks, and coral reefs.',
    coordinates: { lat: -8.4095, lng: 115.1889 },
    featuredAirport: 'DPS',
    prominentLandmarks: ['Tanah Lot Temple', 'Ubud Monkey Forest', 'Mount Batur'],
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    country: 'Switzerland',
    aliases: ['switzerland', 'swiss', 'zurich', 'geneva', 'interlaken', 'lucerne'],
    imagePath: '/images/destinations/switzerland.jpg',
    altText: 'Pristine Swiss Alpine peaks reflecting into a crystal-clear turquoise mountain lake',
    tagline: 'Alpine Majesty',
    description: 'Breathtaking alpine vistas, world-famous scenic railways, pristine glacier lakes, and Swiss luxury.',
    coordinates: { lat: 46.8182, lng: 8.2275 },
    featuredAirport: 'ZRH',
    prominentLandmarks: ['Matterhorn', 'Lake Geneva', 'Jungfraujoch'],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    aliases: ['delhi', 'new delhi', 'del', 'ncr', 'indiragandhi'],
    imagePath: '/images/destinations/delhi.jpg',
    altText: 'India Gate war memorial triumphal arch standing proud in New Delhi boulevard',
    tagline: 'Historic Capital',
    description: 'Epic political and cultural crossroads featuring Mughal monuments, tree-lined avenues, and spice markets.',
    coordinates: { lat: 28.6139, lng: 77.209 },
    featuredAirport: 'DEL',
    prominentLandmarks: ['India Gate', 'Qutub Minar', 'Red Fort'],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    aliases: ['mumbai', 'bombay', 'bom', 'mumbai city'],
    imagePath: '/images/destinations/mumbai.jpg',
    altText: 'Majestic Gateway of India and historic Taj Mahal Palace hotel on Mumbai harbor',
    tagline: 'City of Dreams',
    description: 'Vibrant financial capital with Marine Drive Queen’s Necklace, heritage Gothic architecture, and Bollywood pulse.',
    coordinates: { lat: 19.076, lng: 72.8777 },
    featuredAirport: 'BOM',
    prominentLandmarks: ['Gateway of India', 'Marine Drive', 'Bandra-Worli Sea Link'],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    aliases: ['bengaluru', 'bangalore', 'blr', 'silicon valley of india'],
    imagePath: '/images/destinations/bengaluru.jpg',
    altText: 'Neo-Dravidian architecture of Vidhana Soudha illuminated against twilight sky in Bengaluru',
    tagline: 'Garden City & Tech Hub',
    description: 'Lush botanical gardens, renowned craft breweries, and India’s dynamic technological epicenter.',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    featuredAirport: 'BLR',
    prominentLandmarks: ['Vidhana Soudha', 'Lalbagh Botanical Garden', 'Bangalore Palace'],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    country: 'India',
    aliases: ['chennai', 'madras', 'maa', 'tamil nadu'],
    imagePath: '/images/destinations/chennai.jpg',
    altText: 'Colourful sculpted gopuram tower of Kapaleeshwarar Temple in Chennai',
    tagline: 'Gateway to South India',
    description: 'Rich classical Carnatic music traditions, Dravidian temple towers, Marina Beach, and silk weaving.',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    featuredAirport: 'MAA',
    prominentLandmarks: ['Marina Beach', 'Kapaleeshwarar Temple', 'San Thome Basilica'],
  },
  {
    id: 'kochi',
    name: 'Kochi',
    country: 'India',
    aliases: ['kochi', 'cochin', 'cok', 'fort kochi'],
    imagePath: '/images/destinations/kochi.jpg',
    altText: 'Iconic cantilevered Chinese Fishing Nets silhouetted against Arabian Sea sunset in Fort Kochi',
    tagline: 'Queen of the Arabian Sea',
    description: 'Historic spice trading port blending Portuguese, Dutch, British colonial history with serene backwaters.',
    coordinates: { lat: 9.9312, lng: 76.2673 },
    featuredAirport: 'COK',
    prominentLandmarks: ['Chinese Fishing Nets', 'Fort Kochi', 'Mattancherry Palace'],
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    country: 'India',
    aliases: ['visakhapatnam', 'vizag', 'vtg', 'vizag beach'],
    imagePath: '/images/destinations/visakhapatnam.jpg',
    altText: 'Scenic coastline with blue Bay of Bengal waves crashing on Visakhapatnam hills',
    tagline: 'The Jewel of the East Coast',
    description: 'Dramatic coastal landscape where Eastern Ghats meet the Bay of Bengal, with scenic beaches and maritime history.',
    coordinates: { lat: 17.6868, lng: 83.2185 },
    featuredAirport: 'VTZ',
    prominentLandmarks: ['RK Beach', 'Kailasagiri Hill', 'Submarine Museum'],
  },
  {
    id: 'vijayawada',
    name: 'Vijayawada',
    country: 'India',
    aliases: ['vijayawada', 'vga', 'bezawada'],
    imagePath: '/images/destinations/vijayawada.jpg',
    altText: 'Panoramic view of Krishna River with Prakasam Barrage and Kanaka Durga Temple hill',
    tagline: 'The Place of Victory',
    description: 'Dynamic cultural and trade center along the sacred Krishna River, renowned for Kanaka Durga Temple and rock-cut caves.',
    coordinates: { lat: 16.5062, lng: 80.648 },
    featuredAirport: 'VGA',
    prominentLandmarks: ['Kanaka Durga Temple', 'Prakasam Barrage', 'Undavalli Caves'],
  },
  {
    id: 'tirupati',
    name: 'Tirupati',
    country: 'India',
    aliases: ['tirupati', 'tirumala', 'tpt', 'venkateswara'],
    imagePath: '/images/destinations/tirupati.jpg',
    altText: 'Sacred Seven Hills of Tirumala with gilded temple gopuram illuminated at sunset',
    tagline: 'Spiritual Abode',
    description: 'World-renowned sacred pilgrimage destination nestled among the picturesque Seshachalam Hills.',
    coordinates: { lat: 13.6288, lng: 79.4192 },
    featuredAirport: 'TIR',
    prominentLandmarks: ['Tirumala Venkateswara Temple', 'Silathoranam', 'Kapila Theertham'],
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    aliases: ['singapore', 'sin', 'changi', 'lion city'],
    imagePath: '/images/destinations/singapore.jpg',
    altText: 'Marina Bay Sands infinity tower and futuristic Supertree Grove glowing in Singapore',
    tagline: 'The Lion City',
    description: 'Futuristic green city-state famed for Gardens by the Bay, hawker delicacies, and world-class hospitality.',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    featuredAirport: 'SIN',
    prominentLandmarks: ['Marina Bay Sands', 'Gardens by the Bay', 'Jewel Changi'],
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    aliases: ['london', 'lhr', 'lgw', 'london, uk', 'westminster'],
    imagePath: '/images/destinations/london.jpg',
    altText: 'Big Ben clock tower and Houses of Parliament across River Thames in London',
    tagline: 'The Royal Metropolis',
    description: 'Global cultural epicenter rich with royal history, West End theatre, world-class museums, and Thames landmarks.',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    featuredAirport: 'LHR',
    prominentLandmarks: ['Big Ben', 'Tower Bridge', 'Buckingham Palace'],
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    aliases: ['new york', 'new york city', 'nyc', 'jfk', 'lga', 'manhattan'],
    imagePath: '/images/destinations/new-york.jpg',
    altText: 'Manhattan skyline with Empire State Building bathed in golden hour twilight',
    tagline: 'The Empire City',
    description: 'The city that never sleeps, featuring Broadway, Central Park, world-class arts, and iconic skyline vistas.',
    coordinates: { lat: 40.7128, lng: -74.006 },
    featuredAirport: 'JFK',
    prominentLandmarks: ['Statue of Liberty', 'Central Park', 'Times Square'],
  },
];

/**
 * Normalizes query string to match against destination catalog
 */
function normalizeQuery(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Look up destination details and photography by city, country, or alias.
 * Returns authoritative image with guaranteed graceful fallback.
 */
export function getDestination(query?: string | null): DestinationRecord {
  if (!query || typeof query !== 'string') {
    return {
      id: 'default',
      name: 'Global Destinations',
      country: 'World',
      aliases: [],
      imagePath: FALLBACK_DESTINATION_IMAGE,
      altText: 'World travel airplane cruising above clouds at golden hour sunset',
      tagline: 'Wanderlust Awaits',
      description: 'Explore curated travel options across the globe with our premium booking platform.',
      coordinates: { lat: 20, lng: 0 },
      prominentLandmarks: [],
    };
  }

  const clean = normalizeQuery(query);

  // 1. Direct ID match
  const byId = DESTINATION_CATALOG.find((d) => d.id === clean);
  if (byId) return byId;

  // 2. Direct name match
  const byName = DESTINATION_CATALOG.find(
    (d) => normalizeQuery(d.name) === clean
  );
  if (byName) return byName;

  // 3. Alias match
  const byAlias = DESTINATION_CATALOG.find((d) =>
    d.aliases.some((alias) => normalizeQuery(alias) === clean || clean.includes(normalizeQuery(alias)))
  );
  if (byAlias) return byAlias;

  // 4. Substring / partial match
  const bySubstring = DESTINATION_CATALOG.find((d) =>
    clean.includes(d.id) || clean.includes(normalizeQuery(d.name))
  );
  if (bySubstring) return bySubstring;

  // 5. Default fallback record with dynamic display name
  return {
    id: clean.replace(/\s+/g, '-'),
    name: query,
    country: 'International',
    aliases: [clean],
    imagePath: FALLBACK_DESTINATION_IMAGE,
    altText: `Scenic view representing ${query} travel destination`,
    tagline: 'Discover Your Journey',
    description: `Experience the unique attractions and hospitality of ${query}.`,
    coordinates: { lat: 20, lng: 0 },
    prominentLandmarks: [],
  };
}

/**
 * Returns image path for any destination name with guaranteed existence
 */
export function getDestinationImageUrl(query?: string | null): string {
  const dest = getDestination(query);
  return dest.imagePath;
}

/**
 * Returns alt text for accessibility and SEO
 */
export function getDestinationAltText(query?: string | null): string {
  const dest = getDestination(query);
  return dest.altText;
}

export default DESTINATION_CATALOG;
