import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Autocomplete } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Info, ShieldCheck, Map as MapIcon, ChevronRight } from 'lucide-react';

const center = { lat: 28.6139, lng: 77.2090 }; // Delhi default

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const options = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    {
      "featureType": "poi",
      "elementType": "labels",
      "stylers": [{ "visibility": "off" }]
    }
  ]
};

interface LiveNavigationProps {
  initialDestinationName?: string;
}

export function LiveNavigation({ initialDestinationName }: LiveNavigationProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'] as any,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationName, setDestinationName] = useState<string>(initialDestinationName || '');
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // 0. Handle Initial Destination Geocoding
  useEffect(() => {
    if (isLoaded && initialDestinationName && !destination) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: initialDestinationName }, (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          setDestination(loc);
          setAlert({ message: `AI-Recommended Route: ${initialDestinationName} ✈️`, type: 'info' });
        }
      });
    }
  }, [isLoaded, initialDestinationName, destination]);

  // 1. Get User Location & Track Movement
  useEffect(() => {
    if (!navigator.geolocation) {
      setAlert({ message: "Geolocation not supported", type: 'warning' });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (!isNavigating) {
            map?.panTo({ lat: latitude, lng: longitude });
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        setAlert({ message: "Unable to find your location. Please check GPS settings.", type: 'warning' });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, isNavigating]);

  // 2. Route Generation
  const calculateRoute = async () => {
    if (!userLocation || !destination) return;

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin: userLocation,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirections(result);
    setDistance(result.routes[0].legs[0].distance?.text || '');
    setDuration(result.routes[0].legs[0].duration?.text || '');
    setIsNavigating(true);
    setAlert({ message: "Getting started... Follow the highlighted route.", type: 'success' });
  };

  // 2.5 Auto-trigger route when both are ready
  useEffect(() => {
    if (userLocation && destination && !isNavigating) {
        calculateRoute();
    }
  }, [userLocation, destination, isNavigating]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        setDestination({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  if (!isLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-beach/30 border-t-beach rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Initializing Advanced Navigation...</p>
        </div>
    </div>
  );

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans">
      {/* Search Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full max-w-lg relative group">
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Where to? (e.g. Gateway of India)"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              className="w-full h-14 pl-14 pr-6 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl focus:ring-4 focus:ring-beach/20 outline-none transition-all text-gray-800 placeholder:text-gray-400 font-semibold"
            />
          </Autocomplete>
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-beach">
            <Navigation className="w-6 h-6" />
          </div>
        </div>

        {!isNavigating && destination && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={calculateRoute}
            className="h-14 px-8 bg-beach text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            Start Live Navigation <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Map Implementation */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={userLocation || center}
        options={options}
        onLoad={onMapLoad}
      >
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#007AFF',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 4,
              scale: 10,
            }}
          />
        )}
        
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#10B981',
                strokeWeight: 8,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Floating Info Card */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-10 left-6 right-6 md:left-1/2 md:-translate-x-1/2 max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-3xl border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-beach/10 rounded-2xl">
                        <MapIcon className="w-6 h-6 text-beach" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Remaining Distance</p>
                        <p className="text-2xl font-black text-gray-900">{distance}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Arrival In</p>
                    <p className="text-2xl font-black text-gray-900">{duration}</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                  onClick={() => setIsNavigating(false)}
                  className="flex-1 h-14 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  End Session
                </button>
                <div className="flex-1 h-14 bg-green-500/10 text-green-600 rounded-2xl font-bold flex items-center justify-center gap-2 border border-green-500/20">
                  <ShieldCheck className="w-5 h-5" /> Live Tracking
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Alerts */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-2 z-20 ${
              alert.type === 'warning' ? 'bg-red-50/90 border-red-100 text-red-600' : 
              alert.type === 'success' ? 'bg-green-50/90 border-green-100 text-green-600' :
              'bg-blue-50/90 border-blue-100 text-blue-600'
            }`}
          >
            <Info className="w-4 h-4" />
            <p className="text-sm font-bold">{alert.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
