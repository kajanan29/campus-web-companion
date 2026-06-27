import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const DEFAULT_PROFILE = {
  fullName: 'Alex James Sterling',
  studentId: 'CL-2824.8842',
  avatarUrl: null
};

const NAV_ITEMS = [
  { to: '/',         icon: 'dashboard',       label: 'Dashboard'  },
  { to: '/schedule', icon: 'calendar_today',  label: 'Schedule'   },
  { to: '/assignments', icon: 'assignment',   label: 'Assignments' },
  { to: '/profile',  icon: 'person',          label: 'Profile'    },
];



export default function Sidebar({ onClose, mobile }) {
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
    <nav
      className="flex flex-col h-full border-r border-outline-variant"
      style={{ background: '#ffffff', width: mobile ? '280px' : '260px' }}
    >
      {/* Brand / Close Row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant flex-shrink-0" style={{ height: '64px' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)' }}
          >
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <div>
            <p className="font-bold text-on-surface leading-tight" style={{ fontSize: '16px' }}>CampusLink</p>
            <p className="text-on-surface-variant" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Student Portal</p>
          </div>
        </div>
        {/* Close button — mobile drawer only */}
        {mobile && (
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-grow overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 rounded-xl font-bold transition-all group ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
            style={{ minHeight: '48px' }}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{
                    fontSize: '22px',
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 500"
                      : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {icon}
                </span>
                <span style={{ fontSize: '14px' }}>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="py-4 px-3 border-t border-outline-variant flex-shrink-0">
        {/* User chip */}
        <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-xl bg-surface-container-low" style={{ minHeight: '52px' }}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-outline-variant" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ fontSize: '11px', background: 'linear-gradient(135deg, #004ac6, #006242)' }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate" style={{ fontSize: '13px' }}>{profile.fullName}</p>
            <p className="text-on-surface-variant truncate" style={{ fontSize: '11px' }}>{profile.studentId}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
