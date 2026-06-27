import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';

const DEFAULT_PROFILE = {
  fullName: 'Alex James Sterling',
  studentId: 'CL-2824.8842',
  avatarUrl: null
};

/* ── Time ago helper ── */
const timeAgo = (date) => {
  const now = new Date();
  const diff = (now - new Date(date)) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();

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

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const initials = profile.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'ST';

  const handleBellClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const getIconBg = (color) => color + '18';

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

      {/* Right: Notification Bell + Avatar */}
      <div className="flex items-center gap-1 md:gap-2">

        {/* ── Notification Bell with Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
            aria-label="Notifications"
            id="notif-btn"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant"
              style={{
                fontSize: '22px',
                fontVariationSettings: dropdownOpen ? "'FILL' 1" : "'FILL' 0",
                color: dropdownOpen ? '#2563eb' : undefined,
                transition: 'all 0.2s ease'
              }}
            >
              notifications
            </span>
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  fontSize: '10px',
                  background: '#dc2626',
                  padding: '0 4px',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── Dropdown Panel ── */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-12 z-50 rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
              style={{
                width: '360px',
                background: '#ffffff',
                animation: 'notifSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '20px', color: '#2563eb', fontVariationSettings: "'FILL' 1" }}
                  >
                    notifications
                  </span>
                  <span className="font-bold text-on-surface" style={{ fontSize: '16px' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-white font-bold"
                      style={{ fontSize: '11px', background: '#2563eb' }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-surface-container transition-colors"
                      style={{ color: '#2563eb' }}
                      title="Mark all as read"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
                      title="Clear all notifications"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
                        delete_sweep
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                    <span
                      className="material-symbols-outlined mb-3"
                      style={{ fontSize: '48px', opacity: 0.35 }}
                    >
                      notifications_off
                    </span>
                    <p className="font-bold text-sm">No notifications</p>
                    <p style={{ fontSize: '12px' }}>You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <button
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low"
                      style={{
                        background: notif.read ? 'transparent' : '#eff6ff',
                        borderBottom: idx < notifications.length - 1 ? '1px solid #f0f0f5' : 'none',
                      }}
                    >
                      {/* Icon circle */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: getIconBg(notif.color) }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '20px',
                            color: notif.color,
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          {notif.icon}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-bold text-on-surface leading-snug"
                          style={{ fontSize: '13px' }}
                        >
                          {notif.title}
                        </p>
                        <p
                          className="text-on-surface-variant mt-0.5 leading-snug"
                          style={{ fontSize: '12px' }}
                        >
                          {notif.message}
                        </p>
                        <p
                          className="mt-1 font-bold"
                          style={{ fontSize: '11px', color: notif.color }}
                        >
                          {timeAgo(notif.time)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notif.read && (
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2"
                          style={{ background: '#2563eb' }}
                        />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-outline-variant px-4 py-2.5 text-center">
                  <button
                    className="text-sm font-bold hover:underline"
                    style={{ color: '#2563eb' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    View all activity
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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

      {/* Dropdown slide-in animation */}
      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
}
