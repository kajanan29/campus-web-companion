import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f9ff' }}>
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden md:flex flex-shrink-0" style={{ width: '260px' }}>
        <Sidebar />
      </aside>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <aside className="absolute left-0 top-0 h-full shadow-2xl overflow-y-auto" style={{ width: '280px' }}>
            <Sidebar onClose={() => setDrawerOpen(false)} mobile />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuToggle={() => setDrawerOpen(true)} />
        {/* Page content — pb-20 on mobile for bottom nav clearance */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
