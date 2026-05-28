export interface BiharLocation {
  name: string;
  city: 'Samastipur' | 'Patna' | 'Darbhanga' | 'Muzaffarpur' | 'Begusarai' | 'Gaya' | 'Hajipur';
  lat: number;
  lng: number;
  desc: string;
  keywords: string[];
}

export const BIHAR_LOCATIONS: BiharLocation[] = [
  // --- Samastipur ---
  {
    name: "Samastipur Junction",
    city: "Samastipur",
    lat: 25.8624,
    lng: 85.7831,
    desc: "Main railway gateway in Samastipur",
    keywords: ["samastipur junction", "samastipur station", "railway station"]
  },
  {
    name: "Kashipur",
    city: "Samastipur",
    lat: 25.8694,
    lng: 85.7801,
    desc: "Key commercial and educational hub in Samastipur",
    keywords: ["kashipur", "kashipur samastipur"]
  },
  {
    name: "Musapur",
    city: "Samastipur",
    lat: 25.8560,
    lng: 85.7950,
    desc: "Residential & local business zone in Samastipur",
    keywords: ["musapur", "musapur chowk"]
  },
  {
    name: "Bahadurpur",
    city: "Samastipur",
    lat: 25.8540,
    lng: 85.7720,
    desc: "Popular locality in Samastipur",
    keywords: ["bahadurpur", "bahadurpur area"]
  },
  {
    name: "Mohanpur Road",
    city: "Samastipur",
    lat: 25.8670,
    lng: 85.7910,
    desc: "Major transit highway corridor in Samastipur",
    keywords: ["mohanpur", "mohanpur road"]
  },
  {
    name: "Patel Maidan",
    city: "Samastipur",
    lat: 25.8640,
    lng: 85.7850,
    desc: "Central landmark sports ground and public square",
    keywords: ["patel maidan", "patel maidan ground"]
  },
  {
    name: "College Gate",
    city: "Samastipur",
    lat: 25.8645,
    lng: 85.7770,
    desc: "Samastipur College campus point",
    keywords: ["college gate", "samastipur college"]
  },
  {
    name: "Mathurapur",
    city: "Samastipur",
    lat: 25.8750,
    lng: 85.8020,
    desc: "Developing business corridor north of Samastipur",
    keywords: ["mathurapur", "mathurapur ghat"]
  },
  {
    name: "Tajpur Road",
    city: "Samastipur",
    lat: 25.8590,
    lng: 85.7600,
    desc: "Key connecting highway road to NH28",
    keywords: ["tajpur road", "tajpur chowk"]
  },
  {
    name: "Station Chowk",
    city: "Samastipur",
    lat: 25.8630,
    lng: 85.7810,
    desc: "Bustling central junction at the station entry",
    keywords: ["station chowk", "samastipur station chowk"]
  },

  // --- Patna ---
  {
    name: "Gandhi Maidan",
    city: "Patna",
    lat: 25.6174,
    lng: 85.1432,
    desc: "Historic central public square in Patna",
    keywords: ["gandhi maidan", "gandhi maidan park", "patna gandhi maidan"]
  },
  {
    name: "Patna Junction",
    city: "Patna",
    lat: 25.6024,
    lng: 85.1376,
    desc: "Largest railway junction in Bihar",
    keywords: ["patna junction", "patna station", "patna railway station", "junction"]
  },
  {
    name: "Boring Road",
    city: "Patna",
    lat: 25.6133,
    lng: 85.1111,
    desc: "Bustling retail, high street, and coaching center hub",
    keywords: ["boring road", "boring road crossing", "boring road chauraha"]
  },
  {
    name: "Kankarbagh",
    city: "Patna",
    lat: 25.5978,
    lng: 85.1583,
    desc: "One of Asia's largest residential colonies",
    keywords: ["kankarbagh", "kankarbagh colonies", "tiwary bechar", "kankarbagh auto Stand"]
  },
  {
    name: "Bailey Road",
    city: "Patna",
    lat: 25.6094,
    lng: 85.0886,
    desc: "Major arterial high-speed corridor connecting west Patna",
    keywords: ["bailey road", "patna high court", "raj bhaban"]
  },
  {
    name: "Ashok Rajpath",
    city: "Patna",
    lat: 25.6200,
    lng: 85.1700,
    desc: "Academic road passing through Patna University & PMCH",
    keywords: ["ashok rajpath", "patna college", "science college", "pmch"]
  },
  {
    name: "Danapur",
    city: "Patna",
    lat: 25.6315,
    lng: 85.0384,
    desc: "Important historical cantonment and railway station area",
    keywords: ["danapur", "danapur cantt", "danapur station"]
  },
  {
    name: "Patliputra",
    city: "Patna",
    lat: 25.6214,
    lng: 85.0850,
    desc: "Premium residential colony and clean station area",
    keywords: ["patliputra", "patliputra junction", "patliputra colony"]
  },
  {
    name: "AIIMS Patna",
    city: "Patna",
    lat: 25.5684,
    lng: 85.0740,
    desc: "Premier healthcare and medical research institute",
    keywords: ["aiims patna", "aiims hospital", "phulwari sharif aiims"]
  },
  {
    name: "Airport",
    city: "Patna",
    lat: 25.5937,
    lng: 85.0879,
    desc: "Jay Prakash Narayan Airport Patna",
    keywords: ["airport", "patna airport", "jay prakash narayan airport"]
  },

  // --- Darbhanga ---
  {
    name: "Darbhanga Tower",
    city: "Darbhanga",
    lat: 26.1558,
    lng: 85.8970,
    desc: "Iconic commercial square and shopping hub",
    keywords: ["darbhanga tower", "tower chowk", "darbhanga market"]
  },
  {
    name: "Laheriasarai",
    city: "Darbhanga",
    lat: 26.1300,
    lng: 85.8900,
    desc: "Administrative nerve center and twin town",
    keywords: ["laheriasarai", "laheriasarai chowk", "laheriasarai station"]
  },
  {
    name: "DMCH",
    city: "Darbhanga",
    lat: 26.1420,
    lng: 85.9010,
    desc: "Darbhanga Medical College and Hospital complex",
    keywords: ["dmch", "darbhanga medical college", "dmch hospital"]
  },
  {
    name: "Station Road",
    city: "Darbhanga",
    lat: 26.1510,
    lng: 85.8940,
    desc: "Main avenue connecting Darbhanga railway station",
    keywords: ["station road darbhanga", "darbhanga station Road"]
  },
  {
    name: "Delhi More",
    city: "Darbhanga",
    lat: 26.1840,
    lng: 85.8720,
    desc: "Major junction at East-West Corridor NH57 exit",
    keywords: ["delhi more", "delhi mor", "darbhanga nh57 exit"]
  },

  // --- Muzaffarpur ---
  {
    name: "Motijheel",
    city: "Muzaffarpur",
    lat: 26.1215,
    lng: 85.3940,
    desc: "The primary high street market yard of Muzaffarpur",
    keywords: ["motijheel", "motijheel market", "motijheel bridge"]
  },
  {
    name: "Company Bagh",
    city: "Muzaffarpur",
    lat: 26.1260,
    lng: 85.3910,
    desc: "Bustling central corporate office and court zone",
    keywords: ["company bagh", "court area", "dm office muzaffarpur"]
  },
  {
    name: "Bhagwanpur",
    city: "Muzaffarpur",
    lat: 26.1030,
    lng: 85.3580,
    desc: "Bustling transport junction at national highways crossway",
    keywords: ["bhagwanpur", "bhagwanpur chowk"]
  },
  {
    name: "MIT",
    city: "Muzaffarpur",
    lat: 26.1412,
    lng: 85.3812,
    desc: "Muzaffarpur Institute of Technology campus gate",
    keywords: ["mit", "mit college", "engineering college"]
  },
  {
    name: "Railway Station",
    city: "Muzaffarpur",
    lat: 26.1170,
    lng: 85.3860,
    desc: "Muzaffarpur Junction railway station terminal",
    keywords: ["muzaffarpur station", "muzaffarpur junction", "railway station muzaffarpur"]
  },

  // --- Begusarai ---
  {
    name: "Har Har Mahadev Chowk",
    city: "Begusarai",
    lat: 25.4210,
    lng: 86.1310,
    desc: "Iconic central traffic island in Begusarai",
    keywords: ["har har mahadev chowk", "mahadev chowk begusarai"]
  },
  {
    name: "NH31",
    city: "Begusarai",
    lat: 25.4190,
    lng: 86.1290,
    desc: "Broad highway corridor spanning industrial units",
    keywords: ["nh31", "begusarai bypass"]
  },
  {
    name: "Station Area",
    city: "Begusarai",
    lat: 25.4150,
    lng: 86.1250,
    desc: "Central hub bordering Begusarai Railway Junction",
    keywords: ["station area begusarai", "begusarai station", "railway station begusarai"]
  },

  // --- Gaya ---
  {
    name: "Vishnupad Temple",
    city: "Gaya",
    lat: 24.7775,
    lng: 85.0094,
    desc: "Ancient reverent temple on the banks of Falgu River",
    keywords: ["vishnupad temple", "vishnupand", "gaya temple"]
  },
  {
    name: "Gaya Junction",
    city: "Gaya",
    lat: 24.8030,
    lng: 84.9980,
    desc: "Major junction operating connecting routes",
    keywords: ["gaya junction", "gaya station", "gaya railway station"]
  },
  {
    name: "Bodh Gaya",
    city: "Gaya",
    lat: 24.6961,
    lng: 84.9912,
    desc: "World Heritage Mahabodhi Temple site",
    keywords: ["bodh gaya", "bodhgaya", "mahabodhi temple"]
  },

  // --- Hajipur ---
  {
    name: "Cinema Road",
    city: "Hajipur",
    lat: 25.6880,
    lng: 85.2150,
    desc: "Popular commercial complex and high street market",
    keywords: ["cinema road", "cinema road hajipur"]
  },
  {
    name: "Rajendra Chowk",
    city: "Hajipur",
    lat: 25.6830,
    lng: 85.2210,
    desc: "Central circular crossing point in main town",
    keywords: ["rajendra chowk", "hajipur crossing"]
  },
  {
    name: "Gandhi Ashram",
    city: "Hajipur",
    lat: 25.6940,
    lng: 85.2120,
    desc: "Scenic administrative and cultural heritage hub",
    keywords: ["gandhi ashram", "hajipur ashram"]
  }
];

export function searchBiharLocations(query: string): BiharLocation[] {
  if (!query) return [];
  const cleanQ = query.toLowerCase().trim();
  
  return BIHAR_LOCATIONS.filter(loc => {
    // Exact or partial name match
    if (loc.name.toLowerCase().includes(cleanQ)) return true;
    // City match
    if (loc.city.toLowerCase().includes(cleanQ)) return true;
    // Keyword match
    if (loc.keywords.some(kw => kw.includes(cleanQ))) return true;
    return false;
  });
}

export function getCoordinatesForPlaceName(name: string): { lat: number; lng: number } | null {
  if (!name) return null;
  const cleanN = name.toLowerCase().trim();
  
  // Try exact match first
  let match = BIHAR_LOCATIONS.find(loc => loc.name.toLowerCase() === cleanN);
  if (match) return { lat: match.lat, lng: match.lng };
  
  // Try dynamic keyword match
  match = BIHAR_LOCATIONS.find(loc => 
    loc.keywords.some(kw => kw === cleanN || cleanN.includes(kw))
  );
  if (match) return { lat: match.lat, lng: match.lng };

  // Try substring match
  match = BIHAR_LOCATIONS.find(loc => 
    loc.name.toLowerCase().includes(cleanN) || cleanN.includes(loc.name.toLowerCase())
  );
  if (match) return { lat: match.lat, lng: match.lng };

  return null;
}
