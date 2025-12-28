import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2 } from 'lucide-react';

export default function ProfileSelection() {
  const navigate = useNavigate();
  const [isManaging, setIsManaging] = React.useState(false);

  const profiles = [
    { id: 1, name: 'Admin', color: 'bg-blue-600', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png' },
    { id: 2, name: 'Kids', color: 'bg-red-600', image: 'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-v71hupp9fd9bc9e2.jpg' },
  ];

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white font-sans">
      <h1 className="text-3xl md:text-5xl font-medium mb-10">
        {isManaging ? 'Manage Profiles:' : "Who's watching?"}
      </h1>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {profiles.map((profile) => (
          <div 
            key={profile.id} 
            className="group flex flex-col items-center cursor-pointer relative"
            onClick={() => !isManaging && navigate('/home')}
          >
            <div className="relative">
              <img 
                src={profile.image} 
                alt={profile.name}
                className={`w-28 h-28 md:w-40 md:h-40 rounded object-cover border-2 border-transparent transition-all duration-200 ${
                  isManaging ? 'opacity-50 blur-[1px]' : 'group-hover:border-white'
                }`}
              />
              {isManaging && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Edit2 className="text-white w-8 h-8 md:w-12 md:h-12" />
                </div>
              )}
            </div>
            <span className="mt-4 text-gray-400 text-lg md:text-2xl group-hover:text-white">
              {profile.name}
            </span>
          </div>
        ))}

        {/* Add Profile Button */}
        <div className="group flex flex-col items-center cursor-pointer">
          <div className="w-28 h-28 md:w-40 md:h-40 flex items-center justify-center border-2 border-transparent group-hover:bg-gray-600 rounded transition-all">
            <Plus className="text-gray-500 group-hover:text-white w-16 h-16 md:w-20 md:h-20" />
          </div>
          <span className="mt-4 text-gray-400 text-lg md:text-2xl group-hover:text-white">Add Profile</span>
        </div>
      </div>

      <button 
        onClick={() => setIsManaging(!isManaging)}
        className="mt-16 px-6 py-2 border border-gray-500 text-gray-500 text-lg uppercase tracking-widest hover:border-white hover:text-white transition"
      >
        {isManaging ? 'Done' : 'Manage Profiles'}
      </button>
    </div>
  );
}