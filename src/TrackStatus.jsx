import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TrackStatus() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await fetch('https://civia-ai-1.onrender.com/api/reports');
      const data = await res.json();
      const list = data.reports || [];
      setReports(list);
      if (list.length > 0 && !selectedTicket) {
        setSelectedTicket(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issue_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const steps = [
    { label: 'Submitted', done: true },
    { label: 'AI Triaged & Ward Routed', done: true },
    { label: 'Crew Dispatched', done: true },
    { label: 'Repairs Completed', done: selectedTicket?.status === 'RESOLVED' },
  ];

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] text-[#0b2345] font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] bg-[#061b3a] text-white p-6 fixed h-full z-10 select-none">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[13px] bg-[#1478ff] flex items-center justify-center text-xl font-black">C</div>
          <div>
            <b className="block text-sm font-bold tracking-tight">CIVIA AI</b>
            <small className="text-[10px] text-[#91a8c7] tracking-wider uppercase font-semibold">Smart City Platform</small>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          <Link to="/home" className="text-[#b9c8dd] hover:bg-[#10365f] hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-3">
            <span>⌂</span> Home
          </Link>
          <Link to="/report" className="text-[#b9c8dd] hover:bg-[#10365f] hover:text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-3">
            <span>＋</span> Report Issue
          </Link>
          <Link to="/track" className="bg-[#1478ff] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md flex items-center gap-3">
            <span>✓</span> Track Status
          </Link>
        </nav>
      </aside>

      <main className="flex-1 md:ml-[250px] p-5 md:p-8 lg:p-10 max-w-[1240px]">
        <header className="mb-6">
          <div className="text-[10px] tracking-[1.5px] text-[#7790af] font-extrabold uppercase">
            CITIZEN RESOLUTION TRACKER
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b2345] mt-1">
            Track Grievance Status
          </h1>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ticket ID (e.g. CIVIA-2026), location, or defect type..."
            className="w-full max-w-lg p-3.5 border border-[#dce6f2] rounded-xl bg-white text-xs text-[#0b2345] shadow-sm outline-none focus:border-[#096cf0]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Ticket Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71839a]">
              Submitted Grievances ({filtered.length})
            </span>
            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-white border-[#096cf0] shadow-[0_4px_16px_rgba(9,108,240,0.12)]'
                    : 'bg-[#fbfdff] border-[#e2ecf7] hover:border-[#cbdff7]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-[#096cf0]">{ticket.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      ticket.status === 'RESOLVED' ? 'bg-[#eaf8ef] text-[#15964d]' : 'bg-[#eaf2ff] text-[#126de4]'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#0b2345]">{ticket.issue_type}</h4>
                <p className="text-xs text-[#71839a] mt-0.5">{ticket.location_name}</p>
              </div>
            ))}
          </div>

          {/* Stepper Details Card */}
          <div className="lg:col-span-7 bg-white border border-[#e5edf6] rounded-2xl p-6 shadow-sm">
            {selectedTicket ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#edf2f8] mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#71839a]">Selected Ticket</span>
                    <h2 className="text-xl font-black font-mono text-[#0b2345]">{selectedTicket.id}</h2>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      selectedTicket.status === 'RESOLVED'
                        ? 'bg-[#eaf8ef] text-[#15964d]'
                        : 'bg-[#eaf2ff] text-[#126de4]'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Visual Step Timeline */}
                <div className="mb-8">
                  <span className="text-[11px] font-bold text-[#71839a] uppercase tracking-wider block mb-4">
                    Lifecycle Timeline
                  </span>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#edf2f8] -translate-y-1/2 z-0"></div>
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-[#096cf0] -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width: selectedTicket.status === 'RESOLVED' ? '100%' : '66%',
                      }}
                    ></div>

                    {steps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            step.done
                              ? 'bg-[#096cf0] border-white text-white shadow-md'
                              : 'bg-white border-[#cbdff7] text-[#71839a]'
                          }`}
                        >
                          {step.done ? '✓' : idx + 1}
                        </div>
                        <span className="text-[10px] font-bold text-[#0b2345] mt-2 text-center max-w-[70px]">
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-3 bg-[#f8fafc] p-4 rounded-xl border border-[#edf2f8] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#71839a] font-medium">Location:</span>
                    <span className="font-bold text-[#0b2345]">{selectedTicket.location_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71839a] font-medium">Jurisdiction:</span>
                    <span className="font-bold text-[#0b2345]">{selectedTicket.zone} · {selectedTicket.ward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71839a] font-medium">AI Priority Index:</span>
                    <span className="font-bold text-[#dc2626]">{selectedTicket.priority_score} / 100</span>
                  </div>
                  <div className="pt-2 border-t border-[#edf2f8]">
                    <span className="text-[#71839a] block mb-1 font-medium">Diagnostic Notes:</span>
                    <p className="text-[#334155] leading-relaxed">{selectedTicket.ai_notes}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#71839a] text-xs">
                Select a ticket on the left to view the live progress stepper.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}