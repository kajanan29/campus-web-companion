import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SEED_ASSIGNMENTS } from '../utils/seedAssignments';

const NotificationContext = createContext(null);

/* ── Seed in-app notifications from upcoming assignments ── */
const buildInitialNotifications = () => {
  const now = new Date();
  const notes = [];

  // Pull assignments from localStorage or fall back to seed data
  let assignments = [];
  try {
    const raw = localStorage.getItem('campuslink-assignments');
    const parsed = raw ? JSON.parse(raw) : null;
    assignments = Array.isArray(parsed) && parsed.length ? parsed : SEED_ASSIGNMENTS;
  } catch {
    assignments = SEED_ASSIGNMENTS;
  }

  /* Parse "Jun 29, 11:59 PM" or ISO date strings */
  const parseDue = (str) => {
    if (!str) return null;
    // Try direct parse first
    let d = new Date(str);
    if (!isNaN(d)) return d;
    // Try "Mon DD, HH:MM AM/PM" format
    const match = str.match(/([A-Za-z]+ \d+),?\s*([\d:]+\s*[AP]M)/i);
    if (match) {
      const year = new Date().getFullYear();
      d = new Date(`${match[1]}, ${year} ${match[2]}`);
      if (!isNaN(d)) return d;
    }
    return null;
  };

  assignments
    .filter((a) => !a.completed)
    .forEach((a) => {
      if (!a.due) return;
      const due = parseDue(a.due);
      if (!due) return;
      const hrs = (due - now) / 36e5;

      let icon = 'assignment';
      let color = '#2563eb';
      let message = '';

      if (hrs < 0) {
        icon = 'warning';
        color = '#dc2626';
        message = `Overdue: "${a.title}" — ${a.course}`;
      } else if (hrs <= 24) {
        icon = 'alarm';
        color = '#ea580c';
        message = `Due in ${Math.round(hrs)}h: "${a.title}" — ${a.course}`;
      } else if (hrs <= 72) {
        icon = 'event_upcoming';
        color = '#d97706';
        message = `Due in ${Math.round(hrs / 24)}d: "${a.title}" — ${a.course}`;
      } else {
        icon = 'assignment';
        color = '#2563eb';
        message = `Due ${a.due}: "${a.title}" — ${a.course}`;
      }

      notes.push({
        id: `seed-notif-${a.id}`,
        icon,
        color,
        title: a.status === 'Urgent' ? '⚠️ Urgent Deadline' : '📚 Assignment Reminder',
        message,
        time: now,        // use "now" so timeAgo shows "Just now" correctly
        read: false,
        type: 'assignment',
      });
    });

  // Sort by urgency (closest deadline first)
  notes.sort((a, b) => a.time - b.time);

  // Add a welcome notification
  notes.unshift({
    id: 'welcome-notif',
    icon: 'school',
    color: '#2563eb',
    title: '👋 Welcome to CampusLink',
    message: 'Your academic hub is ready. Check your assignments and schedule!',
    time: new Date(),
    read: false,
    type: 'system',
  });

  return notes;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => buildInitialNotifications());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        time: new Date(),
        read: false,
        icon: 'notifications',
        color: '#2563eb',
        ...notif,
      },
      ...prev,
    ]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAllRead, markRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
