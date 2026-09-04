import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitizenReports = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/reports');
        const data = await res.json();
        setReports(data.reports || []);
      } catch (err) {
        console.error('Failed to load activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCitizenReports();
  }, []);

  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] text-[#0b2345] font-sans">
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
            className="bg-[#1478ff] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(20,120,255,0.3)] flex items-center gap-3"
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
        </nav>

        <div className="mt-auto pt-4 border-t border-[#133c70]">
          <button
            onClick={() => navigate('/')}
            className="w-full text-left text-xs text-[#9db0c9] hover:text-white py-2 flex items-center gap-2"
          >
            <span>←</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[250px] p-5 md:p-8 lg:p-10 max-w-[1240px]">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[10px] tracking-[1.5px] text-[#7790af] font-extrabold uppercase">
              GREATER CHENNAI CORPORATION
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b2345] mt-1">
              Welcome back, Citizen
            </h1>
            <p className="text-xs text-[#71839a] mt-1">
              Report civic infrastructure hazards and track municipal repair progress in real time.
            </p>
          </div>

          <button
            onClick={() => navigate('/report')}
            className="bg-[#096cf0] hover:bg-[#0860d5] text-white px-5 py-3 rounded-xl font-extrabold text-xs shadow-[0_6px_18px_rgba(9,108,240,0.25)] flex items-center gap-2 self-start cursor-pointer"
          >
            <span>＋</span> Report New Defect
          </button>
        </header>

        {/* Quick Action & Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div
            onClick={() => navigate('/report')}
            className="bg-gradient-to-br from-[#096cf0] to-[#044bb3] text-white p-6 rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all"
          >
            <span className="text-2xl block mb-2">📸</span>
            <h3 className="font-extrabold text-lg">Instant Defect Report</h3>
            <p className="text-xs text-[#d7e7ff] mt-1">
              Capture a photo or video to trigger automatic AI severity scoring and municipal dispatch.
            </p>
          </div>

          <div
            onClick={() => navigate('/track')}
            className="bg-white border border-[#e5edf6] p-6 rounded-2xl cursor-pointer shadow-sm hover:border-[#b8d4f6] transition-all"
          >
            <span className="text-2xl block mb-2">📍</span>
            <h3 className="font-extrabold text-lg text-[#0b2345]">Track Grievances</h3>
            <p className="text-xs text-[#71839a] mt-1">
              Check live status timelines, crew dispatches, and verification for your local area.
            </p>
          </div>

          <div className="bg-white border border-[#e5edf6] p-6 rounded-2xl shadow-sm">
            <span className="text-2xl block mb-2">🛡️</span>
            <h3 className="font-extrabold text-lg text-[#0b2345]">City Resolution Rate</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#15964d]">
                {totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 100}%
              </span>
              <span className="text-xs text-[#71839a]">
                ({resolvedReports} of {totalReports} resolved)
              </span>
            </div>
            <p className="text-[11px] text-[#71839a] mt-1">
              GCC municipal crews actively resolving flagged hazards.
            </p>
          </div>
        </div>

        {/* Citizen Recent Incident Activity (Read-Only) */}
        <div className="bg-white border border-[#e5edf6] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0b2345]">Recent Community Activity</h3>
              <p className="text-xs text-[#71839a]">Public civic reports currently under repair or resolved</p>
            </div>
            <Link
              to="/track"
              className="text-xs font-bold text-[#096cf0] hover:underline"
            >
              View Full Tracker →
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-[#71839a] py-6 text-center">Loading civic reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-xs text-[#71839a] py-6 text-center">No reports filed yet in your area.</p>
          ) : (
            <div className="divide-y divide-[#edf2f8]">
              {reports.slice(0, 5).map((r) => (
                <div key={r.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#eaf2ff] text-[#096cf0] flex items-center justify-center font-bold text-xs">
                      {r.issue_type === 'Pothole' ? '🕳️' : '⚠️'}
                    </div>
                    <div>
                      <b className="text-xs text-[#0b2345] block">{r.issue_type}</b>
                      <span className="text-[11px] text-[#71839a]">{r.location_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        r.status === 'RESOLVED'
                          ? 'bg-[#eaf8ef] text-[#15964d]'
                          : 'bg-[#eaf2ff] text-[#126de4]'
                      }`}
                    >
                      {r.status}
                    </span>
                    <button
                      onClick={() => navigate('/track')}
                      className="text-xs text-[#71839a] hover:text-[#0b2345] font-semibold"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}