import { Tag, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Temple / Spiritual',
  'Nature / Environment',
  'Snow / Mountains',
  'Beaches',
  'Malls / Urban',
  'Historical',
  'Adventure',
  'Food & Culture',
  'Hidden Gems'
];

interface CategoryProps {
  selected: string[];
  onChange: (cats: string[]) => void;
}

export function CategorySelector({ selected, onChange }: CategoryProps) {
  
  const toggleCategory = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  const aiPredict = () => {
    // Mock AI Prediction
    onChange(['Nature / Environment', 'Food & Culture', 'Historical']);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-6 -mt-8 relative z-20">
      <div className="glass rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
             <Tag className="w-4 h-4 text-purple-500" /> Select Travel Style (Or let AI predict)
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
               const isSelected = selected.includes(cat);
               return (
                 <button
                   key={cat}
                   onClick={() => toggleCategory(cat)}
                   className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                     isSelected 
                       ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105'
                       : 'bg-white border text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                   }`}
                 >
                   {cat}
                 </button>
               )
            })}
          </div>
        </div>

        <div className="md:ml-auto md:border-l pl-0 md:pl-6 border-gray-200 flex flex-col items-center">
           <button
             onClick={aiPredict}
             className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-purple-50 transition-colors group cursor-pointer border border-dashed border-gray-300"
           >
              <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:scale-110 transition-transform mb-2">
                 <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-600 group-hover:text-purple-600">Smart Predict</span>
           </button>
        </div>

      </div>
    </div>
  );
}
