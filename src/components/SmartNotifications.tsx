import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  icon: React.ReactNode;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export function SmartNotifications() {
  const [distance, setDistance] = useState(15.2);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showTraffic, setShowTraffic] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDistance((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return parseFloat((prev - 0.1).toFixed(1));
      });
    }, 3000); // Update every 3 seconds for demo purposes

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Distance-based triggers
    if (distance === 5.0) {
      addNotification({
        id: '5km',
        message: 'Only 5 km left ⚠️',
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        type: 'warning'
      });
    } else if (distance === 0) {
      addNotification({
        id: 'reached',
        message: 'You have reached your destination ✅',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        type: 'success'
      });
    }

    // Random traffic event at 10km
    if (distance === 10.0 && !showTraffic) {
      setShowTraffic(true);
      addNotification({
        id: 'traffic',
        message: 'Traffic ahead, rerouting… 🚧',
        icon: <Navigation className="w-5 h-5 text-orange-500 line-through" />, // Simulating rerouting
        type: 'alert'
      });
    }

    // Periodic distance updates (every 2km)
    if (distance > 0 && Math.floor(distance * 10) % 20 === 0) {
        addNotification({
            id: `dist-${distance}`,
            message: `Distance left: ${distance} km`,
            icon: <MapPin className="w-5 h-5 text-blue-500" />,
            type: 'info'
        });
    }
  }, [distance]);

  const addNotification = (notif: Notification) => {
    setNotifications((prev) => [notif, ...prev.slice(0, 2)]);
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 5000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              n.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-900' :
              n.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-900' :
              n.type === 'alert' ? 'bg-orange-50/90 border-orange-200 text-orange-900' :
              'bg-white/90 border-gray-100 text-gray-800'
            }`}
          >
            <div className={`p-2 rounded-xl ${
              n.type === 'warning' ? 'bg-amber-100' :
              n.type === 'success' ? 'bg-green-100' :
              n.type === 'alert' ? 'bg-orange-100' :
              'bg-blue-50'
            }`}>
              {n.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">{n.message}</p>
              {n.id.startsWith('dist') && (
                <div className="w-full bg-blue-100 h-1 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: `${(distance / 15.2) * 100}%` }}
                        className="bg-blue-500 h-full"
                    />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Distance Badge */}
      {distance > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-end bg-beach/20 backdrop-blur-sm border border-beach/30 px-4 py-2 rounded-full flex items-center gap-2 text-beach font-bold text-sm shadow-sm"
          >
            <Navigation className="w-4 h-4 animate-pulse" />
            Live: {distance} km to go
          </motion.div>
      )}
    </div>
  );
}
