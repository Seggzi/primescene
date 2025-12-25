import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Banner from './components/Banner';

function Home() {
  return (
    <div>
      <Banner />
      {/* Add your rows back here later */}
      <div className="px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Trending Now</h2>
        <p className="text-white">Home content - rows will go here</p>
      </div>
    </div>
  );
}

function ManageProfiles() {
  return <div className="h-screen flex items-center justify-center text-white text-2xl">Manage Profiles Page</div>;
}

function Account() {
  return <div className="h-screen flex items-center justify-center text-white text-2xl">Account Page</div>;
}

function Help() {
  return <div className="h-screen flex items-center justify-center text-white text-2xl">Help Center Page</div>;
}

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manage-profiles" element={<ManageProfiles />} />
        <Route path="/account" element={<Account />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </div>
  );
}

export default App;