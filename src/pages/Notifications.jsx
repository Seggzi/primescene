// src/pages/Notifications.jsx - REAL SUPABASE INTEGRATION

import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  ChevronLeft 
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

function Notifications() {
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    unreadCount 
  } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={28} className="text-green-500" />;
      case 'info': return <Info size={28} className="text-blue-500" />;
      case 'alert': return <AlertCircle size={28} className="text-yellow-500" />;
      default: return <Bell size={28} className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-full hover:bg-white/10 transition"
            >
              <ChevronLeft size={28} />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black flex items-center gap-3">
                <Bell size={40} className="text-red-500" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-red-500 font-medium mt-2">{unreadCount} unread</p>
              )}
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-6 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={clearAll}
                className="px-6 py-3 bg-red-600/20 border border-red-600 rounded-lg hover:bg-red-600/30 transition font-medium text-red-400"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={80} className="mx-auto text-gray-700 mb-6" />
            <h2 className="text-3xl font-bold mb-4">All caught up!</h2>
            <p className="text-gray-400 text-lg">You have no notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={`bg-zinc-900/70 rounded-2xl p-6 border transition-all cursor-pointer hover:bg-zinc-900 ${
                  !notif.read ? 'border-red-600/50 bg-red-900/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className="mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{notif.title}</h3>
                        <p className="text-gray-300 mb-3">{notif.message}</p>
                        <p className="text-sm text-gray-500">{formatTime(notif.created_at)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete logic here if needed
                        }}
                        className="p-2 rounded-full hover:bg-white/10 transition ml-4"
                      >
                        <X size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                {!notif.read && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-400 font-medium">New</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;