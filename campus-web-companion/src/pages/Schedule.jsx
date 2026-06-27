import React, { useState, useEffect, useRef } from 'react';
import { seedScheduleIfEmpty } from '../utils/seedSchedule';

// Seed on first load if schedule is empty
seedScheduleIfEmpty();

/* ── Dynamic Calendar Helper ── */
const getWeekDates = (dayOffset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay(); 
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startDay = new Date(now);
  startDay.setDate(now.getDate() + distanceToMonday + dayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    
    const isToday = new Date().toDateString() === d.toDateString();
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    days.push({
      dateKey,
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
      date: d.getDate(),
      monthName: d.toLocaleString('en-US', { month: 'long' }),
      year: d.getFullYear(),
      isToday
    });
  }
  return days;
};

// Initial empty schedule
const generateInitialSchedule = () => {
  return {};
};

/* ── UI Helpers ── */
const TYPE_STYLES = {
  lecture: { border: 'border-l-blue-500', bg: 'bg-blue-50/50', badge: 'bg-blue-100 text-blue-700' },
  lab:     { border: 'border-l-purple-500', bg: 'bg-purple-50/50', badge: 'bg-purple-100 text-purple-700' },
  studio:  { border: 'border-l-pink-500', bg: 'bg-pink-50/50', badge: 'bg-pink-100 text-pink-700' },
  seminar: { border: 'border-l-amber-500', bg: 'bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' },
  other:   { border: 'border-l-gray-500', bg: 'bg-gray-50', badge: 'bg-gray-200 text-gray-700' },
};

/* ── Mini Calendar Helper ── */
const getMiniCalendarDays = (monthOffset = 0) => {
  const now = new Date();
  now.setMonth(now.getMonth() + monthOffset);
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  
  const startDayOfWeek = firstDay.getDay(); 
  const distanceToMonday = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  for (let i = 0; i < distanceToMonday; i++) {
    const prevD = new Date(year, month, 0 - (distanceToMonday - 1 - i));
    days.push({ date: prevD, isCurrentMonth: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  const remaining = 42 - days.length; 
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  
  return {
    monthName: now.toLocaleString('en-US', { month: 'long' }),
    year,
    days
  };
};

/* ── Event Card Component ── */
function EventCard({ ev, onDelete, dateKey }) {
  const style = TYPE_STYLES[ev.type] || TYPE_STYLES.other;
  
  return (
    <div className={`relative p-4 rounded-xl border border-outline shadow-sm hover:shadow-md transition-all bg-surface border-l-4 ${style.border} group`}>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(dateKey, ev.id); }}
        className="absolute top-1 right-1 w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
        title="Delete Event"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
      </button>

      <div className="flex flex-col gap-2 pr-6">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${style.badge}`}>
            {ev.code}
          </span>
          <span className="text-xs font-bold text-on-surface-variant">{ev.time}</span>
        </div>
        
        <h3 className="font-extrabold text-on-surface text-sm leading-tight">{ev.title}</h3>
        
        <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
          <span className="truncate">{ev.loc}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Schedule Component ── */
export default function Schedule() {
  const [schedule, setSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('campuslink-schedule-v3');
      return saved ? JSON.parse(saved) : generateInitialSchedule();
    } catch {
      return generateInitialSchedule();
    }
  });

  useEffect(() => {
    localStorage.setItem('campuslink-schedule-v3', JSON.stringify(schedule));
  }, [schedule]);

  const [dayOffset, setDayOffset] = useState(0);
  const weekDays = getWeekDates(dayOffset);
  const actualTodayDateKey = getWeekDates(0).find(d => d.isToday)?.dateKey;
  const [selectedDayKey, setSelectedDayKey] = useState(actualTodayDateKey || weekDays[0].dateKey);
  
  // Dropdown Calendar State
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [miniCalMonthOffset, setMiniCalMonthOffset] = useState(0);
  const miniCalendar = getMiniCalendarDays(miniCalMonthOffset);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCalendarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modals
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newDateKey, setNewDateKey] = useState(selectedDayKey);
  const [newCode, setNewCode]       = useState('');
  const [newTitle, setNewTitle]     = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime]     = useState('10:30');
  const [newLoc, setNewLoc]         = useState('');
  const [newType, setNewType]       = useState('lecture');
  
  // Recurring Class State
  const [duration, setDuration] = useState('temporary'); // 'temporary' | 'weekly'
  const [newDayOfWeek, setNewDayOfWeek] = useState('1'); // '0' (Sun) to '6' (Sat)
  const [newUntilDate, setNewUntilDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!weekDays.some(d => d.dateKey === selectedDayKey)) {
      setSelectedDayKey(dayOffset === 0 && actualTodayDateKey ? actualTodayDateKey : weekDays[0].dateKey);
    }
  }, [dayOffset, weekDays, selectedDayKey, actualTodayDateKey]);

  useEffect(() => {
    setNewDateKey(selectedDayKey);
  }, [selectedDayKey]);

  // If the 7 days span two different months, show both, otherwise just one
  const startMonth = weekDays[0].monthName;
  const endMonth = weekDays[6].monthName;
  const startYear = weekDays[0].year;
  const endYear = weekDays[6].year;
  
  const headerTitle = startMonth === endMonth 
    ? `${startMonth} ${startYear}`
    : startYear === endYear 
      ? `${startMonth} - ${endMonth} ${startYear}`
      : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;

  const deleteEvent = (dateKey, eventId) => {
    setSchedule((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((ev) => ev.id !== eventId)
    }));
  };

  const formatTime12hr = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;

    const formattedTime = (newStartTime && newEndTime) 
      ? `${formatTime12hr(newStartTime)} — ${formatTime12hr(newEndTime)}`
      : 'TBA';

    const baseEvent = {
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      time: formattedTime,
      loc: newLoc.trim() || 'TBA',
      type: newType
    };

    setSchedule((prev) => {
      const nextSchedule = { ...prev };

      if (duration === 'temporary') {
        // TEMPORARY: Single event on selected date
        const evId = `ev-${Date.now()}`;
        nextSchedule[newDateKey] = [...(nextSchedule[newDateKey] || []), { ...baseEvent, id: evId }];
      } else {
        // WEEKLY: Recurring events from Today to untilDate on the selected dayOfWeek
        const startD = new Date();
        startD.setHours(0,0,0,0);
        
        const endD = new Date(newUntilDate);
        endD.setHours(23,59,59,999);

        const currentD = new Date(startD);
        let idCounter = 0;

        while (currentD <= endD) {
          if (currentD.getDay() === parseInt(newDayOfWeek)) {
            const dKey = `${currentD.getFullYear()}-${String(currentD.getMonth() + 1).padStart(2, '0')}-${String(currentD.getDate()).padStart(2, '0')}`;
            const evId = `ev-${Date.now()}-${idCounter++}`;
            nextSchedule[dKey] = [...(nextSchedule[dKey] || []), { ...baseEvent, id: evId }];
          }
          currentD.setDate(currentD.getDate() + 1);
        }
      }

      return nextSchedule;
    });

    setNewCode(''); setNewTitle(''); setNewStartTime('09:00'); setNewEndTime('10:30'); setNewLoc(''); setNewType('lecture');
    setDuration('temporary');
    setShowAddForm(false);
  };

  const jumpToDate = (targetDate) => {
    const now = new Date();
    targetDate.setHours(0,0,0,0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayDayOfWeek = today.getDay();
    const distanceToMonday = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + distanceToMonday);
    
    const daysDiff = Math.round((targetDate - currentMonday) / (1000 * 60 * 60 * 24));
    
    setDayOffset(daysDiff);
    const targetDateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    setSelectedDayKey(targetDateKey);
    setShowCalendarDropdown(false);
  };

  return (
    <div className="h-[calc(100vh-128px)] md:h-[calc(100vh-64px)] flex flex-col bg-bg relative">
      
      {/* ── Header Toolbar ── */}
      <div className="bg-surface border-b border-outline px-4 py-4 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 z-20 sticky top-0">
        
        <div>
          <h1 className="font-extrabold text-2xl text-on-surface tracking-tight">Class Schedule</h1>
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">{headerTitle}</p>
        </div>

        <div className="flex items-center justify-end w-full sm:w-auto gap-4">
          <div className="relative flex items-center gap-1 bg-surface-low p-1 rounded-xl border border-outline" ref={dropdownRef}>
            <button onClick={() => setDayOffset(o => o - 1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface hover:shadow-sm text-on-surface-variant transition-all" title="Previous Day">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <button 
              onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${showCalendarDropdown ? 'bg-primary text-white shadow-md' : 'hover:bg-surface hover:shadow-sm text-on-surface-variant'}`} 
              title="Pick Date"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
            </button>

            <button onClick={() => setDayOffset(o => o + 1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface hover:shadow-sm text-on-surface-variant transition-all" title="Next Day">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            {/* Floating Dropdown Calendar */}
            {showCalendarDropdown && (
              <div className="absolute top-full right-0 mt-3 w-[300px] bg-surface rounded-2xl shadow-2xl border border-outline p-6 z-50 fade-up">
                {/* Mini Calendar Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-on-surface text-sm">{miniCalendar.monthName} {miniCalendar.year}</h2>
                  <div className="flex gap-1">
                    <button onClick={() => setMiniCalMonthOffset(o => o - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                    </button>
                    <button onClick={() => setMiniCalMonthOffset(o => o + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-low text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                    </button>
                  </div>
                </div>
                
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-[10px] font-extrabold text-text-faint py-1">{day}</div>
                  ))}
                </div>

                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {miniCalendar.days.map((dayObj, i) => {
                    const dKey = `${dayObj.date.getFullYear()}-${String(dayObj.date.getMonth() + 1).padStart(2, '0')}-${String(dayObj.date.getDate()).padStart(2, '0')}`;
                    const isSelected = weekDays.some(w => w.dateKey === dKey);
                    const isExactSelectedDay = selectedDayKey === dKey;
                    const isToday = new Date().toDateString() === dayObj.date.toDateString();

                    return (
                      <button 
                        key={i}
                        onClick={() => jumpToDate(dayObj.date)}
                        className={`
                          w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold transition-all mx-auto
                          ${!dayObj.isCurrentMonth ? 'text-text-faint opacity-50' : 'text-on-surface hover:bg-surface-low'}
                          ${isSelected && !isExactSelectedDay ? 'bg-primary-light text-primary' : ''}
                          ${isExactSelectedDay ? 'bg-primary text-white hover:opacity-90 shadow-sm' : ''}
                          ${isToday && !isExactSelectedDay ? 'ring-2 ring-inset ring-primary text-primary' : ''}
                        `}
                      >
                        {dayObj.date.getDate()}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => {
                    setDayOffset(0);
                    setMiniCalMonthOffset(0);
                    jumpToDate(new Date());
                  }} 
                  className="mt-6 w-full py-2.5 bg-surface-low hover:bg-surface-med text-on-surface-variant font-bold text-xs rounded-xl transition-colors border border-outline"
                >
                  Jump to Today
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowAddForm(true)}
            className="hidden lg:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Add Class
          </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-grow overflow-auto p-4 md:p-8" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-7xl mx-auto h-full flex flex-col fade-up">
            
            {/* ── MOBILE VIEW: Horizontal Strip + Vertical List ── */}
            <div className="lg:hidden flex flex-col h-full gap-6">
              {/* Day Selector Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                {weekDays.map(({ short, date, isToday, dateKey }) => (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDayKey(dateKey)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border transition-all ${
                      selectedDayKey === dateKey
                        ? 'bg-primary text-white border-primary shadow-md scale-105'
                        : isToday
                        ? 'bg-primary-light text-primary border-primary'
                        : 'bg-surface text-on-surface-variant border-outline hover:bg-surface-low'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase">{short}</span>
                    <span className="text-xl font-black mt-0.5">{date}</span>
                  </button>
                ))}
              </div>

              {/* Selected Day Agenda */}
              <div className="flex-grow">
                <h2 className="font-extrabold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">event_note</span>
                  {weekDays.find(d => d.dateKey === selectedDayKey)?.full}'s Agenda
                </h2>
                
                <div className="space-y-3">
                  {!(schedule[selectedDayKey] && schedule[selectedDayKey].length > 0) ? (
                    <div className="py-16 text-center border-2 border-dashed border-outline rounded-3xl bg-surface-low/50">
                      <span className="material-symbols-outlined text-text-faint text-5xl mb-2">event_busy</span>
                      <p className="font-bold text-on-surface-variant mt-2">No classes scheduled.</p>
                    </div>
                  ) : (
                    schedule[selectedDayKey].map(ev => (
                      <EventCard key={ev.id} ev={ev} onDelete={deleteEvent} dateKey={selectedDayKey} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── DESKTOP VIEW: 7-Column Grid ── */}
            <div className="hidden lg:grid grid-cols-7 gap-4 h-full">
              {weekDays.map((day) => {
                const events = schedule[day.dateKey] || [];
                
                return (
                  <div key={day.dateKey} className="flex flex-col gap-3 h-full">
                    {/* Day Header */}
                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      day.isToday ? 'bg-primary text-white border-primary shadow-md scale-105' : 'bg-surface border-outline text-on-surface-variant'
                    }`}>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest">{day.short}</div>
                      <div className="text-2xl font-black mt-0.5">{day.date}</div>
                    </div>

                    {/* Day Events Column */}
                    <div className="flex flex-col gap-3 flex-grow rounded-2xl">
                      {events.length === 0 ? (
                        <div className="h-24 rounded-xl border-2 border-dashed border-outline bg-surface-low/40 flex items-center justify-center">
                          <span className="text-[10px] font-extrabold text-text-faint uppercase tracking-widest">Free Day</span>
                        </div>
                      ) : (
                        events.map((ev) => <EventCard key={ev.id} ev={ev} onDelete={deleteEvent} dateKey={day.dateKey} />)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* ── Floating Add Button (Mobile Only) ── */}
      <button
        onClick={() => setShowAddForm(true)}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-2 border-white"
        title="Add Event"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* ── Add Event Modal (Dialog) ── */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm fade-up">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline flex items-center justify-between bg-surface-low shrink-0">
              <h2 className="font-extrabold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_calendar</span>
                Schedule a Class
              </h2>
              <button type="button" onClick={() => setShowAddForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-med transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-6 flex flex-col gap-5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              
              {/* Duration Toggle */}
              <div className="flex bg-surface-low p-1 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setDuration('temporary')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${duration === 'temporary' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Temporary (One-off)
                </button>
                <button 
                  type="button" 
                  onClick={() => setDuration('weekly')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${duration === 'weekly' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Weekly (Semester)
                </button>
              </div>

              {duration === 'temporary' ? (
                <div>
                  <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Date</label>
                  <input 
                    type="date"
                    required
                    value={newDateKey} 
                    onChange={(e) => setNewDateKey(e.target.value)}
                    className="input-premium w-full"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Day of Week</label>
                    <select 
                      value={newDayOfWeek} 
                      onChange={(e) => setNewDayOfWeek(e.target.value)}
                      className="input-premium w-full"
                    >
                      <option value="1">Monday</option>
                      <option value="2">Tuesday</option>
                      <option value="3">Wednesday</option>
                      <option value="4">Thursday</option>
                      <option value="5">Friday</option>
                      <option value="6">Saturday</option>
                      <option value="0">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Until Date</label>
                    <input 
                      type="date"
                      required
                      value={newUntilDate} 
                      onChange={(e) => setNewUntilDate(e.target.value)}
                      className="input-premium w-full"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline">
                <div>
                  <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Course Code</label>
                  <input required placeholder="e.g. CS 101" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="input-premium w-full" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} className="input-premium w-full">
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab Session</option>
                    <option value="studio">Studio</option>
                    <option value="seminar">Seminar</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Course Title</label>
                <input required placeholder="e.g. Intro to Computer Science" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input-premium w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Start Time</label>
                    <input type="time" required value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} className="input-premium w-full" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">End Time</label>
                    <input type="time" required value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className="input-premium w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-text-faint uppercase tracking-widest mb-1.5">Location</label>
                  <input placeholder="e.g. Science Block" value={newLoc} onChange={(e) => setNewLoc(e.target.value)} className="input-premium w-full" />
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-outline flex gap-3 justify-end shrink-0">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-low transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-primary hover:opacity-90 shadow-md transition-all">
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
