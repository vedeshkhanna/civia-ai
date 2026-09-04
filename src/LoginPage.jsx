import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('CITIZEN'); // 'CITIZEN' | 'OFFICER'
  const [email, setEmail] = useState('citizen@civia.local');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickFill = (targetRole) => {
    setRole(targetRole);
    setErrorMsg('');
    if (targetRole === 'CITIZEN') {
      setEmail('citizen@civia.local');
      setPassword('demo123');
    } else {
      setEmail('officer@civia.local');
      setPassword('demo123');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Invalid email or password');
      }

      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      if (data.user.role === 'OFFICER') {
        navigate('/authority');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#0b2345] font-sans flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1080px] bg-white rounded-[28px] shadow-[0_12px_40px_rgba(12,43,75,0.07)] border border-[#e2ecf7] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Visual Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#061d40] via-[#092b5a] to-[#0b4077] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#1478ff]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#096cf0]/25 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-[14px] bg-[#1478ff] flex items-center justify-center text-2xl font-black shadow-[0_4px_16px_rgba(20,120,255,0.4)]">
                C
              </div>
              <div>
                <b className="block text-base font-bold tracking-tight">CIVIA AI</b>
                <small className="text-[10px] text-[#91a8c7] tracking-wide uppercase font-semibold">Smart City Infrastructure</small>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider bg-[#123f70]/80 border border-[#225796] text-[#8fd0ff] mb-5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ed573] animate-pulse"></span>
              Municipal AI Engine v4.2
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-[1.15] mb-4">
              Fixing roads.<br />
              <span className="text-[#52adff]">In real time.</span>
            </h1>

            <p className="text-[#c8d8eb] text-xs md:text-sm leading-relaxed mb-6">
              AI-driven triage, spatial deduplication, and automated municipal routing to accelerate civic infrastructure repairs.
            </p>

            <div className="space-y-2.5">
              {[
                { icon: '📸', text: 'Instant damage severity classification' },
                { icon: '🗺️', text: 'GPS & Haversine duplicate prevention' },
                { icon: '⚡', text: 'Direct crew dispatch & live tracking' },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#a9c4e4]">
                  <span className="text-sm">{feat.icon}</span>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#163f70] flex items-center justify-between text-[11px] text-[#8ea7c5] relative z-10">
            <span>Greater Chennai Corporation</span>
            <span className="text-[#2ed573] font-bold">● Network Active</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl font-bold text-[#0b2345]">Sign In</h2>
                <span className="text-[11px] text-[#71839a]">
                  New citizen?{' '}
                  <button 
                    type="button" 
                    onClick={() => alert('Registration is open for all city residents via OTP.')} 
                    className="text-[#096cf0] font-bold hover:underline"
                  >
                    Register
                  </button>
                </span>
              </div>
              <p className="text-xs text-[#71839a]">Choose your role to access your portal and reports.</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-[#f4f7fb] p-1.5 rounded-2xl mb-6 border border-[#e5edf6]">
              <button
                type="button"
                onClick={() => handleQuickFill('CITIZEN')}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  role === 'CITIZEN'
                    ? 'bg-white text-[#096cf0] shadow-[0_2px_10px_rgba(12,43,75,0.06)]'
                    : 'text-[#71839a] hover:text-[#0b2345]'
                }`}
              >
                <span>👤</span> Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('OFFICER')}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  role === 'OFFICER'
                    ? 'bg-white text-[#096cf0] shadow-[0_2px_10px_rgba(12,43,75,0.06)]'
                    : 'text-[#71839a] hover:text-[#0b2345]'
                }`}
              >
                <span>🛡️</span> Authority / Crew
              </button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#0b2345] mb-1.5 uppercase tracking-wider">
                  {role === 'OFFICER' ? 'Municipal Department ID / Email' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'OFFICER' ? 'officer@civia.local' : 'citizen@civia.local'}
                  className="w-full p-3.5 border border-[#dce6f2] rounded-xl bg-[#fbfdff] text-sm text-[#173254] outline-none focus:border-[#096cf0] focus:ring-2 focus:ring-[#096cf0]/10 transition-all placeholder-[#9db0c9]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0b2345] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3.5 border border-[#dce6f2] rounded-xl bg-[#fbfdff] text-sm text-[#173254] outline-none focus:border-[#096cf0] focus:ring-2 focus:ring-[#096cf0]/10 transition-all placeholder-[#9db0c9] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71839a] hover:text-[#0b2345] px-1.5 py-1"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#71839a] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#096cf0] border-[#dce6f2]"
                  />
                  <span>Stay logged in on this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to registered contact.')}
                  className="text-[#096cf0] font-bold hover:underline"
                >
                  Forgot?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#096cf0] hover:bg-[#0860d5] text-white py-3.5 px-6 rounded-xl font-extrabold shadow-[0_8px_20px_rgba(9,108,240,0.22)] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Authenticating...
                  </>
                ) : (
                  `Sign In as ${role === 'CITIZEN' ? 'Citizen' : 'Officer'} →`
                )}
              </button>
            </form>

            {/* Quick Fill Buttons */}
            <div className="mt-8 pt-6 border-t border-[#edf2f8]">
              <span className="block text-[10px] uppercase tracking-wider font-extrabold text-[#71839a] mb-2.5 text-center">
                Demo Quick Fill
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('CITIZEN')}
                  className="flex-1 py-2 px-3 border border-[#dce6f2] bg-[#fbfdff] hover:bg-[#f4f7fb] text-[11px] font-bold text-[#1467d3] rounded-xl transition-all"
                >
                  Fill Citizen Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('OFFICER')}
                  className="flex-1 py-2 px-3 border border-[#dce6f2] bg-[#fbfdff] hover:bg-[#f4f7fb] text-[11px] font-bold text-[#1467d3] rounded-xl transition-all"
                >
                  Fill Officer Demo
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}