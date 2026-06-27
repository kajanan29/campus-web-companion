import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/',         icon: 'dashboard',      label: 'Home'     },
  { to: '/schedule', icon: 'calendar_today', label: 'Schedule' },
  { to: '/assignments', icon: 'assignment',  label: 'Assignments' },
  { to: '/profile',  icon: 'person',         label: 'Profile'  },
];

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 py-1 glass-panel border-t border-outline bg-topbar"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      {NAV.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={{ minHeight: '56px', flex: 1 }}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '24px',
                  fontVariationSettings: isActive
                    ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                    : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}
              >
                {icon}
              </span>
              <span className="text-[10px] font-bold tracking-wide leading-tight">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
