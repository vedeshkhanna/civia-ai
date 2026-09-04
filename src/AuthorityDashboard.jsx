import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomPin = (score, isResolved) => {
  const bg = isResolved ? '#15964d' : score > 70 ? '#dc2626' : '#096cf0';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${bg}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">${score}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());

  // Automatically match host (localhost vs 127.0.0.1)
  const API_BASE = `http://${window.location.hostname || '127.0.0.1'}:8000`;

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/reports`, { headers });

      if (res.status === 401 || res.status === 403) {
        console.warn('Authentication rejected, check login status');
        return;
      }

      if (!res.ok) {
        console.error('Fetch reports failed:', res.status);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data.reports) ? data.reports : [];
      setReports(list);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load reports from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (reportId, newStatus) => {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Status update failed');
      }

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  // Resilient filter checking with null checks & case insensitivity
  const filtered = reports.filter((r) => {
    if (!r) return false;

    const matchesZone =
      filterZone === 'ALL' ||
      (r.zone && r.zone.toLowerCase().includes(filterZone.toLowerCase()));

    const currentStatus = (r.status || '').toUpperCase().trim();
    const targetStatus = filterStatus.toUpperCase().trim();

    const matchesStatus =
      targetStatus === 'ALL' || currentStatus === targetStatus;

    return matchesZone && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#0b2345] font-sans">
      <header className="bg-[#061b3a] text-white px-6 md:px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1478ff] flex items-center justify-center font-black">C</div>
          <div>
            <b className="text-sm block">CIVIA AI — Municipal Command</b>
            <small className="text-[10px] text-[#91a8c7]">GCC Ward Officer Console · Synced {lastSync}</small>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="bg-[#123966] hover:bg-[#1b4d88] text-white text-xs px-3 py-1.5 rounded-lg border border-[#215797] transition-all cursor-pointer"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#9db0c9] hover:text-white border border-[#163f70] px-3.5 py-1.5 rounded-lg cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-[#e5edf6] shadow-sm">
            <span className="text-[11px] font-bold text-[#71839a] uppercase">Total Grievances</span>
            <h3 className="text-3xl font-extrabold mt-1">{reports.length}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e5edf6] shadow-sm">
            <span className="text-[11px] font-bold text-[#dc2626] uppercase">Critical Hazards (&gt;70)</span>
            <h3 className="text-3xl font-extrabold text-[#dc2626] mt-1">
              {reports.filter((r) => Number(r.priority_score) > 70).length}
            </h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e5edf6] shadow-sm">
            <span className="text-[11px] font-bold text-[#1467d3] uppercase">Active Repairs</span>
            <h3 className="text-3xl font-extrabold text-[#1467d3] mt-1">
              {reports.filter((r) => (r.status || '').toUpperCase() === 'IN PROGRESS').length}
            </h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e5edf6] shadow-sm">
            <span className="text-[11px] font-bold text-[#15964d] uppercase">Resolved</span>
            <h3 className="text-3xl font-extrabold text-[#15964d] mt-1">
              {reports.filter((r) => (r.status || '').toUpperCase() === 'RESOLVED').length}
            </h3>
          </div>
        </div>

        {/* Filters and View Mode */}
        <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#e2ecf7] text-xs">
              <span className="text-[#71839a] font-bold">Zone:</span>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="outline-none bg-transparent font-semibold cursor-pointer"
              >
                <option value="ALL">All Zones</option>
                <option value="Zone 9">Zone 9 - Teynampet</option>
                <option value="Zone 10">Zone 10 - Kodambakkam</option>
                <option value="Zone 13">Zone 13 - Adyar</option>
                <option value="Zone 8">Zone 8 - Anna Nagar</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#e2ecf7] text-xs">
              <span className="text-[#71839a] font-bold">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="outline-none bg-transparent font-semibold cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-[#e2ecf7]">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#096cf0] text-white' : 'text-[#71839a] hover:text-[#0b2345]'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-[#096cf0] text-white' : 'text-[#71839a] hover:text-[#0b2345]'
              }`}
            >
              🗺️ GIS Map View
            </button>
          </div>
        </div>

        {/* Dynamic Display: Table or Leaflet Map */}
        {viewMode === 'map' ? (
          <div className="bg-white border border-[#e5edf6] rounded-2xl overflow-hidden shadow-sm h-[520px] relative z-0">
            <MapContainer center={[13.0604, 80.2496]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((r) => (
                <Marker
                  key={r.id}
                  position={[parseFloat(r.lat) || 13.0604, parseFloat(r.lng) || 80.2496]}
                  icon={createCustomPin(r.priority_score, (r.status || '').toUpperCase() === 'RESOLVED')}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <b className="text-[#096cf0] block">{r.id} · {r.issue_type}</b>
                      <p className="my-1 font-semibold">{r.location_name}</p>
                      <div className="text-[11px] text-[#556987] mb-2">{r.description}</div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="font-bold">Score: {r.priority_score}</span>
                        <span className="font-bold text-[#15964d]">{r.status}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="bg-white border border-[#e5edf6] rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e5edf6] text-[#71839a] uppercase text-[10px] tracking-wider">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Incident</th>
                  <th className="p-4">Location / Zone</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f8]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#71839a]">
                      Checking municipal database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#71839a]">
                      No grievance records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-[#fbfdff]">
                      <td className="p-4 font-mono font-bold text-[#1467d3]">{r.id}</td>
                      <td className="p-4">
                        <b className="block text-[#0b2345]">{r.issue_type}</b>
                        <span className="text-[#71839a] text-[11px] truncate max-w-[220px] block">
                          {r.description}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-[#0b2345]">{r.location_name}</div>
                        <div className="text-[#71839a] text-[10px]">{r.zone} · {r.ward}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            Number(r.priority_score) > 70 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {r.priority_score} · {r.severity}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            (r.status || '').toUpperCase() === 'RESOLVED'
                              ? 'bg-[#eaf8ef] text-[#15964d]'
                              : 'bg-[#eaf2ff] text-[#126de4]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {(r.status || '').toUpperCase() !== 'RESOLVED' ? (
                          <button
                            onClick={() => updateStatus(r.id, 'RESOLVED')}
                            className="bg-[#15964d] hover:bg-[#128042] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                          >
                            Mark Resolved ✓
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(r.id, 'IN PROGRESS')}
                            className="text-[#71839a] hover:text-[#0b2345] px-2 py-1 underline font-semibold cursor-pointer"
                          >
                            Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}