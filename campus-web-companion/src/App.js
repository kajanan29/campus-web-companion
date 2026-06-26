import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import { startNotificationService } from './utils/notifications';
import './index.css';

export default function App() {
  useEffect(() => {
    startNotificationService();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/profile"  element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
