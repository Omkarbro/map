import { motion } from 'framer-motion';
import { Sparkles, MapPin, Calendar, Clock, Coffee, BedDouble } from 'lucide-react';

interface ItineraryProps {
  searchData: any;
  categories: string[];
}

export function SmartItinerary({ searchData, categories }: ItineraryProps) {
  // Mock day calculation based on inputs.
  const getDaysCount = () => {
    if (searchData?.startDate && searchData?.endDate) {
      const start = new Date(searchData.startDate);
      const end = new Date(searchData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 3; // default
  };

  const daysCount = getDaysCount();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Custom Itinerary to {searchData?.toLocation || 'Kerala'}</h2>
        <p className="text-gray-600">
          Generated based on your interests: {categories.length > 0 ? categories.join(', ') : 'AI Predicted (Nature & Culture)'} • {searchData?.budget || 'Medium'} Budget
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Real Interactive Map Integration */}
        <div className="w-full md:w-5/12 hidden md:block">
          <div className="sticky top-24 h-[600px] glass rounded-3xl p-2 shadow-lg overflow-hidden relative">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '1.25rem' }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(searchData?.toLocation || 'India')}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Interactive Destination Map"
            ></iframe>
          </div>
        </div>

        {/* Scrollable Itinerary Cards */}
        <div className="w-full md:w-7/12 space-y-6">
          {Array.from({ length: daysCount }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-beach to-nature"></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Day {index + 1}: Exploring {searchData?.toLocation || 'Destination'}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" /> {searchData?.startDate ? new Date(new Date(searchData.startDate).getTime() + index * 86400000).toDateString() : 'TBD'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Pick
                  </span>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                    className="text-[10px] font-bold text-beach hover:underline uppercase tracking-tighter"
                  >
                    Use Live GPS ↗
                  </button>
                </div>
              </div>

              {/* Dynamic Predicted Image */}
              <div className="w-full h-48 md:h-60 rounded-2xl overflow-hidden mb-6 relative group shadow-inner">
                <img
                  src={`https://picsum.photos/seed/${(searchData?.toLocation || 'India').replace(/\s+/g, '')}${index}/800/600`}
                  alt="Predicted location details"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-bold text-lg drop-shadow-md">AI Predicted Experience</p>
                  <p className="text-sm opacity-90">{categories.length > 0 ? categories[0] : 'Curated Travel'} around {searchData?.toLocation || 'this region'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mt-1"><MapPin className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Top Attractions in {searchData?.toLocation || 'Destination'}</h4>
                    <p className="text-sm text-gray-600 mt-1">Curated famous spots and hidden gems specific to {searchData?.toLocation || 'the region'}.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600 mt-1"><Clock className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Best Time to Visit</h4>
                    <p className="text-sm text-gray-600 mt-1">Start at 9:00 AM. Avoid peak afternoon heat.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-1"><Coffee className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Food Recommendations</h4>
                    <p className="text-sm text-gray-600 mt-1">Famous local street food, premium dining at Taj.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mt-1"><BedDouble className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Stay Suggestions</h4>
                    <p className="text-sm text-gray-600 mt-1">Luxury Resort (₹15,000) or Premium Hostel (₹1,500).</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
