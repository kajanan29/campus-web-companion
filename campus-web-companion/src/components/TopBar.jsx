import React, { useState, useEffect } from 'react';

const DEFAULT_PROFILE = {
  fullName: 'Alex James Sterling',
  studentId: 'CL-2824.8842',
  avatarUrl: null
};

export default function TopBar({ onMenuToggle }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('campuslink-profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('campuslink-profile');
        if (saved) setProfile(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('profileUpdated', handleUpdate);
    return () => window.removeEventListener('profileUpdated', handleUpdate);
  }, []);

  const initials = profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 border-b border-outline-variant flex-shrink-0"
      style={{ height: '64px', background: '#ffffff' }}
    >
      {/* Left: Hamburger (mobile only) + Brand */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
          aria-label="Open navigation menu"
          id="hamburger-btn"
        >
          <span className="material-symbols-outlined text-on-surface-variant">menu</span>
        </button>

        {/* Brand — mobile only, desktop brand is in sidebar */}
        <div className="md:hidden flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)' }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <span className="font-bold text-on-surface text-sm">CampusLink</span>
        </div>
      </div>

      {/* Center: Search — hidden on small mobile */}
      <div className="hidden sm:flex flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            style={{ fontSize: '18px' }}
          >
            search
          </span>
          <input
            type="search"
            placeholder="Search classes, tasks..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            style={{ minHeight: '40px' }}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right: Icons + Avatar */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Notification bell */}
        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
          aria-label="Notifications"
          id="notif-btn"
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>
            notifications
          </span>
          {/* Red dot badge */}
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: '#ba1a1a' }}
          />
        </button>

        {/* Settings */}
        <button
          className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>
            settings
          </span>
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 mx-1" style={{ background: '#c3c6d7' }} />

        {/* Avatar */}
        <button
          className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-surface-container transition-colors"
          aria-label="User profile"
          style={{ minHeight: '44px' }}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-outline-variant" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #004ac6, #006242)' }}
            >
              {initials}
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="font-bold text-xs text-on-surface leading-tight">{profile.fullName}</p>
            <p className="text-on-surface-variant" style={{ fontSize: '10px' }}>{profile.studentId}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
