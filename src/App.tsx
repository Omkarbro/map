import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSearchSection } from './components/HeroSearchSection';
import { CategorySelector } from './components/CategorySelector';
import { SmartItinerary } from './components/SmartItinerary';
import { SmartNotifications } from './components/SmartNotifications';
import { LiveNavigation } from './components/LiveNavigation';
import { TravelCostPanel } from './components/TravelCostPanel';
import { Loader2, Map as MapIcon, Calendar } from 'lucide-react';

function App() {
  const [searchData, setSearchData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'home' | 'navigation'>('home');

  const handleSearch = (data: any) => {
    setIsGenerating(true);
    // Simulate AI loading delay
    setTimeout(() => {
      setSearchData(data);
      setIsGenerating(false);
      
      // Scroll to itinerary
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }, 2000);
  };

  return (
    <div className="min-h-screen relative font-sans text-gray-900 bg-gray-50">
      <Navbar />

      {view === 'navigation' ? (
        <div className="relative">
          <button 
            onClick={() => setView('home')}
            className="absolute top-24 left-6 z-20 px-4 py-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg flex items-center gap-2 font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Calendar className="w-4 h-4" /> Back to Itinerary
          </button>
          <LiveNavigation initialDestinationName={searchData?.toLocation} />
        </div>
      ) : (
        <main className="pb-24">
          {/* Top Hero Section includes the manually typed inputs */}
          <HeroSearchSection onSearch={handleSearch} />
          
          {/* Category Pill selection below the hero box */}
          <CategorySelector selected={categories} onChange={setCategories} />

          {/* View Switcher if itinerary exists */}
          {searchData && !isGenerating && (
            <div className="max-w-7xl mx-auto px-6 mt-8 flex justify-end">
                <button 
                  onClick={() => setView('navigation')}
                  className="px-6 py-3 bg-beach text-white rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <MapIcon className="w-5 h-5" /> Switch to Live GPS Navigation
                </button>
            </div>
          )}

          {/* Loading Overlay */}
          {isGenerating && (
            <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-beach animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">AI is drafting your itinerary...</h2>
              <p className="text-gray-500 mt-2">Connecting map data, predicting preferences, finding hidden gems.</p>
            </div>
          )}

          {/* Result Output */}
          {searchData && !isGenerating && (
            <div className="mt-12 bg-white/50 border-t border-gray-200/50 pt-12">
              <SmartItinerary searchData={searchData} categories={categories} />

              {/* Route & Cost Comparison Panel */}
              {searchData.fromLocation && searchData.toLocation && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-t border-gray-200/60">
                  <TravelCostPanel
                    fromLocation={searchData.fromLocation}
                    toLocation={searchData.toLocation}
                    days={searchData.days ?? 1}
                  />
                </div>
              )}

              <SmartNotifications />
            </div>
          )}
        </main>
      )}
      
      {/* Simple Footer */}
      <footer className="w-full bg-white py-8 border-t border-gray-200 text-center text-gray-500 text-sm mt-auto">
        <p>© 2026 WanderIndia AI. Conceptualized and designed for a premium travel experience.</p>
      </footer>
    </div>
  );
}

export default App;
