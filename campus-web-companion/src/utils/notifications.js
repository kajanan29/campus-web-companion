/**
 * notifications.js
 * Web Notification API service for CampusLink.
 * 
 * Features:
 *  1. Assignment Deadline Reminders — 1 day before & 3 hours before due
 *  2. Class Starts Soon — 15 minutes before class begins
 */

/* ── Permission Helper ──────────────────────────────────────────── */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

/* ── Send a Notification ────────────────────────────────────────── */
const sendNotification = (title, body, icon = '/favicon.ico', tag = '') => {
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon,
    tag, // same tag = replaces previous notification with same id
    badge: '/favicon.ico',
  });
  // Auto-close after 8 seconds
  setTimeout(() => n.close(), 8000);
};

/* ── Time Parsing ───────────────────────────────────────────────── */
/**
 * Parses "09:00 AM — 10:30 AM" → returns start hour & minute as numbers.
 * Returns null if format is unrecognised.
 */
const parseClassStartTime = (timeStr) => {
  if (!timeStr || timeStr === 'TBA') return null;
  // Match the first time portion e.g. "09:00 AM"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return { h, m };
};

/* ── Assignment Deadline Checker ────────────────────────────────── */
/**
 * Parses due strings like "Oct 24, 11:59 PM" or "2026-10-24".
 * Returns a Date object or null.
 */
const parseDueDate = (dueStr) => {
  if (!dueStr) return null;
  try {
    const d = new Date(dueStr);
    if (!isNaN(d.getTime())) return d;
  } catch (_) {}
  return null;
};

export const checkAssignmentReminders = () => {
  try {
    const raw = localStorage.getItem('campuslink-assignments');
    if (!raw) return;
    const assignments = JSON.parse(raw);
    if (!Array.isArray(assignments)) return;

    const now = new Date();

    assignments.forEach((a) => {
      if (a.completed) return;
      const due = parseDueDate(a.due);
      if (!due) return;

      const msUntilDue = due - now;
      const hoursUntilDue = msUntilDue / (1000 * 60 * 60);

      const tag1day = `assignment-1day-${a.id}`;
      const tag3hr  = `assignment-3hr-${a.id}`;
      const tagNow  = `assignment-overdue-${a.id}`;

      // 24–25 hours window
      if (hoursUntilDue > 0 && hoursUntilDue <= 25 && hoursUntilDue > 23) {
        sendNotification(
          '📚 Assignment Due Tomorrow!',
          `"${a.title}" (${a.course}) is due tomorrow.\nSubmit on time!`,
          '/favicon.ico',
          tag1day
        );
      }

      // 2.5–3.5 hours window
      if (hoursUntilDue > 0 && hoursUntilDue <= 3.5 && hoursUntilDue > 2.5) {
        sendNotification(
          '⚠️ Assignment Due in 3 Hours!',
          `"${a.title}" (${a.course}) is due very soon. Don't forget to submit!`,
          '/favicon.ico',
          tag3hr
        );
      }

      // Overdue (past due by less than 1 hour — reminder to submit late)
      if (hoursUntilDue > -1 && hoursUntilDue <= 0) {
        sendNotification(
          '🚨 Assignment Overdue!',
          `"${a.title}" (${a.course}) was due and hasn't been submitted yet!`,
          '/favicon.ico',
          tagNow
        );
      }
    });
  } catch (err) {
    console.warn('[CampusLink] Assignment reminder check failed:', err);
  }
};

/* ── Class Starts Soon Checker ──────────────────────────────────── */
export const checkClassReminders = () => {
  try {
    const raw = localStorage.getItem('campuslink-schedule-v3');
    if (!raw) return;
    const schedule = JSON.parse(raw);
    if (!schedule) return;

    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const todayClasses = schedule[dateKey];
    if (!todayClasses || todayClasses.length === 0) return;

    todayClasses.forEach((cls) => {
      const parsed = parseClassStartTime(cls.time);
      if (!parsed) return;

      const classStart = new Date(now);
      classStart.setHours(parsed.h, parsed.m, 0, 0);

      const msUntilClass = classStart - now;
      const minsUntilClass = msUntilClass / (1000 * 60);

      // 14–16 minute window (fires once per check cycle)
      if (minsUntilClass > 13 && minsUntilClass <= 16) {
        sendNotification(
          `🔔 Class in 15 Minutes!`,
          `${cls.code} — ${cls.title}\n📍 ${cls.loc}\n⏰ ${cls.time}`,
          '/favicon.ico',
          `class-soon-${cls.id || cls.code}-${dateKey}`
        );
      }
    });
  } catch (err) {
    console.warn('[CampusLink] Class reminder check failed:', err);
  }
};

/* ── Start Notification Service ─────────────────────────────────── */
let _intervalId = null;

/**
 * Call once on app startup.
 * Requests permission then starts a 60-second polling loop.
 */
export const startNotificationService = async () => {
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.info('[CampusLink] Notifications not permitted.');
    return;
  }

  // Run immediately on start
  checkAssignmentReminders();
  checkClassReminders();

  // Then check every 60 seconds
  if (_intervalId) clearInterval(_intervalId);
  _intervalId = setInterval(() => {
    checkAssignmentReminders();
    checkClassReminders();
  }, 60 * 1000);

  console.info('[CampusLink] Notification service started ✅');
};

export const stopNotificationService = () => {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
};
