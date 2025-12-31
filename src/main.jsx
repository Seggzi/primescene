import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { MyListProvider } from './context/MyListContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx'; // ← MUST BE CORRECT PATH
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MyListProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </MyListProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);