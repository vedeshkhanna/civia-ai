import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Leaflet default icon path fix for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPickerMarker({ position, setPosition, setLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Custom Pin)`);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function ReportIssue() {
  const navigate = useNavigate();

  const categories = [
    { id: 'Pothole', label: 'Pothole', icon: '🕳️' },
    { id: 'Road Crack', label: 'Road Crack', icon: '⚡' },
    { id: 'Broken Edge', label: 'Broken Curb', icon: '🚧' },
    { id: 'Drainage', label: 'Drainage Overflow', icon: '🌊' },
    { id: 'Open Manhole', label: 'Open Manhole', icon: '⚠️' },
    { id: 'Streetlight', label: 'Streetlight Out', icon: '💡' },
    { id: 'Water Stagnation', label: 'Waterlogging', icon: '💧' },
    { id: 'Garbage Dump', label: 'Garbage Overflow', icon: '🗑️' },
  ];

  const presetLocations = [
    { name: 'Anna Salai, Teynampet', lat: 13.0604, lng: 80.2496 },
    { name: 'Usman Road, T Nagar', lat: 13.0418, lng: 80.2341 },
    { name: 'Besant Nagar 2nd Ave, Adyar', lat: 13.0002, lng: 80.2667 },
    { name: '2nd Avenue, Anna Nagar', lat: 13.0850, lng: 80.2101 },
    { name: 'Poonamallee High Rd, Kilpauk', lat: 13.0784, lng: 80.2412 },
  ];

  const [issueType, setIssueType] = useState('Pothole');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(presetLocations[0].name);
  const [coords, setCoords] = useState([presetLocations[0].lat, presetLocations[0].lng]);
  const [showMapModal, setShowMapModal] = useState(false);

  // Media states
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' | 'video'
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Start Camera Stream
  const startCamera = async (mode = 'photo') => {
    setCameraMode(mode);
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: mode === 'video',
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      showToast('Camera access blocked. Please upload a file instead.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecordingVideo(false);
    setRecordingSeconds(0);
  };

  // Snap Photo
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(dataUrl);
    setPreviewIsVideo(false);
    stopCamera();
  };

  // Start Video Recording
  const startRecording = () => {
    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(streamRef.current, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        if (blob.size > 10 * 1024 * 1024) {
          showToast('Recorded video exceeds the 10MB upload limit.');
          return;
        }
        const videoUrl = URL.createObjectURL(blob);
        setPreviewUrl(videoUrl);
        setPreviewIsVideo(true);
        stopCamera();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Video recorder setup error:', err);
      showToast('Could not initialize video recorder.');
    }
  };

  // Stop Video Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle File Upload with 10MB Guard
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB limit.');
      e.target.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewIsVideo(file.type.startsWith('video/'));
  };

  const handlePresetSelect = (loc) => {
    setLocation(loc.name);
    setCoords([loc.lat, loc.lng]);
  };

  const handleGetLiveGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }
    showToast('Fetching device coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([latitude, longitude]);
        setLocation(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        showToast('Device coordinates applied.');
      },
      (err) => {
        console.error('Geolocation error:', err);
        showToast('Location permission denied or unavailable.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const isInsideChennaiBoundary = (lat, lng) => {
    return lat >= 12.80 && lat <= 13.35 && lng >= 79.95 && lng <= 80.35;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!previewUrl) {
      showToast('Please capture a photo/video or upload evidence first.');
      return;
    }

    if (!description.trim()) {
      showToast('Please provide an issue description.');
      return;
    }

    if (!isInsideChennaiBoundary(coords[0], coords[1])) {
      showToast('Location is outside Chennai GCC operational zone.');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      showToast('Authentication expired. Please sign in again.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    showToast('Submitting to CIVIA AI Ingest Engine...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      let fileBlob;
      if (previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')) {
        const res = await fetch(previewUrl);
        fileBlob = await res.blob();
      } else {
        fileBlob = new Blob(['mock-evidence'], { type: 'image/jpeg' });
      }

      if (fileBlob.size > 10 * 1024 * 1024) {
        throw new Error('Evidence payload exceeds the 10MB limit.');
      }

      const formData = new FormData();
      formData.append('issue_type', issueType);
      formData.append('description', description);
      formData.append('location_name', location);
      formData.append('lat', coords[0]);
      formData.append('lng', coords[1]);
      formData.append(
        'file',
        fileBlob,
        previewIsVideo ? 'evidence.webm' : 'evidence.jpg'
      );

      const response = await fetch('http://localhost:8000/api/report', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        navigate('/login');
        throw new Error('Session invalid. Please log in again.');
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server status ${response.status}`);
      }

      const data = await response.json();

      navigate('/analysis', {
        state: {
          ticketId: data.report.id,
          issueType: data.report.issue_type,
          description: data.report.description,
          location: data.report.location_name,
          region: data.report.region,
          zone: data.report.zone,
          ward: data.report.ward,
          priorityScore: data.report.priority_score,
          severity: data.report.severity,
          confidence: data.report.confidence,
          aiNotes: data.report.ai_notes,
          duplicateDetected: Boolean(data.report.duplicate_detected),
          previewUrl: previewUrl,
          isVideo: previewIsVideo,
        },
      });
    } catch (err) {
      console.error('Submission failed:', err);
      showToast(err.message || 'Submission failed. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] text-[#0b2345] font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#061b3a] text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-[#173865] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1478ff]"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Citizen Sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] bg-[#061b3a] text-white p-6 fixed h-full z-10 select-none">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[13px] bg-[#1478ff] flex items-center justify-center text-xl font-black shadow-[0_4px_14px_rgba(20,120,255,0.4)]">
            C
          </div>
          <div>
            <b className="block text-sm font-bold tracking-tight">CIVIA AI</b>
            <small className="text-[10px] text-[#91a8c7] tracking-wider uppercase font-semibold">
              Citizen Portal
            </small>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          <Link
            to="/home"
            className="text-[#b9c8dd] hover:bg-[#10365f] hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-3"
          >
            <span>⌂</span> Home
          </Link>
          <Link
            to="/report"
            className="bg-[#1478ff] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(20,120,255,0.3)] flex items-center gap-3"
          >
            <span>＋</span> Report Issue
          </Link>
          <Link
            to="/track"
            className="text-[#b9c8dd] hover:bg-[#10365f] hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-3"
          >
            <span>✓</span> Track Status
          </Link>
        </nav>
      </aside>

      {/* Main Form Content */}
      <main className="flex-1 md:ml-[250px] p-5 md:p-8 lg:p-10 max-w-[1240px]">
        <header className="mb-6">
          <div className="text-[10px] tracking-[1.5px] text-[#7790af] font-extrabold uppercase">
            MUNICIPAL GRIEVANCE DESK
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b2345] mt-1">
            Report Civic Defect
          </h1>
          <p className="text-xs text-[#71839a] mt-1">
            Capture photos or record short videos to document road, curb, or drainage hazards.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Media Capture */}
          <div className="lg:col-span-5 bg-white border border-[#e5edf6] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0b2345]">
                Visual Evidence (Photo or Video)
              </span>
              <span className="text-[11px] text-[#71839a]">Max 10MB</span>
            </div>

            {/* Media Viewport */}
            <div className="h-[320px] rounded-xl overflow-hidden bg-[#061b3a] border border-[#dce6f2] relative flex items-center justify-center">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={cameraMode === 'video'}
                    className="w-full h-full object-cover"
                  />
                  {isRecordingVideo && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-2 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                    </div>
                  )}
                </>
              ) : previewUrl ? (
                previewIsVideo ? (
                  <video src={previewUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={previewUrl} alt="Reported issue" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="text-center p-6 select-none">
                  <div className="text-4xl mb-2">📸 🎥</div>
                  <p className="text-xs text-[#91a8c7] font-medium">No photo or video captured</p>
                  <small className="text-[10px] text-[#627d9f] block mt-1">
                    Capture photo, record video, or upload file
                  </small>
                </div>
              )}

              {previewUrl && !isCameraActive && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Camera / Upload Controls */}
            <div className="space-y-2">
              {isCameraActive ? (
                cameraMode === 'photo' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 bg-[#24c26c] hover:bg-[#1faa5e] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm"
                    >
                      Snap Photo 📸
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-white border border-[#d5e2f5] text-[#71839a] py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-[#f4f7fb]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {!isRecordingVideo ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-white"></span> Start Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex-1 bg-[#096cf0] hover:bg-[#0860d5] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm"
                      >
                        ■ Stop & Save Video
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-white border border-[#d5e2f5] text-[#71839a] py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-[#f4f7fb]"
                    >
                      Cancel
                    </button>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera('photo')}
                    className="bg-[#096cf0] hover:bg-[#0860d5] text-white py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>📷</span> Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera('video')}
                    className="bg-[#0b2345] hover:bg-[#133c70] text-white py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>🎥</span> Record Video
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-[#d5e2f5] hover:bg-[#f4f7fb] text-[#1467d3] py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>📁</span> Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Categorization & Geolocation */}
          <div className="lg:col-span-7 bg-white border border-[#e5edf6] rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#0b2345] mb-2 uppercase tracking-wider">
                Defect Category ({categories.length} Types)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIssueType(cat.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                      issueType === cat.id
                        ? 'bg-[#eaf2ff] border-[#1478ff] text-[#1478ff] shadow-sm'
                        : 'bg-[#fbfdff] border-[#dce6f2] text-[#556987] hover:border-[#b8d1ee]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0b2345] uppercase tracking-wider">
                  Location & Coordinates
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGetLiveGPS}
                    className="text-[11px] font-bold text-[#096cf0] hover:underline flex items-center gap-1"
                  >
                    📍 Use My GPS
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setShowMapModal(!showMapModal)}
                    className="text-[11px] font-bold text-[#096cf0] hover:underline flex items-center gap-1"
                  >
                    🗺️ {showMapModal ? 'Hide Pin Picker' : 'Pick on Map'}
                  </button>
                </div>
              </div>

              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Street address or landmark name..."
                className="w-full p-3 border border-[#dce6f2] rounded-xl bg-[#fbfdff] text-xs text-[#173254] outline-none focus:border-[#096cf0]"
              />

              {!isInsideChennaiBoundary(coords[0], coords[1]) && (
                <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                  ⚠️ Coordinates ({coords[0].toFixed(3)}, {coords[1].toFixed(3)}) are outside the Greater Chennai boundary.
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mt-2">
                {presetLocations.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handlePresetSelect(loc)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      location === loc.name
                        ? 'bg-[#096cf0] text-white border-[#096cf0]'
                        : 'bg-[#f4f7fb] text-[#556987] border-[#e2ecf7] hover:bg-[#eef4fb]'
                    }`}
                  >
                    {loc.name.split(',')[0]}
                  </button>
                ))}
              </div>

              {showMapModal && (
                <div className="mt-3 border border-[#dce6f2] rounded-xl overflow-hidden h-[240px] relative">
                  <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold shadow">
                    Click anywhere on the map to drop a pin
                  </div>
                  <MapContainer center={coords} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPickerMarker
                      position={coords}
                      setPosition={setCoords}
                      setLocation={setLocation}
                    />
                  </MapContainer>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b2345] mb-1 uppercase tracking-wider">
                Issue Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the hazard severity, traffic impact, or physical dimension..."
                className="w-full p-3 border border-[#dce6f2] rounded-xl bg-[#fbfdff] text-xs text-[#173254] outline-none focus:border-[#096cf0] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#096cf0] hover:bg-[#0860d5] text-white py-3.5 px-6 rounded-xl font-extrabold shadow-[0_8px_20px_rgba(9,108,240,0.2)] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing & Routing...
                </>
              ) : (
                'Submit Report →'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}