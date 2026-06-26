import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SEED_ASSIGNMENTS } from '../utils/seedAssignments';
import { SEED_COURSES } from '../utils/seedCourses';

/* ─── Weather helper ───────────────────────────────────────────────── */
const WEATHER_MAP = {
  0:  { icon: 'wb_sunny',        desc: 'Clear Sky'     },
  1:  { icon: 'partly_cloudy_day', desc: 'Mainly Clear'  },
  2:  { icon: 'partly_cloudy_day', desc: 'Partly Cloudy' },
  3:  { icon: 'cloud',            desc: 'Overcast'      },
  45: { icon: 'foggy',            desc: 'Foggy'         },
  48: { icon: 'foggy',            desc: 'Icy Fog'       },
  51: { icon: 'rainy_light',      desc: 'Light Drizzle' },
  61: { icon: 'rainy',            desc: 'Rain'          },
  80: { icon: 'rainy',            desc: 'Showers'       },
  95: { icon: 'thunderstorm',     desc: 'Thunderstorm'  },
};
const getWeatherInfo = (code) => {
  const keys = Object.keys(WEATHER_MAP).map(Number).sort((a, b) => b - a);
  const match = keys.find((k) => code >= k);
  return WEATHER_MAP[match] || { icon: 'wb_sunny', desc: 'Clear' };
};

/* ─── Component ─────────────────────────────────────────────────────── */
export default function Dashboard() {

  /* Weather state */
  const [weather, setWeather]           = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  /* Notification state */
  const [notifStatus, setNotifStatus]   = useState(Notification.permission);

  const gridRef = useRef(null);

  /* ── Fetch weather from Open-Meteo (free, no API key) ── */
  useEffect(() => {
    const controller = new AbortController();
    setWeatherLoading(true);
    setWeatherError(false);

    fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=6.9271&longitude=79.8612' +
        '&current_weather=true&timezone=Asia%2FColombo',
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setWeather(data.current_weather);
        setWeatherLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Weather fetch failed:', err.message);
          setWeatherError(true);
          setWeatherLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  /* ── Staggered fade-in for bento grid ── */
  useEffect(() => {
    const items = gridRef.current?.children;
    if (!items) return;
    Array.from(items).forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 100 * i + 80);
    });
  }, []);

  /* ── Notification API ── */
  const requestNotifications = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    setNotifStatus(perm);
    if (perm === 'granted') {
      new Notification('📚 CampusLink — Deadline Reminder', {
        body: 'C++ Project Phase 1 is due in 4 hours! Head to Tasks to submit.',
        icon: '/logo192.png',
        badge: '/logo192.png',
      });
    } else if (perm === 'denied') {
      alert('Notifications blocked. Please allow them in your browser settings.');
    }
  }, []);

  /* ── Dynamic Data Extraction ── */
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('campuslink-profile')) || { fullName: 'Student' }; } 
    catch { return { fullName: 'Student' }; }
  })();
  const firstName = profile.fullName.split(' ')[0] || 'Student';

  // Courses — fall back to SEED_COURSES if localStorage is empty
  const enrolledCourses = (() => {
    try {
      const courses = JSON.parse(localStorage.getItem('campuslink-courses'));
      if (!courses || !Array.isArray(courses) || courses.length === 0 || !courses[0].code) {
        return SEED_COURSES;
      }
      return courses;
    } catch { return SEED_COURSES; }
  })();

  // Today's classes from Schedule (v3 key)
  const todayClasses = (() => {
    try {
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const scheduleData = JSON.parse(localStorage.getItem('campuslink-schedule-v3')) || {};
      return scheduleData[dateKey] || [];
    } catch { return []; }
  })();

  // Pending assignments — auto-seed from SEED_ASSIGNMENTS if localStorage is empty
  const pendingAssignments = (() => {
    try {
      const raw = localStorage.getItem('campuslink-assignments');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(a => !a.completed);
        }
      }
      // Auto-seed: write seed to localStorage and return it
      localStorage.setItem('campuslink-assignments', JSON.stringify(SEED_ASSIGNMENTS));
      return SEED_ASSIGNMENTS.filter(a => !a.completed);
    } catch { return SEED_ASSIGNMENTS.filter(a => !a.completed); }
  })();

  const tasksToShow = pendingAssignments.slice(0, 3).map(a => ({
    icon: 'assignment', iconBg: 'bg-primary/10', iconColor: 'text-primary',
    title: a.title, sub: a.course, badge: a.status, 
    badgeBg: a.status === 'Urgent' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface'
  }));

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const weatherInfo = weather ? getWeatherInfo(weather.weathercode) : null;

  return (
    <div className="max-w-container-max-width mx-auto p-4 md:p-margin-desktop">
      {/* ── Page Header ── */}
      <section className="mb-6 md:mb-stack-gap-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-bold tracking-tight text-on-surface mb-1" style={{ fontSize: 'clamp(24px, 5vw, 48px)', lineHeight: 1.1 }}>
            Your Day at a Glance
          </h1>
          <p className="text-on-surface-variant" style={{ fontSize: '15px' }}>
            Good morning, {firstName}. You have {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'} today and {pendingAssignments.length} pending {pendingAssignments.length === 1 ? 'assignment' : 'assignments'}.
          </p>
        </div>

        {/* Info Chips */}
        <div className="flex gap-2 flex-wrap">
          {/* Date chip */}
          <div className="px-3 py-2 bg-primary-fixed text-on-primary-fixed rounded-lg font-bold flex items-center gap-2 text-sm" style={{ minHeight: '44px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>wb_sunny</span>
            {today}
          </div>

          {/* Weather widget — live data from Open-Meteo */}
          <div
            className="px-3 py-2 bg-surface-container border border-outline-variant rounded-lg flex items-center gap-2 text-sm"
            style={{ minHeight: '44px' }}
            title="Live weather data from Open-Meteo API"
          >
            {weatherLoading ? (
              <>
                <span className="material-symbols-outlined text-on-surface-variant animate-spin" style={{ fontSize: '16px' }}>sync</span>
                <span className="text-on-surface-variant text-xs">Loading…</span>
              </>
            ) : weatherError ? (
              <>
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>wifi_off</span>
                <span className="text-on-surface-variant text-xs">Offline</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                  {weatherInfo.icon}
                </span>
                <span className="font-bold text-on-surface">{Math.round(weather.temperature)}°C</span>
                <span className="text-on-surface-variant text-xs hidden sm:inline">{weatherInfo.desc}</span>
              </>
            )}
          </div>

          {/* Notification button */}
          <button
            onClick={requestNotifications}
            className="px-3 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-colors"
            style={{
              minHeight: '44px',
              background: notifStatus === 'granted' ? 'rgba(0,98,66,0.1)' : 'rgba(157,67,0,0.1)',
              color:      notifStatus === 'granted' ? '#006242' : '#9d4300',
              border:     notifStatus === 'granted' ? '1px solid rgba(0,98,66,0.2)' : '1px solid rgba(157,67,0,0.2)',
            }}
            title="Enable deadline reminders"
            id="notif-toggle-btn"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: notifStatus === 'granted' ? "'FILL' 1" : "'FILL' 0" }}>
              {notifStatus === 'granted' ? 'notifications_active' : 'notifications'}
            </span>
            <span className="hidden sm:inline">{notifStatus === 'granted' ? 'Reminders On' : 'Reminders'}</span>
          </button>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" ref={gridRef}>

        {/* ── Left Column ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Today's Schedule Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '18px' }}>
                <span className="material-symbols-outlined text-primary">event_upcoming</span>
                Today's Schedule
              </h2>
              <button className="text-primary font-bold hover:underline text-sm px-2" style={{ minHeight: '44px' }}>
                View Weekly
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {todayClasses.length === 0 ? (
                <div className="col-span-full py-8 text-center text-on-surface-variant text-sm border-2 border-dashed border-outline-variant rounded-lg">
                  No classes scheduled for today. Enjoy your free time!
                </div>
              ) : (
                todayClasses.map((cls, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg bg-surface-container border-l-4 ${cls.codeBorder || 'border-primary'} hover:-translate-y-1 transition-all cursor-pointer`}
                    style={{ minHeight: '80px' }}
                  >
                    <p className={`text-xs ${cls.codeColor || 'text-primary'} uppercase font-bold mb-1`}>{cls.time}</p>
                    <h3 className="font-bold text-sm mb-2">{cls.title || cls.subject}</h3>
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{cls.locIcon || 'location_on'}</span>
                      <span>{cls.loc || cls.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enrolled Courses Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '18px' }}>
                <span className="material-symbols-outlined text-primary">school</span>
                Enrolled Courses
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledCourses.map(course => (
                <div key={course.id} className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant hover:shadow-md transition-all bg-white">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${course.color} ${course.textColor}`}>
                    <span className="material-symbols-outlined">{course.icon || 'book'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border border-current ${course.color} ${course.textColor}`}>
                        {course.code}
                      </span>
                      <span className="text-xs text-on-surface-variant font-bold">{course.credits} Credits</span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{course.instructor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Tasks Widget */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="font-bold flex items-center gap-2" style={{ fontSize: '18px' }}>
                <span className="material-symbols-outlined text-secondary">assignment_turned_in</span>
                Assignments
              </h2>
            </div>
            <div className="space-y-2">
              {tasksToShow.length === 0 ? (
                <div className="py-6 text-center text-on-surface-variant text-sm">
                  You're all caught up on assignments!
                </div>
              ) : (
                tasksToShow.map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors" style={{ minHeight: '56px' }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded ${task.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined ${task.iconColor}`} style={{ fontSize: '20px' }}>{task.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{task.title}</p>
                        <p className="text-xs text-on-surface-variant italic">{task.sub}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${task.badgeBg}`}>{task.badge}</span>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-4 py-3 border border-dashed border-outline rounded-lg text-on-surface-variant font-bold hover:bg-surface-container-low transition-all text-sm" style={{ minHeight: '48px' }}>
              View All Assignments
            </button>
          </div>


        </div>
      </div>
    </div>
  );
}
