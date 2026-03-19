import { Plane, User, Menu } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed w-full z-50 glass py-4 px-6 md:px-12 flex justify-between items-center top-0 transition-all duration-300">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="bg-nature/10 p-2 rounded-xl text-nature">
          <Plane className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nature to-beach">
          WanderIndia AI
        </span>
      </div>

      <div className="hidden md:flex gap-8 items-center font-medium text-gray-600">
        <a href="#" className="hover:text-nature transition-colors">Destinations</a>
        <a href="#" className="hover:text-nature transition-colors">My Itineraries</a>
        <a href="#" className="hover:text-nature transition-colors">AI Predictor</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors text-sm font-semibold text-gray-700">
          <User className="w-4 h-4" /> Sign In
        </button>
        <button className="md:hidden p-2 text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
