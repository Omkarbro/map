import React, { useState } from 'react';
import { MapPin, Calendar, IndianRupee, Sparkles, Navigation, Loader2 } from 'lucide-react';

interface SearchProps {
  onSearch: (data: any) => void;
}

export function HeroSearchSection({ onSearch }: SearchProps) {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [detectingGPS, setDetectingGPS] = useState(false);

  const getDaysCount = () => {
    if (startDate && endDate) {
      const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
      const d = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return d > 0 ? d : 1;
    }
    return 1;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ fromLocation, toLocation, startDate, endDate, budget, days: getDaysCount() });
  };

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      setFromLocation('Mumbai, Maharashtra');
      return;
    }
    setDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using Google Maps Geocoder if available, else plain API
        if (typeof google !== 'undefined' && google.maps) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            setDetectingGPS(false);
            if (status === 'OK' && results && results[0]) {
              // Prefer locality + administrative_area_level_1
              const components = results[0].address_components;
              const locality = components.find((c) => c.types.includes('locality'))?.long_name;
              const state = components.find((c) =>
                c.types.includes('administrative_area_level_1')
              )?.long_name;
              setFromLocation(locality && state ? `${locality}, ${state}` : results[0].formatted_address);
            } else {
              setFromLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          });
        } else {
          // Fallback: use coordinate string
          setDetectingGPS(false);
          setFromLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      },
      () => {
        setDetectingGPS(false);
        setFromLocation('Mumbai, Maharashtra');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="relative pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center min-h-[85vh] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-beach/20 blur-[100px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-nature/20 blur-[120px] animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Design your perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-beach to-nature animate-gradient-x">
            Indian Expedition
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 font-medium">
          Type in your details below. Our AI orchestrates your entire journey, from flights to hidden gems.
        </p>
      </div>

      <form onSubmit={handleSearch} className="w-full max-w-5xl glass rounded-3xl p-4 md:p-8 shadow-2xl z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Location Inputs (Manual Type) */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-beach" /> Route
            </label>
            <div className="flex flex-col md:flex-row gap-4 relative">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Leaving from..."
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-beach focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={autoDetectLocation}
                  disabled={detectingGPS}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-beach disabled:opacity-50"
                  title="Auto-detect location"
                >
                  {detectingGPS
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Navigation className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="hidden md:flex items-center justify-center">
                <div className="w-6 h-0.5 bg-gray-300"></div>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Going to (Any State/City)..."
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-nature focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="col-span-1 space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nature" /> Travel Dates
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-nature focus:outline-none text-sm"
                required
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-nature focus:outline-none text-sm"
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div className="col-span-1 space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-temple" /> Budget
            </label>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-temple focus:outline-none bg-white"
              min="1"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin transition-transform" />
            Generate Smart Itinerary
          </button>
        </div>
      </form>
    </div>
  );
}
