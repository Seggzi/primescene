// src/components/UserLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // your existing user navbar

export default function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* renders user pages like Home, MyList, etc. */}
    </>
  );
}