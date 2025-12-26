import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row'; // We'll add this later

// Placeholder pages for navbar links
function Home() {
  return (
    <div>
      <Banner />
      {/* Rows will go here */}
      <div className="px-8 py-12 text-white">
        <h2 className="text-3xl font-bold mb-8">Home Page</h2>
        <p>Welcome to PrimeScene Home!</p>
      </div>
    </div>
  );
}

function Shows() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">TV Shows Page</div>;
}

function Movies() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">Movies Page</div>;
}

function Games() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">Games Page</div>;
}

function NewPopular() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">New & Popular Page</div>;
}

function MyList() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">My List Page</div>;
}

function BrowseLanguages() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">Browse by Languages Page</div>;
}

function ManageProfiles() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">Manage Profiles</div>;
}

function Account() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">Account Settings</div>;
}

function Help() {
  return <div className="min-h-screen text-white flex items-center justify-center text-4xl">Help Center</div>;
}

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/games" element={<Games />} />
        <Route path="/new-popular" element={<NewPopular />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path="/browse-languages" element={<BrowseLanguages />} />
        <Route path="/manage-profiles" element={<ManageProfiles />} />
        <Route path="/account" element={<Account />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </div>
  );
}

export default App;