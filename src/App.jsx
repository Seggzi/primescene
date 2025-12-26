import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Banner from './components/Banner';

// Placeholder pages
const Home = () => (
  <div>
    <Banner />
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">Home Page</h1>
      <p>Welcome to PrimeScene!</p>
    </div>
  </div>
);

const Shows = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">TV Shows Page</div>;
const Movies = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">Movies Page</div>;
const Games = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">Games Page</div>;
const NewPopular = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">New & Popular</div>;
const MyList = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">My List</div>;
const BrowseLanguages = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">Browse by Languages</div>;
const ManageProfiles = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">Manage Profiles</div>;
const Account = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">Account</div>;
const Help = () => <div className="min-h-screen text-white flex items-center justify-center text-4xl bg-gray-900">Help Center</div>;

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