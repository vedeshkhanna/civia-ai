import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function AIAnalysis() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Fallback defaults if accessed directly or during demo preview
  const data = {
    ticketId: state?.ticketId || 'CIVIA-2026-LIVE',
    issueType: state?.issueType || 'Pothole',
    description: state?.description || 'Structural road defect detected with immediate hazard risk.',
    location: state?.location || 'Anna Salai, Chennai, Tamil Nadu',
    region: state?.region || 'Chennai Central',
    zone: state?.zone || 'Zone 9 - Teynampet',
    ward: state?.ward || 'Ward 118',
    priorityScore: state?.priorityScore ?? 88,
    severity: state?.severity || 'High',
    confidence: state?.confidence 
      ? `${Math.round(state.confidence * 100)}%` 
      : '94%',
    duplicateDetected: state?.duplicateDetected ?? false,
    aiNotes: state?.aiNotes || 'AI visual triage verified road surface disruption and assigned priority based on traffic density and structural depth.',
    previewUrl: state?.previewUrl || null,
    isVideo: state?.isVideo || false,
  };

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] text-[#0b2345] font-sans">
      {/* Dark Navy Sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] bg-[#061b3a] text-white p-6 fixed h-full z-10 select-none">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[13px] bg-[#1478ff] flex items-center justify-center text-xl font-black shadow-[0_4px_14px_rgba(20,120,255,0.4)]">
            C
          </div>
          <div>
            <b className="block text-sm font-bold tracking-tight">CIVIA AI</b>
            <small className="text-[10px] text-[#91a8c7] tracking-wider uppercase font-semibold">Smart City Platform</small>
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
            className="text-[#b9c8dd] hover:bg-[#10365f] hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-3"
          >
            <span>＋</span> Report Issue
          </Link>
          <Link
            to="/track"
            className="text-[#b9c8dd] hover:bg-[#10365f] hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-3"
          >
            <span>✓</span> Track Status
          </Link>
          <Link
            to="/track"
            className="text-[#b9c8dd] hover:bg-[#10365f] hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-3"
          >
            <span>▤</span> My Reports
          </Link>
        </nav>

        <div className="mt-auto bg-[#0a254c] border border-[#133c70] p-3.5 rounded-xl text-[#9db0c9] text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#2ed573] animate-pulse"></span>
            <span className="font-bold text-white text-[11px]">Gemini Vision Online</span>
          </div>
          <p className="text-[10px] leading-tight text-[#8aa3c4]">Municipal triage engine operating at nominal latency.</p>
        </div>
      </aside>

      {/* Main Diagnostic Area */}
      <main className="flex-1 md:ml-[250px] p-5 md:p-8 lg:p-10 max-w-[1240px]">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[10px] tracking-[1.5px] text-[#7790af] font-extrabold uppercase">
              SMART CITY MUNICIPAL DISPATCH
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b2345] mt-1">
              AI Triage Diagnostic
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#e9f8ef] border border-[#c3eed4] text-[#15944f] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#15944f]"></span>
              Diagnostic Complete
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Visual Capture & Region Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#e5edf6] rounded-2xl p-4 shadow-[0_8px_25px_rgba(12,43,75,0.04)]">
              <div className="h-[340px] rounded-xl overflow-hidden bg-[#061b3a] relative flex items-center justify-center border border-[#dce6f2]">
                {data.previewUrl ? (
                  data.isVideo ? (
                    <video src={data.previewUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={data.previewUrl} alt="Visual defect evidence" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="text-center p-6">
                    <div className="text-3xl mb-2">📸</div>
                    <span className="text-[#91a8c7] text-xs font-mono">No visual preview attached</span>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 bg-[#061b3a]/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white font-mono font-bold shadow-md">
                  Ticket #{data.ticketId}
                </div>
              </div>

              {/* Geographic & Municipal Ward Routing */}
              <div className="mt-4 p-3.5 bg-[#f8fafc] rounded-xl border border-[#edf2f7]">
                <span className="text-[#71839a] block text-[10px] uppercase font-extrabold tracking-wider mb-1">
                  Recorded Location & Municipal Jurisdiction
                </span>
                <p className="font-bold text-sm text-[#0b2345] mb-2">{data.location}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#eaf2ff] border border-[#d3e5ff] text-[#1467d3] px-2.5 py-1 rounded-md text-[11px] font-bold">
                    {data.region}
                  </span>
                  <span className="bg-[#eef2f6] border border-[#e2e8f0] text-[#475569] px-2.5 py-1 rounded-md text-[11px] font-bold">
                    {data.zone}
                  </span>
                  <span className="bg-[#eef2f6] border border-[#e2e8f0] text-[#475569] px-2.5 py-1 rounded-md text-[11px] font-bold">
                    {data.ward}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Triage Assessment Details */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Priority Score Card */}
            <div className="bg-white border border-[#e5edf6] rounded-2xl p-6 shadow-[0_8px_25px_rgba(12,43,75,0.04)] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71839a] font-extrabold uppercase tracking-wider block">
                  Automated Priority Index
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-4xl font-black text-[#0b2345]">{data.priorityScore}</h3>
                  <span className="text-[#71839a] font-bold text-sm">/ 100</span>
                </div>
                <p className="text-xs text-[#71839a] mt-1">
                  Computed from structural defect magnitude, traffic density, and proximity.
                </p>
              </div>

              <div
                className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase border ${
                  data.priorityScore >= 75
                    ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                    : data.priorityScore >= 50
                    ? 'bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]'
                    : 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'
                }`}
              >
                {data.severity} Severity
              </div>
            </div>

            {/* Gemini Vision Explanation Pill */}
            {data.aiNotes && (
              <div className="bg-[#f0f7ff] border border-[#cfe2ff] rounded-2xl p-4 text-xs text-[#0c4a6e] flex items-start gap-3">
                <span className="text-lg">🤖</span>
                <div>
                  <b className="font-extrabold block uppercase tracking-wider text-[10px] text-[#0284c7]">
                    Gemini Multimodal Vision Assessment
                  </b>
                  <p className="mt-0.5 text-xs text-[#334155] leading-relaxed">{data.aiNotes}</p>
                </div>
              </div>
            )}

            {/* Diagnostic Metrics Matrix */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#e5edf6] rounded-2xl p-5 shadow-[0_8px_25px_rgba(12,43,75,0.04)]">
                <span className="text-[11px] text-[#71839a] font-extrabold uppercase tracking-wider">
                  Classification
                </span>
                <b className="block text-lg font-extrabold text-[#0b2345] mt-1">{data.issueType}</b>
                <span className="text-xs text-[#15964d] font-bold mt-1 inline-block">
                  Confidence: {data.confidence}
                </span>
              </div>

              <div className="bg-white border border-[#e5edf6] rounded-2xl p-5 shadow-[0_8px_25px_rgba(12,43,75,0.04)]">
                <span className="text-[11px] text-[#71839a] font-extrabold uppercase tracking-wider">
                  Spatial Deduplication
                </span>
                <b className={`block text-lg font-extrabold mt-1 ${data.duplicateDetected ? 'text-[#dc2626]' : 'text-[#0b2345]'}`}>
                  {data.duplicateDetected ? 'Duplicate Incident' : 'Unique Incident'}
                </b>
                <span className="text-xs text-[#71839a] mt-1 block">
                  {data.duplicateDetected
                    ? 'Flagged within 35m radius of open report'
                    : 'No conflicting geo-coordinates found'}
                </span>
              </div>
            </div>

            {/* Citizen Description Card */}
            <div className="bg-white border border-[#e5edf6] rounded-2xl p-5 shadow-[0_8px_25px_rgba(12,43,75,0.04)]">
              <span className="text-[11px] text-[#71839a] font-extrabold uppercase tracking-wider block mb-1">
                Citizen Incident Description
              </span>
              <p className="text-xs md:text-sm text-[#334155] leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/track')}
                className="flex-1 bg-[#096cf0] hover:bg-[#0860d5] text-white py-3.5 px-6 rounded-xl font-extrabold shadow-[0_8px_20px_rgba(9,108,240,0.18)] transition-all text-sm cursor-pointer text-center"
              >
                Track Live Ticket Status →
              </button>
              <button
                onClick={() => navigate('/report')}
                className="bg-white border border-[#d5e2f5] hover:bg-[#f4f7fb] text-[#1467d3] py-3.5 px-6 rounded-xl font-bold text-sm transition-all cursor-pointer text-center"
              >
                Report Another Issue
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}