import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_PROFILE = {
  fullName: 'Alex James Sterling',
  studentId: 'CL-2824.8842',
  email: 'a.sterling@campuslink.edu',
  degree: 'BSc. Computer Science',
  department: 'Computing',
  faculty: 'Faculty of Science',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3dHUyNiT0vV-KFseQcdU_UWl7yR1cLegx_p-qFzg88GpYrIKvb3hKYrPoGmdhPhveIjjlO2lVPT1IU0g6VA_moD9H2a-B6y7NUqkXFg_kLwEVyIGjkwjUqV3YFwQJrm_LLpNvpiuI95ypdzlarr6RP4xoIFbkdg3SGlj018kVyT82PCEWyQ3FmxZX-aFfwmEMBCjN-pKN8j6hu8zrFJriJOIHoURgiPIOD4dbOUA1LFgwKMcLdUWH8X-lzvjEVwFt5Q8KN6xUxQLp'
};

export default function Profile() {
  /* ── State Management ── */
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('campuslink-profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const fileInputRef = useRef(null);

  /* ── Persistence ── */
  useEffect(() => {
    localStorage.setItem('campuslink-profile', JSON.stringify(profile));
    localStorage.setItem('campuslink-name', profile.fullName);
    window.dispatchEvent(new Event('profileUpdated'));
  }, [profile]);

  /* ── Actions ── */
  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use a FileReader to convert the image to a Base64 string
    const reader = new FileReader();
    reader.onload = (event) => {
      // Create an image object to resize it before saving to localStorage (preventing quota exceeded errors)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // compress quality
        setTempProfile({ ...tempProfile, avatarUrl: dataUrl });
        
        // If not editing, save immediately
        if (!isEditing) {
          setProfile(prev => ({ ...prev, avatarUrl: dataUrl }));
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-auto bg-slate-50 p-4 md:p-10" style={{ scrollbarWidth: 'none' }}>
      <div className="max-w-5xl mx-auto space-y-8 fade-up">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-gray-900 text-3xl md:text-4xl tracking-tight">Student Profile</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Manage your academic and personal details.</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => { setTempProfile(profile); setIsEditing(true); }}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              Edit Profile
            </button>
          )}
        </div>

        {/* Unified Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          
          {/* Top Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2) 2px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="px-6 md:px-10 pb-10">
            {/* Avatar & Action */}
            <div className="flex justify-between items-end -mt-16 mb-8 relative z-10">
              <div className="relative group">
                <img
                  className={`w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white transition-all ${isEditing ? 'opacity-80' : ''}`}
                  src={isEditing ? tempProfile.avatarUrl : profile.avatarUrl}
                  alt={isEditing ? tempProfile.fullName : profile.fullName}
                />
                
                {/* Always show camera button to easily upload, but make it more prominent in edit mode */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors border-2 border-white"
                  title="Update Photo"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-extrabold border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Currently Enrolled
              </span>
            </div>

            {/* Personal Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Full Name */}
              <div className="md:col-span-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold mb-1.5">Full Name</p>
                {isEditing ? (
                  <input
                    value={tempProfile.fullName}
                    onChange={(e) => setTempProfile({...tempProfile, fullName: e.target.value})}
                    className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 bg-blue-50/50 text-gray-900 transition-all"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="font-extrabold text-2xl text-gray-900">{profile.fullName}</p>
                )}
              </div>

              {/* Grid Fields */}
              {[
                { key: 'studentId', label: 'Student ID', icon: 'badge' },
                { key: 'email', label: 'Email Address', icon: 'mail' },
                { key: 'degree', label: 'Degree', icon: 'school' },
                { key: 'department', label: 'Department', icon: 'domain' },
                { key: 'faculty', label: 'Faculty', icon: 'account_balance' },
              ].map(({ key, label, icon }) => (
                <div key={key} className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isEditing ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold mb-1">{label}</p>
                    {isEditing ? (
                      <input
                        value={tempProfile[key]}
                        onChange={(e) => setTempProfile({...tempProfile, [key]: e.target.value})}
                        className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 bg-blue-50/50 text-gray-900 transition-all"
                      />
                    ) : (
                      <p className="font-bold text-sm text-gray-900 mt-1">{profile[key]}</p>
                    )}
                  </div>
                </div>
              ))}

            </div>

            {/* Edit Mode Actions (Bottom) */}
            {isEditing && (
              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button 
                  onClick={handleCancel} 
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                  Save Changes
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
