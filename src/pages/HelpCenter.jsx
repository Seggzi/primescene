import React from 'react';
import { Search, LifeBuoy, PlayCircle, Lock, Monitor } from 'lucide-react';

export default function HelpCenter() {
  const categories = [
    { icon: <PlayCircle />, title: 'Getting Started', desc: 'How to watch PrimeScene' },
    { icon: <Lock />, title: 'Account & Billing', desc: 'Manage payments and plans' },
    { icon: <Monitor />, title: 'Watching on TV', desc: 'Setup your smart devices' },
    { icon: <LifeBuoy />, title: 'Quick Fixes', desc: 'Solve common login issues' },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Search Header */}
      <div className="bg-[#141414] text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-6">Help Center</h1>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            className="w-full p-4 pl-12 rounded bg-white text-black text-lg outline-none"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold mb-8">Recommended for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="p-6 border rounded-lg hover:shadow-lg transition cursor-pointer">
              <div className="text-red-600 mb-4">{cat.icon}</div>
              <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
              <p className="text-gray-500 text-sm">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-100 p-8 rounded-xl text-center">
          <h2 className="text-xl font-bold mb-2">Want to contact us?</h2>
          <p className="text-gray-600 mb-6">Our agents are available 24/7.</p>
          <button className="bg-red-600 text-white px-10 py-3 font-bold rounded hover:bg-red-700 transition">
            START LIVE CHAT
          </button>
        </div>
      </div>
    </div>
  );
}