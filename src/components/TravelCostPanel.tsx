import { useState, useEffect, useRef, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Train, Plane, Clock, MapPin, IndianRupee, Zap, Star,
  ChevronDown, ChevronUp, Route, Loader2, BedDouble, Utensils
} from 'lucide-react';
import {
  calculateTravelOptions,
  formatINR,
  formatHours,
  TransportOption,
} from '../hooks/useTravelCost';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TravelCostPanelProps {
  fromLocation: string;
  toLocation: string;
  days: number;
}

// ─── Badge config ───────────────────────────────────────────────────────────

const BADGE_CONFIG = {
  cheapest: {
    label: 'Cheapest 💰',
    bg: 'bg-emerald-500',
    ring: 'ring-2 ring-emerald-400',
    border: 'border-emerald-200',
    glow: 'shadow-emerald-200/60',
  },
  fastest: {
    label: 'Fastest ⚡',
    bg: 'bg-amber-500',
    ring: 'ring-2 ring-amber-400',
    border: 'border-amber-200',
    glow: 'shadow-amber-200/60',
  },
  recommended: {
    label: 'Recommended ⭐',
    bg: 'bg-blue-600',
    ring: 'ring-2 ring-blue-400',
    border: 'border-blue-200',
    glow: 'shadow-blue-200/60',
  },
} as const;

// ─── Transport Icon ──────────────────────────────────────────────────────────

function ModeIcon({ mode, className }: { mode: string; className?: string }) {
  if (mode === 'road') return <Car className={className} />;
  if (mode === 'train') return <Train className={className} />;
  return <Plane className={className} />;
}

const MODE_COLORS = {
  road: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-red-500' },
  train: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-indigo-500' },
  flight: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-pink-500' },
};

// ─── Cost Breakdown Row ──────────────────────────────────────────────────────

function BreakdownRow({
  icon, label, budget, luxury,
}: {
  icon: React.ReactNode;
  label: string;
  budget: number;
  luxury: number;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex gap-4 text-sm font-semibold">
        <span className="text-emerald-600">{formatINR(budget)}</span>
        <span className="text-purple-600">{formatINR(luxury)}</span>
      </div>
    </div>
  );
}

// ─── Transport Card ──────────────────────────────────────────────────────────

function TransportCard({
  option,
  selected,
  onClick,
  index,
}: {
  option: TransportOption;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = option.badge ? BADGE_CONFIG[option.badge] : null;
  const colors = MODE_COLORS[option.mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 260, damping: 24 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-3xl border-2 p-5 transition-all duration-200 shadow-lg ${
        selected
          ? `${badge?.ring ?? 'ring-2 ring-beach'} ${badge?.border ?? 'border-beach'} bg-white shadow-xl ${badge?.glow ?? 'shadow-beach/30'}`
          : 'border-gray-100 bg-white hover:shadow-xl hover:border-gray-200'
      }`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${badge.bg}`}>
          {badge.label}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${colors.bg} flex items-center justify-center`}>
            <ModeIcon mode={option.mode} className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base">{option.label}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {Math.round(option.distanceKm).toLocaleString('en-IN')} km
              &nbsp;·&nbsp;
              <Clock className="w-3 h-3" />
              {formatHours(option.timeHours)}
            </p>
          </div>
        </div>

        {/* Selected ring indicator */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? `border-transparent bg-gradient-to-br ${colors.gradient}` : 'border-gray-300'
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>

      {/* Cost Row */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-emerald-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Budget</p>
          <p className="text-xl font-black text-emerald-700">{formatINR(option.budgetCost)}</p>
        </div>
        <div className="flex-1 bg-purple-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Luxury</p>
          <p className="text-xl font-black text-purple-700">{formatINR(option.luxuryCost)}</p>
        </div>
      </div>

      {/* Breakdown toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors pt-1"
      >
        {expanded ? (
          <>Hide breakdown <ChevronUp className="w-3.5 h-3.5" /></>
        ) : (
          <>Show breakdown <ChevronDown className="w-3.5 h-3.5" /></>
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-gray-50 rounded-2xl p-4">
              {/* Header row */}
              <div className="flex justify-end gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pr-0.5">
                <span>Budget</span>
                <span>Luxury</span>
              </div>
              <BreakdownRow
                icon={<ModeIcon mode={option.mode} className="w-4 h-4" />}
                label="Transport"
                budget={option.breakdown.transportBudget}
                luxury={option.breakdown.transportLuxury}
              />
              <BreakdownRow
                icon={<BedDouble className="w-4 h-4" />}
                label={`Stay (${Math.max(option.mode === 'road' ? 0 : 1, 1)} nights)`}
                budget={option.breakdown.stayBudget}
                luxury={option.breakdown.stayLuxury}
              />
              <BreakdownRow
                icon={<Utensils className="w-4 h-4" />}
                label="Food (all days)"
                budget={option.breakdown.foodBudget}
                luxury={option.breakdown.foodLuxury}
              />
              <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Total</span>
                <div className="flex gap-4 font-black text-sm">
                  <span className="text-emerald-600">{formatINR(option.breakdown.totalBudget)}</span>
                  <span className="text-purple-600">{formatINR(option.breakdown.totalLuxury)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

const LIBRARIES: any[] = ['places'];

export function TravelCostPanel({ fromLocation, toLocation, days }: TravelCostPanelProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const [options, setOptions] = useState<TransportOption[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [drivingDuration, setDrivingDuration] = useState<string>('');

  const lastFetchKey = useRef('');

  const fetchRoute = useCallback(async () => {
    if (!isLoaded || !fromLocation || !toLocation) return;

    const key = `${fromLocation}||${toLocation}||${days}`;
    if (key === lastFetchKey.current) return;
    lastFetchKey.current = key;

    setLoading(true);
    setError('');

    try {
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: fromLocation,
        destination: toLocation,
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'IN',
      });

      const leg = result.routes[0]?.legs[0];
      if (!leg) throw new Error('No route found');

      const km = (leg.distance?.value ?? 0) / 1000;
      const durationText = leg.duration?.text ?? '';

      setDistanceKm(km);
      setDrivingDuration(durationText);

      const opts = calculateTravelOptions(km, days);
      setOptions(opts);

      // Pre-select the recommended option
      const rec = opts.find((o) => o.badge === 'recommended');
      setSelected(rec?.mode ?? opts[0]?.mode ?? 'road');
    } catch (err: any) {
      // Fallback: if Directions API fails (quota, API key etc), use straight-line estimate
      setError('Could not fetch live route. Showing estimated costs.');
      // Geocode both and compute haversine
      try {
        const geocoder = new google.maps.Geocoder();
        const [r1, r2] = await Promise.all([
          new Promise<google.maps.GeocoderResult[]>((res, rej) =>
            geocoder.geocode({ address: fromLocation }, (r, s) =>
              s === 'OK' && r ? res(r) : rej(s)
            )
          ),
          new Promise<google.maps.GeocoderResult[]>((res, rej) =>
            geocoder.geocode({ address: toLocation }, (r, s) =>
              s === 'OK' && r ? res(r) : rej(s)
            )
          ),
        ]);
        const p1 = r1[0].geometry.location;
        const p2 = r2[0].geometry.location;
        const km = haversine(p1.lat(), p1.lng(), p2.lat(), p2.lng());
        setDistanceKm(km);
        const opts = calculateTravelOptions(km, days);
        setOptions(opts);
        const rec = opts.find((o) => o.badge === 'recommended');
        setSelected(rec?.mode ?? 'road');
      } catch {
        setError('Unable to calculate route. Please check location names.');
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, fromLocation, toLocation, days]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  if (!fromLocation || !toLocation) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-beach to-nature rounded-2xl shadow-lg">
            <Route className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Route & Cost Comparison</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {fromLocation} → {toLocation} · {days} day{days !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Route meta bar */}
        {distanceKm > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-4 mt-4"
          >
            <Chip icon={<MapPin className="w-4 h-4 text-beach" />} label={`${Math.round(distanceKm).toLocaleString('en-IN')} km total`} />
            {drivingDuration && <Chip icon={<Clock className="w-4 h-4 text-nature" />} label={`${drivingDuration} by road`} />}
            <Chip
              icon={<IndianRupee className="w-4 h-4 text-temple" />}
              label={`${days} night${days !== 1 ? 's' : ''} stay included`}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-beach animate-spin" />
            <div className="absolute inset-0 rounded-full bg-beach/10 animate-ping" />
          </div>
          <p className="text-gray-500 font-medium">Calculating best routes from Google Maps…</p>
        </div>
      )}

      {/* Error notice */}
      {error && !loading && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Cards */}
      {!loading && options.length > 0 && (
        <>
          {/* Legend */}
          <div className="flex items-center gap-6 mb-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" /> Budget price
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-purple-500" /> Luxury price
            </span>
            <span className="text-gray-300">·</span>
            <span>Includes transport + stay + food</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt, i) => (
              <TransportCard
                key={opt.mode}
                option={opt}
                index={i}
                selected={selected === opt.mode}
                onClick={() => setSelected(opt.mode)}
              />
            ))}
          </div>

          {/* Mode guide */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 glass rounded-3xl p-5"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              🧠 Smart Route Guide
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-lg">🚗</span>
                <div>
                  <p className="font-semibold text-gray-800">Under 200 km</p>
                  <p>Road trip is your best bet — flexible, cheap, door-to-door.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">🚆</span>
                <div>
                  <p className="font-semibold text-gray-800">200 – 600 km</p>
                  <p>Train + local cab — most comfortable mid-range option.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">✈️</span>
                <div>
                  <p className="font-semibold text-gray-800">Above 600 km</p>
                  <p>Flight saves time, especially for cross-country trips.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm font-semibold text-gray-700">
      {icon}
      {label}
    </div>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
