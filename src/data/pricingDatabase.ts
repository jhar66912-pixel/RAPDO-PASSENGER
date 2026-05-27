export interface RahiRoute {
  id: string;
  routeCode: string;
  pickup: string;
  drop: string;
  distanceKm: number;
  fare: number;
  trafficStatus: 'Low' | 'Medium' | 'Heavy';
  trafficSurgeMult: number; // multiplier
  weatherSurgeMult: number; // multiplier
  etaMinutes: number;
  captainArrivalMinutes: number;
  isPopular?: boolean;
}

// Complete Exact 40 Routes Database provided by corporate requirements
export const RAHI_40_ROUTES: RahiRoute[] = [
  { id: "001", routeCode: "R-001", pickup: "Samastipur", drop: "Tajpur Road", distanceKm: 4, fare: 35, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 8, captainArrivalMinutes: 3, isPopular: true },
  { id: "002", routeCode: "R-002", pickup: "Samastipur", drop: "Kashipur", distanceKm: 6, fare: 50, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 12, captainArrivalMinutes: 4, isPopular: true },
  { id: "003", routeCode: "R-003", pickup: "Samastipur", drop: "Musrigharari", distanceKm: 8, fare: 60, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 16, captainArrivalMinutes: 3, isPopular: true },
  { id: "004", routeCode: "R-004", pickup: "Samastipur", drop: "Tajpur", distanceKm: 12, fare: 85, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 24, captainArrivalMinutes: 5, isPopular: true },
  { id: "005", routeCode: "R-005", pickup: "Samastipur", drop: "Dalsinghsarai", distanceKm: 18, fare: 130, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 35, captainArrivalMinutes: 6 },
  { id: "006", routeCode: "R-006", pickup: "Samastipur", drop: "Rosera", distanceKm: 22, fare: 160, trafficStatus: "Heavy", trafficSurgeMult: 1.15, weatherSurgeMult: 1.0, etaMinutes: 48, captainArrivalMinutes: 4, isPopular: true },
  { id: "007", routeCode: "R-007", pickup: "Samastipur", drop: "Hasanpur", distanceKm: 30, fare: 220, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 60, captainArrivalMinutes: 5 },
  { id: "008", routeCode: "R-008", pickup: "Samastipur", drop: "Warisnagar", distanceKm: 34, fare: 240, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 68, captainArrivalMinutes: 7 },
  { id: "009", routeCode: "R-009", pickup: "Samastipur", drop: "Pusa", distanceKm: 40, fare: 280, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 80, captainArrivalMinutes: 6, isPopular: true },
  { id: "010", routeCode: "R-010", pickup: "Samastipur", drop: "Bithan", distanceKm: 45, fare: 320, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 90, captainArrivalMinutes: 8 },
  { id: "011", routeCode: "R-011", pickup: "Samastipur", drop: "Singhia", distanceKm: 50, fare: 360, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 100, captainArrivalMinutes: 9 },
  { id: "012", routeCode: "R-012", pickup: "Samastipur", drop: "Khagaria Border", distanceKm: 55, fare: 390, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 110, captainArrivalMinutes: 7 },
  { id: "013", routeCode: "R-013", pickup: "Samastipur", drop: "Begusarai", distanceKm: 60, fare: 430, trafficStatus: "Heavy", trafficSurgeMult: 1.15, weatherSurgeMult: 1.0, etaMinutes: 124, captainArrivalMinutes: 8 },
  { id: "014", routeCode: "R-014", pickup: "Samastipur", drop: "Darbhanga", distanceKm: 65, fare: 460, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 130, captainArrivalMinutes: 5, isPopular: true },
  { id: "015", routeCode: "R-015", pickup: "Samastipur", drop: "Muzaffarpur", distanceKm: 70, fare: 500, trafficStatus: "Heavy", trafficSurgeMult: 1.15, weatherSurgeMult: 1.0, etaMinutes: 140, captainArrivalMinutes: 6, isPopular: true },
  { id: "016", routeCode: "R-016", pickup: "Samastipur", drop: "Bachhwara", distanceKm: 75, fare: 530, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 150, captainArrivalMinutes: 9 },
  { id: "017", routeCode: "R-017", pickup: "Samastipur", drop: "Barauni", distanceKm: 80, fare: 560, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 160, captainArrivalMinutes: 8 },
  { id: "018", routeCode: "R-018", pickup: "Samastipur", drop: "Mahnar", distanceKm: 85, fare: 600, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 170, captainArrivalMinutes: 9 },
  { id: "019", routeCode: "R-019", pickup: "Samastipur", drop: "Hajipur", distanceKm: 90, fare: 640, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 180, captainArrivalMinutes: 10 },
  { id: "020", routeCode: "R-020", pickup: "Samastipur", drop: "Patna", distanceKm: 98, fare: 700, trafficStatus: "Heavy", trafficSurgeMult: 1.15, weatherSurgeMult: 1.0, etaMinutes: 195, captainArrivalMinutes: 5, isPopular: true },
  { id: "021", routeCode: "R-021", pickup: "Samastipur", drop: "Ujiarpur", distanceKm: 10, fare: 70, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 20, captainArrivalMinutes: 4 },
  { id: "022", routeCode: "R-022", pickup: "Samastipur", drop: "Vidyapatinagar", distanceKm: 24, fare: 170, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 48, captainArrivalMinutes: 6 },
  { id: "023", routeCode: "R-023", pickup: "Samastipur", drop: "Mohiuddin Nagar", distanceKm: 28, fare: 200, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 56, captainArrivalMinutes: 7 },
  { id: "024", routeCode: "R-024", pickup: "Samastipur", drop: "Shahpur Patori", distanceKm: 36, fare: 250, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 72, captainArrivalMinutes: 8 },
  { id: "025", routeCode: "R-025", pickup: "Samastipur", drop: "Bakhtiyarpur", distanceKm: 88, fare: 620, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 176, captainArrivalMinutes: 9 },
  { id: "026", routeCode: "R-026", pickup: "Samastipur", drop: "Kalyanpur", distanceKm: 9, fare: 65, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 18, captainArrivalMinutes: 4 },
  { id: "027", routeCode: "R-027", pickup: "Samastipur", drop: "Morwa", distanceKm: 15, fare: 110, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 30, captainArrivalMinutes: 5 },
  { id: "028", routeCode: "R-028", pickup: "Samastipur", drop: "Sarairanjan", distanceKm: 20, fare: 145, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 40, captainArrivalMinutes: 4, isPopular: true },
  { id: "029", routeCode: "R-029", pickup: "Samastipur", drop: "Baheri", distanceKm: 52, fare: 370, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 104, captainArrivalMinutes: 8 },
  { id: "030", routeCode: "R-030", pickup: "Samastipur", drop: "Jandaha", distanceKm: 58, fare: 410, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 116, captainArrivalMinutes: 9 },
  { id: "031", routeCode: "R-031", pickup: "Samastipur", drop: "Madhepura", distanceKm: 95, fare: 680, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 190, captainArrivalMinutes: 10 },
  { id: "032", routeCode: "R-032", pickup: "Samastipur", drop: "Saharsa Border", distanceKm: 100, fare: 720, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 200, captainArrivalMinutes: 11 },
  { id: "033", routeCode: "R-033", pickup: "Samastipur", drop: "Patori Bazar", distanceKm: 33, fare: 235, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 66, captainArrivalMinutes: 7 },
  { id: "034", routeCode: "R-034", pickup: "Samastipur", drop: "Rampur Jalalpur", distanceKm: 16, fare: 115, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 32, captainArrivalMinutes: 5 },
  { id: "035", routeCode: "R-035", pickup: "Samastipur", drop: "Dudhpur", distanceKm: 7, fare: 55, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 14, captainArrivalMinutes: 3 },
  { id: "036", routeCode: "R-036", pickup: "Samastipur", drop: "Shivajinagar", distanceKm: 25, fare: 180, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 50, captainArrivalMinutes: 6 },
  { id: "037", routeCode: "R-037", pickup: "Samastipur", drop: "Khanpur", distanceKm: 27, fare: 190, trafficStatus: "Low", trafficSurgeMult: 1.0, weatherSurgeMult: 1.0, etaMinutes: 54, captainArrivalMinutes: 7 },
  { id: "038", routeCode: "R-038", pickup: "Samastipur", drop: "Bibhutipur", distanceKm: 32, fare: 225, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 64, captainArrivalMinutes: 8 },
  { id: "039", routeCode: "R-039", pickup: "Samastipur", drop: "Rusera Ghat", distanceKm: 42, fare: 295, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 84, captainArrivalMinutes: 7 },
  { id: "040", routeCode: "R-040", pickup: "Samastipur", drop: "Mahishi Road", distanceKm: 48, fare: 340, trafficStatus: "Medium", trafficSurgeMult: 1.05, weatherSurgeMult: 1.0, etaMinutes: 96, captainArrivalMinutes: 8 }
];

// Fare Calculation Formula Parameters
export const BASE_DISTANCE_KM = 3;
export const BASE_FARE_INR = 20;
export const PER_KM_CHARGE_INR = 8;
export const PLATFORM_FEE_MIN = 5;
export const PLATFORM_FEE_MAX = 10;

// Discount details mapping table
export interface DiscountTier {
  minKm: number;
  maxKm: number;
  discountInr: number;
}

export const RAHI_DISCOUNT_TIERS: DiscountTier[] = [
  { minKm: 0, maxKm: 10, discountInr: 0 },
  { minKm: 10, maxKm: 25, discountInr: 10 },
  { minKm: 25, maxKm: 50, discountInr: 20 },
  { minKm: 50, maxKm: 80, discountInr: 40 },
  { minKm: 80, maxKm: 100, discountInr: 80 }
];

/**
 * Calculate RAHI corporate pricing details for any arbitrary distance.
 * Returns the exact breakdown based on formula rules.
 */
export function calculateBreakdown(distanceKm: number, options?: { isHeavyTraffic?: boolean; isRainyWeather?: boolean; selectedPlatformFee?: number }) {
  const isHeavyTraffic = options?.isHeavyTraffic || false;
  const isRainyWeather = options?.isRainyWeather || false;
  const platformFee = options?.selectedPlatformFee !== undefined ? options.selectedPlatformFee : 6;

  // 1. Base distance check
  let runFare = BASE_FARE_INR;
  if (distanceKm > BASE_DISTANCE_KM) {
    runFare += (distanceKm - BASE_DISTANCE_KM) * PER_KM_CHARGE_INR;
  }

  // 2. Surges
  let surgeAddons = 0;
  if (isHeavyTraffic) {
    surgeAddons += runFare * 0.15; // 15% Traffic surge
  }
  if (isRainyWeather) {
    surgeAddons += runFare * 0.20; // 20% Weather surge
  }

  const rawSubtotal = runFare + surgeAddons;

  // 3. Discount Lookup
  let discountAmount = 0;
  const tier = RAHI_DISCOUNT_TIERS.find(t => distanceKm >= t.minKm && distanceKm <= t.maxKm);
  if (tier) {
    discountAmount = tier.discountInr;
  }

  // 4. Grand Total
  // Customer Pays = Raw + Platform Fee - Discount
  const initialTotal = Math.round(rawSubtotal + platformFee - discountAmount);
  const finalCustomerFare = Math.max(20, initialTotal); // Hard min of ₹20

  // 5. Captain Split
  // Captain Earns 80% to 85% of standard fare. For Bihar localized, we ensure standard high split: Let's do 15% flat company commission + Standard platform fee retention.
  // Standard corporate formula: Customer Pays ₹220, Captain Earns ₹180, Company Profit ₹40
  // That's roughly: Company Profit = Math.round(CustomerFare * 0.18 + 0.4), Captain Earns = CustomerFare - Company Profit
  const companyProfit = Math.round(finalCustomerFare * 0.18);
  const captainEarnings = finalCustomerFare - companyProfit;

  return {
    rawBaseDistanceFare: BASE_FARE_INR,
    distanceOverBase: Math.max(0, distanceKm - BASE_DISTANCE_KM),
    distanceFareCharge: Math.max(0, (distanceKm - BASE_DISTANCE_KM) * PER_KM_CHARGE_INR),
    runFare,
    surges: Math.round(surgeAddons),
    platformFee,
    discountAmount,
    couponApplied: discountAmount > 0 ? "RAHI_VOLUME_SAVING" : null,
    finalCustomerFare,
    captainEarnings,
    companyProfit
  };
}
