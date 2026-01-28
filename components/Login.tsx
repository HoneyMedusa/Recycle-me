
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (details: { name: string; email: string; phone: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim() && formData.phone.trim()) {
      onLogin(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Animated Background Blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      <div className="w-full max-w-md relative z-10 glass-morphism p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bangers tracking-widest text-transparent bg-clip-text funky-gradient mb-2">
            RECYCLE ME
          </h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.3em] text-xs">Join the Green Revolution</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Tshepo Mokoena"
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="tshepo@example.com"
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Cell Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="082 123 4567"
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-4 funky-gradient p-5 rounded-2xl font-bold text-xl shadow-xl shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            Sign Up & Earn
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-loose">
            Secure AI Verification • Instant Estimates<br/>
            Local Recycling Hubs • Verified Payouts
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
