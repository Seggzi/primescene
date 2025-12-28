import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2 } from 'lucide-react';

const PROFILES = [
  { id: 1, name: 'Admin', icon: 'https://files.catbox.moe/843del.png', color: 'bg-blue-600' },
  { id: 2, name: 'Kids', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png', color: 'bg-red-600' },
];

function ProfileSelection({ onSelect }) {
  const navigate = useNavigate();
  const [isManageMode, setIsManageMode] = useState(false);

  const handleProfileClick = (profile) => {
    // Store selected profile in localStorage for persistence
    localStorage.setItem('activeProfile', JSON.stringify(profile));
    onSelect(profile);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white animate-in fade-in duration-700">
      <h1 className="text-3xl md:text-5xl font-medium mb-10 tracking-tight">Who's watching?</h1>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {PROFILES.map((profile) => (
          <div 
            key={profile.id} 
            className="group flex flex-col items-center cursor-pointer"
            onClick={() => handleProfileClick(profile)}
          >
            <div className={`relative w-28 h-28 md:w-40 md:h-40 rounded-md overflow-hidden transition-all duration-300 group-hover:ring-4 group-hover:ring-white ${profile.color}`}>
              <img 
                src={profile.icon} 
                alt={profile.name} 
                className={`w-full h-full object-cover transition-opacity duration-300 ${isManageMode ? 'opacity-50' : 'opacity-100'}`}
              />
              {isManageMode && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Edit2 size={32} />
                </div>
              )}
            </div>
            <span className="mt-4 text-gray-400 text-lg md:text-xl group-hover:text-white transition-colors">
              {profile.name}
            </span>
          </div>
        ))}

        {/* Add Profile Button */}
        <div className="group flex flex-col items-center cursor-pointer">
          <div className="w-28 h-28 md:w-40 md:h-40 rounded-md flex items-center justify-center border-2 border-transparent bg-zinc-800/20 group-hover:bg-zinc-800 transition-all duration-300">
            <Plus size={48} className="text-zinc-600 group-hover:text-white" />
          </div>
          <span className="mt-4 text-gray-400 text-lg md:text-xl group-hover:text-white">Add Profile</span>
        </div>
      </div>

      <button 
        onClick={() => setIsManageMode(!isManageMode)}
        className="mt-20 px-8 py-2 border border-gray-500 text-gray-500 text-lg uppercase tracking-[0.2em] hover:text-white hover:border-white transition-all"
      >
        {isManageMode ? 'Done' : 'Manage Profiles'}
      </button>
    </div>
  );
}

export default ProfileSelection;