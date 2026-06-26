/**
 * seedSchedule.js
 * Generates a realistic university class schedule seed dataset.
 * Coverage: Past 6 months + Next 12 months (≈ 1.5 years total)
 * Result: 100+ scheduled class events stored by date key (YYYY-MM-DD)
 */

/* ── Course Definitions ────────────────────────────────────────────── */
// Each course has: code, title, time, loc, type
// and an array of weekdays it meets (0=Sun, 1=Mon, ... 6=Sat)
const COURSES = [
  {
    code: 'CS302',
    title: 'Data Structures & Algorithms',
    time: '09:00 AM — 10:30 AM',
    loc: 'Engineering Hall 101',
    type: 'lecture',
    days: [1, 3], // Mon, Wed
  },
  {
    code: 'MAT201',
    title: 'Calculus III',
    time: '11:00 AM — 12:30 PM',
    loc: 'Science Block A, Room 204',
    type: 'lecture',
    days: [2, 4], // Tue, Thu
  },
  {
    code: 'ENG101',
    title: 'Creative Writing',
    time: '01:00 PM — 02:30 PM',
    loc: 'Humanities Block, Room 12',
    type: 'studio',
    days: [1, 5], // Mon, Fri
  },
  {
    code: 'PHY101',
    title: 'Introduction to Physics',
    time: '03:00 PM — 04:30 PM',
    loc: 'Physics Lab Block B',
    type: 'lecture',
    days: [2, 4], // Tue, Thu
  },
  {
    code: 'PHY101L',
    title: 'Physics Lab Session',
    time: '10:00 AM — 01:00 PM',
    loc: 'Physics Lab Block B, Room 3',
    type: 'lab',
    days: [5], // Fri only
  },
  {
    code: 'CS402',
    title: 'Human Computer Interaction',
    time: '09:00 AM — 10:30 AM',
    loc: 'Engineering Hall 302',
    type: 'lecture',
    days: [3, 5], // Wed, Fri
  },
  {
    code: 'MKT310',
    title: 'Digital Marketing',
    time: '02:00 PM — 03:30 PM',
    loc: 'Business Block B, Room 7',
    type: 'lecture',
    days: [1, 3], // Mon, Wed
  },
  {
    code: 'CS302L',
    title: 'DSA Lab',
    time: '11:00 AM — 01:00 PM',
    loc: 'Computer Lab 5',
    type: 'lab',
    days: [4], // Thu only
  },
  {
    code: 'SEM001',
    title: 'Research Methods & Academic Writing',
    time: '04:00 PM — 05:30 PM',
    loc: 'Conference Room 1',
    type: 'seminar',
    days: [2], // Tue only
  },
  {
    code: 'ART105',
    title: 'Modern Visual Design',
    time: '11:00 AM — 12:30 PM',
    loc: 'Design Lab 10A',
    type: 'studio',
    days: [1, 4], // Mon, Thu
  },
];

/* ── Date Helpers ─────────────────────────────────────────────────── */
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

/* ── Generator ────────────────────────────────────────────────────── */
export const generateSeedSchedule = () => {
  const schedule = {};

  const now = new Date();
  // Start: 6 months ago
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  // End: 12 months from now
  const end = new Date(now.getFullYear(), now.getMonth() + 12, 28);

  const cursor = new Date(start);
  let idCounter = 1;

  while (cursor <= end) {
    const dayOfWeek = cursor.getDay();
    const dateKey = toDateKey(cursor);

    for (const course of COURSES) {
      if (course.days.includes(dayOfWeek)) {
        if (!schedule[dateKey]) schedule[dateKey] = [];
        schedule[dateKey].push({
          id: `seed-sch-${idCounter++}`,
          code: course.code,
          title: course.title,
          time: course.time,
          loc: course.loc,
          type: course.type,
        });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return schedule;
};

/* ── Seed Helper: Write to localStorage ──────────────────────────── */
/**
 * Call this once in your app (e.g. in index.js or Schedule.jsx)
 * to pre-populate localStorage with seed data.
 * It only seeds if the key does not already exist.
 */
export const seedScheduleIfEmpty = () => {
  const existing = localStorage.getItem('campuslink-schedule-v3');
  if (!existing || JSON.parse(existing) === null || Object.keys(JSON.parse(existing)).length === 0) {
    const seed = generateSeedSchedule();
    localStorage.setItem('campuslink-schedule-v3', JSON.stringify(seed));
  }
};
