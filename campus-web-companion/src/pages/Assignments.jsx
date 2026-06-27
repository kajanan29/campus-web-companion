import React, { useState, useRef, useEffect } from 'react';
import { SEED_ASSIGNMENTS } from '../utils/seedAssignments';

const STATUS_STYLES = {
  Urgent:      'status-red',
  'In Progress':'status-blue',
  Planned:     'status-gray',
  Completed:   'status-green',
};

/* ─── Multi-Photo Camera Modal ────────────────────────────────────── */
function CameraModal({ onClose, onCaptureBatch }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [camError, setCamError] = useState(null);
  const [camLoading, setCamLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setCamLoading(true);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        if (!mounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setCamError(err.message || 'Camera not available.');
        setCamLoading(false);
      });
    return () => {
      mounted = false;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capturePhoto = () => {
    if (capturedPhotos.length >= 10) return alert("Maximum 10 photos allowed.");
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    const MAX_WIDTH = 640;
    const scale = Math.min(1, MAX_WIDTH / (video.videoWidth || 640));
    canvas.width = (video.videoWidth || 640) * scale;
    canvas.height = (video.videoHeight || 480) * scale;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    setCapturedPhotos(prev => [...prev, dataUrl]);
  };

  const removePhoto = (index) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const confirmCapture = () => {
    onCaptureBatch(capturedPhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/90 p-0 sm:p-4 backdrop-blur-md">
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-xl overflow-hidden flex flex-col h-[90vh] sm:h-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '20px' }}>document_scanner</span>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-on-surface">Scan Handwritten Notes</h3>
              <p className="text-[11px] text-on-surface-variant font-medium">{capturedPhotos.length}/10 Pages Captured</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-low flex items-center justify-center text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="relative bg-black shrink-0" style={{ height: '50vh', sm: { height: '320px' } }}>
          {camLoading && !camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2">
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: '36px' }}>sync</span>
              <span className="text-sm font-medium">Initializing Camera...</span>
            </div>
          )}
          {camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center gap-3">
              <span className="material-symbols-outlined text-red-500" style={{ fontSize: '48px' }}>no_photography</span>
              <p className="font-bold text-sm">Camera Error</p>
              <p className="text-xs text-white/70">{camError}</p>
            </div>
          )}
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ display: camError ? 'none' : 'block' }} />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              disabled={!!camError || camLoading || capturedPhotos.length >= 10}
              className="w-16 h-16 rounded-full bg-surface/20 backdrop-blur-md border-4 border-surface flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
            >
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-black" style={{ fontSize: '24px' }}>camera</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-surface-low p-4 shrink-0 border-t border-outline overflow-x-auto flex gap-3 flex-grow content-start items-center" style={{ scrollbarWidth: 'none' }}>
          {capturedPhotos.length === 0 ? (
            <p className="text-xs font-medium text-text-faint italic text-center w-full">No pages captured yet.</p>
          ) : (
            capturedPhotos.map((src, i) => (
              <div key={i} className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-primary shadow-sm group">
                <img src={src} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
                <div className="absolute top-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-bl-md font-bold">{i+1}</div>
                <button 
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-surface flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 border border-outline rounded-xl font-bold text-sm text-on-surface hover:bg-surface-low transition-colors">
            Cancel
          </button>
          <button
            onClick={confirmCapture}
            disabled={capturedPhotos.length === 0}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>task_alt</span>
            Attach {capturedPhotos.length} Pages
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Submission Option Modal ────────────────────────────────────── */
function SubmissionModal({ assignment, onClose, onFileSubmit, onCameraSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSubmit(assignment.id, file.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm fade-up">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 transform transition-all">
        <h3 className="font-extrabold text-lg mb-2 text-on-surface">Submit Assignment</h3>
        <p className="text-xs text-on-surface-variant font-medium mb-6 line-clamp-2 bg-surface-low p-2.5 rounded-lg border border-outline">
          {assignment.title}
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-outline hover:border-primary hover:bg-primary-light transition-all group shadow-sm bg-surface"
          >
            <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center group-hover:bg-primary-light transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl">upload_file</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-on-surface">Upload Document</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">PDF, DOCX, ZIP files</p>
            </div>
          </button>
          
          <button 
            onClick={() => { onClose(); onCameraSelect(assignment.id); }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-outline hover:border-primary hover:bg-primary-light transition-all group shadow-sm bg-surface"
          >
            <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center group-hover:bg-primary-light transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl">document_scanner</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-on-surface">Scan Notes</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">Use camera to capture pages</p>
            </div>
          </button>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        
        <button onClick={onClose} className="w-full mt-6 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors bg-surface-low rounded-xl hover:bg-surface-med">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Assignment Detail View Modal ───────────────────────────────── */
function AssignmentDetailModal({ assignment, onClose, onSubmitClick }) {
  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm fade-up">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline flex justify-between items-start gap-4 bg-surface">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${STATUS_STYLES[assignment.completed ? 'Completed' : assignment.status] || STATUS_STYLES.Planned}`}>
                {assignment.completed ? 'Submitted' : assignment.status}
              </span>
              <span className="text-[11px] font-bold text-on-surface-variant bg-surface-low px-2.5 py-1 rounded-md">
                {assignment.course}
              </span>
            </div>
            <h2 className="font-extrabold text-xl md:text-2xl text-on-surface leading-tight">{assignment.title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-low hover:bg-surface-med flex items-center justify-center shrink-0 transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow bg-surface">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                <span className="material-symbols-outlined text-[20px]">event</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-faint uppercase tracking-wider mb-0.5">Due Date</p>
                <p className="font-bold text-sm text-on-surface">{assignment.due}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <span className="material-symbols-outlined text-[20px]">{assignment.metaIcon}</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-text-faint uppercase tracking-wider mb-0.5">Type</p>
                <p className="font-bold text-sm text-on-surface">{assignment.meta}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-base mb-3 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">subject</span>
              Description
            </h3>
            <div className="bg-surface-low p-5 rounded-2xl border border-outline text-on-surface-variant text-sm leading-relaxed font-medium">
              {assignment.desc}
            </div>
          </div>

          {/* Submissions Display */}
          {assignment.submissions && assignment.submissions.length > 0 && (
            <div>
              <h3 className="font-bold text-base mb-3 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600 text-[20px]">verified</span>
                Your Submission
              </h3>
              <div className="flex flex-wrap gap-3">
                {assignment.submissions.map((sub, idx) => (
                  sub.type === 'file' ? (
                    <div key={idx} className="flex items-center gap-3 bg-surface px-4 py-3 rounded-xl border-2 border-green-200 w-full md:w-auto shadow-sm">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-green-600">description</span>
                      </div>
                      <div className="min-w-0 pr-4">
                        <p className="font-bold text-sm text-on-surface truncate">{sub.name}</p>
                        <p className="text-[11px] font-bold text-text-faint uppercase tracking-wider">Document Uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="relative w-24 h-32 rounded-xl overflow-hidden border-2 border-green-200 shadow-sm">
                      <img src={sub.url} alt="Note" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">{idx+1}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-low border-t border-outline flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-med transition-colors">
            Close
          </button>
          {!assignment.completed && (
            <button 
              onClick={onSubmitClick}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-colors shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>publish</span>
              Submit Assignment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


/* ─── Main Assignments Page ────────────────────────────────────── */
export default function Assignments() {
  /* State */
  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('campuslink-assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_ASSIGNMENTS;
    } catch {
      return SEED_ASSIGNMENTS;
    }
  });

  /* Persistence */
  useEffect(() => {
    localStorage.setItem('campuslink-assignments', JSON.stringify(assignments));
  }, [assignments]);

  /* UI State */
  const [activeFilter, setActiveFilter] = useState('All');
  
  /* Modal States */
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [cameraAssignmentId, setCameraAssignmentId] = useState(null);

  /* Actions */
  const handleSyncAdmin = () => {
    setAssignments(SEED_ASSIGNMENTS);
    // Remove alert for a smoother, more professional UX
  };

  const handleFileSubmit = (assignmentId, fileName) => {
    setAssignments(prev => prev.map(a => 
      a.id === assignmentId ? { 
        ...a, 
        completed: true, 
        status: 'Completed',
        submissions: [...(a.submissions || []), { type: 'file', name: fileName }] 
      } : a
    ));
    if (viewingAssignment?.id === assignmentId) {
      setViewingAssignment(prev => ({...prev, completed: true, status: 'Completed', submissions: [...(prev.submissions||[]), { type: 'file', name: fileName }]}));
    }
  };

  const handleCameraBatchSubmit = (assignmentId, base64Images) => {
    setAssignments(prev => prev.map(a => 
      a.id === assignmentId ? { 
        ...a, 
        completed: true, 
        status: 'Completed',
        submissions: [...(a.submissions || []), ...base64Images.map(img => ({ type: 'photo', url: img }))] 
      } : a
    ));
    if (viewingAssignment?.id === assignmentId) {
      setViewingAssignment(prev => ({...prev, completed: true, status: 'Completed', submissions: [...(prev.submissions||[]), ...base64Images.map(img => ({ type: 'photo', url: img }))]}));
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Completed') return a.completed;
    if (activeFilter === 'Urgent') return a.status === 'Urgent' && !a.completed;
    if (activeFilter === 'In Progress') return a.status === 'In Progress' && !a.completed;
    return true;
  });

  return (
    <div className="h-[calc(100vh-128px)] md:h-[calc(100vh-64px)] flex flex-col bg-bg">
      
      {/* Modals */}
      <AssignmentDetailModal 
        assignment={viewingAssignment} 
        onClose={() => setViewingAssignment(null)} 
        onSubmitClick={() => setSubmittingId(viewingAssignment.id)}
      />

      {submittingId && (
        <SubmissionModal 
          assignment={assignments.find(a => a.id === submittingId)} 
          onClose={() => setSubmittingId(null)} 
          onFileSubmit={handleFileSubmit}
          onCameraSelect={(id) => { setSubmittingId(null); setCameraAssignmentId(id); }}
        />
      )}
      
      {cameraAssignmentId && (
        <CameraModal
          onClose={() => setCameraAssignmentId(null)}
          onCaptureBatch={(photos) => handleCameraBatchSubmit(cameraAssignmentId, photos)}
        />
      )}

      {/* Main Scrollable Area */}
      <div className="flex-grow overflow-auto p-4 md:p-8" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Sleek Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h1 className="font-extrabold text-gray-900 text-3xl md:text-4xl tracking-tight mb-2">
                Assignments
              </h1>
              <p className="text-sm font-medium text-gray-500">
                You have {assignments.filter((a) => !a.completed).length} pending coursework to complete.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSyncAdmin}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-outline text-on-surface font-bold text-sm rounded-xl hover:bg-surface-low transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-gray-500" style={{ fontSize: '20px' }}>sync</span>
                Sync Data
              </button>
            </div>
          </header>

          {/* Action Bar (Filters & Search) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-2 rounded-2xl shadow-sm border border-outline">
            <div className="w-full sm:w-auto flex items-center px-3 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <span className="material-symbols-outlined text-gray-400 mr-2" style={{ fontSize: '20px' }}>search</span>
              <input 
                type="text" 
                placeholder="Search assignments..." 
                className="bg-transparent border-none outline-none py-2.5 text-sm font-medium text-gray-800 w-full sm:w-64"
              />
            </div>
            
            <div className="w-full sm:w-auto relative group">
              <div className="w-full flex items-center justify-between sm:justify-start gap-2 px-4 py-2.5 bg-surface border border-outline rounded-xl cursor-pointer hover:bg-surface-low transition-colors">
                <div className="flex items-center gap-2 flex-grow">
                  <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '20px' }}>filter_list</span>
                  <select 
                    value={activeFilter} 
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-700 cursor-pointer appearance-none"
                  >
                    <option value="All">All Assignments</option>
                    <option value="Urgent">Urgent</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <span className="material-symbols-outlined text-gray-400 pointer-events-none" style={{ fontSize: '20px' }}></span>
              </div>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-surface border border-outline border-dashed rounded-3xl shadow-sm">
                <div className="w-16 h-16 bg-surface-low rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-on-surface-variant text-[32px]">inventory_2</span>
                </div>
                <p className="font-extrabold text-base text-on-surface mb-1">No assignments found</p>
                <p className="text-sm font-medium text-on-surface-variant max-w-xs">There are no assignments matching your criteria. Sync data to refresh.</p>
              </div>
            ) : (
              filteredAssignments.map((a) => (
                <div 
                  key={a.id} 
                  onClick={() => setViewingAssignment(a)}
                  className={`card group relative p-5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    a.completed 
                      ? 'border-outline opacity-75 hover:opacity-100' 
                      : 'border-outline hover:border-primary'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${STATUS_STYLES[a.completed ? 'Completed' : a.status] || STATUS_STYLES.Planned}`}>
                      {a.completed ? 'Submitted' : a.status}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary-light group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </div>
                  </div>

                  <h3 className={`font-extrabold text-lg leading-snug mb-2 ${a.completed ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                    {a.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[11px] font-bold text-on-surface-variant bg-surface-low px-2 py-1 rounded">
                      {a.course}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-outline">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {a.due}
                    </div>

                    {/* Submissions Mini Preview */}
                    {a.submissions && a.submissions.length > 0 && (
                      <div className="flex items-center -space-x-1.5">
                        {a.submissions.slice(0,3).map((sub, i) => (
                          sub.type === 'file' ? (
                            <div key={i} className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center border-2 border-surface z-10" title={sub.name}>
                              <span className="text-[10px] font-bold">{sub.name.charAt(0)}</span>
                            </div>
                          ) : (
                            <img key={i} src={sub.url} alt="sub" className="w-7 h-7 rounded-full object-cover border-2 border-surface z-10" />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
