// useTravelCost.ts
// India-realistic travel cost calculation hook

export type TransportMode = 'road' | 'train' | 'flight';

export interface TransportOption {
  mode: TransportMode;
  label: string;
  icon: string;
  distanceKm: number;
  timeHours: number;
  budgetCost: number;
  luxuryCost: number;
  breakdown: CostBreakdown;
  badge?: 'cheapest' | 'fastest' | 'recommended';
}

export interface CostBreakdown {
  transportBudget: number;
  transportLuxury: number;
  stayBudget: number;
  stayLuxury: number;
  foodBudget: number;
  foodLuxury: number;
  totalBudget: number;
  totalLuxury: number;
}

// ─── India Pricing Constants ───────────────────────────────────────────────

const ROAD = {
  budgetPerKm: 12,   // ₹10–₹15 mid
  luxuryPerKm: 27,   // ₹20–₹35 mid
  avgSpeedKmh: 55,   // highway avg
};

const TRAIN = {
  budgetPerKm: 0.75, // ₹0.5–₹1 mid
  acPerKm: 2.5,      // ₹2–₹3 mid
  avgSpeedKmh: 70,   // express avg
};

const FLIGHT = {
  budgetPerKm: 5,    // ₹4–₹6 mid
  luxuryPerKm: 9,    // ₹6–₹12 mid
  avgSpeedKmh: 700,  // cruise speed
  airportOverheadHrs: 3, // check-in + boarding + arrival
};

const STAY = {
  budget: 1000,   // ₹500–₹1500 mid
  mid: 2750,      // ₹1500–₹4000 mid
  luxury: 7500,   // ₹5000+ typical
};

const FOOD = {
  budget: 400,   // ₹300–₹500 mid
  normal: 750,   // ₹500–₹1000 mid
  luxury: 2250,  // ₹1500–₹3000 mid
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function roadCost(km: number, days: number): CostBreakdown {
  const transportBudget = km * ROAD.budgetPerKm;
  const transportLuxury = km * ROAD.luxuryPerKm;
  const stayBudget = STAY.budget * days;
  const stayLuxury = STAY.luxury * days;
  const foodBudget = FOOD.budget * days;
  const foodLuxury = FOOD.luxury * days;
  return {
    transportBudget, transportLuxury,
    stayBudget, stayLuxury,
    foodBudget, foodLuxury,
    totalBudget: transportBudget + stayBudget + foodBudget,
    totalLuxury: transportLuxury + stayLuxury + foodLuxury,
  };
}

function trainCost(km: number, days: number): CostBreakdown {
  const transportBudget = km * TRAIN.budgetPerKm;
  const transportLuxury = km * TRAIN.acPerKm;
  const stayBudget = STAY.budget * days;
  const stayLuxury = STAY.mid * days;
  const foodBudget = FOOD.budget * days;
  const foodLuxury = FOOD.normal * days;
  return {
    transportBudget, transportLuxury,
    stayBudget, stayLuxury,
    foodBudget, foodLuxury,
    totalBudget: transportBudget + stayBudget + foodBudget,
    totalLuxury: transportLuxury + stayLuxury + foodLuxury,
  };
}

function flightCost(km: number, days: number): CostBreakdown {
  const transportBudget = km * FLIGHT.budgetPerKm;
  const transportLuxury = km * FLIGHT.luxuryPerKm;
  const stayBudget = STAY.mid * days;
  const stayLuxury = STAY.luxury * days;
  const foodBudget = FOOD.normal * days;
  const foodLuxury = FOOD.luxury * days;
  return {
    transportBudget, transportLuxury,
    stayBudget, stayLuxury,
    foodBudget, foodLuxury,
    totalBudget: transportBudget + stayBudget + foodBudget,
    totalLuxury: transportLuxury + stayLuxury + foodLuxury,
  };
}

// ─── Main Export ────────────────────────────────────────────────────────────

export function calculateTravelOptions(
  distanceKm: number,
  days: number
): TransportOption[] {
  const options: TransportOption[] = [];

  // --- ROAD ---
  const roadTimeHrs = distanceKm / ROAD.avgSpeedKmh;
  const roadBreakdown = roadCost(distanceKm, days);
  options.push({
    mode: 'road',
    label: 'Road (Car / Taxi)',
    icon: '🚗',
    distanceKm,
    timeHours: roadTimeHrs,
    budgetCost: roadBreakdown.totalBudget,
    luxuryCost: roadBreakdown.totalLuxury,
    breakdown: roadBreakdown,
  });

  // --- TRAIN ---
  const trainTimeHrs = distanceKm / TRAIN.avgSpeedKmh;
  const trainBreakdown = trainCost(distanceKm, days);
  options.push({
    mode: 'train',
    label: 'Train',
    icon: '🚆',
    distanceKm,
    timeHours: trainTimeHrs,
    budgetCost: trainBreakdown.totalBudget,
    luxuryCost: trainBreakdown.totalLuxury,
    breakdown: trainBreakdown,
  });

  // --- FLIGHT ---
  const flightTimeHrs = distanceKm / FLIGHT.avgSpeedKmh + FLIGHT.airportOverheadHrs;
  const flightBreakdown = flightCost(distanceKm, days);
  options.push({
    mode: 'flight',
    label: 'Flight',
    icon: '✈️',
    distanceKm,
    timeHours: flightTimeHrs,
    budgetCost: flightBreakdown.totalBudget,
    luxuryCost: flightBreakdown.totalLuxury,
    breakdown: flightBreakdown,
  });

  // --- Smart Highlights ---
  const cheapestIdx = options.reduce(
    (minI, o, i, arr) => (o.budgetCost < arr[minI].budgetCost ? i : minI),
    0
  );
  const fastestIdx = options.reduce(
    (minI, o, i, arr) => (o.timeHours < arr[minI].timeHours ? i : minI),
    0
  );

  // Recommended: best value score (budget cost / time — lower is better, normalised)
  const scores = options.map((o) => o.budgetCost / 1000 + o.timeHours * 0.5);
  const recommendedIdx = scores.indexOf(Math.min(...scores));

  options[cheapestIdx].badge = 'cheapest';
  if (fastestIdx !== cheapestIdx) options[fastestIdx].badge = 'fastest';
  if (recommendedIdx !== cheapestIdx && recommendedIdx !== fastestIdx)
    options[recommendedIdx].badge = 'recommended';

  // Rule-based: override recommended for short vs long
  // < 200 km → Road recommended
  // 200–600 km → Train recommended
  // > 600 km → Flight recommended
  if (distanceKm < 200) options[0].badge = 'recommended';
  else if (distanceKm <= 600) options[1].badge = 'recommended';
  else options[2].badge = 'recommended';

  return options;
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
