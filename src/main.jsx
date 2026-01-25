import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { MyListProvider } from './context/MyListContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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