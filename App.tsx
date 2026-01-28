
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Marketplace from './components/Marketplace';
import HazardReporting from './components/HazardReporting';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Games from './components/Games';
import { UserProfile, Badge, DEFAULT_AVATAR, SaleTransaction, WasteType } from './types';

const INITIAL_BADGES: Badge[] = [
  { id: 'newbie', name: 'New Recruit', icon: '🌱', description: 'Earned your first Eco Points', unlocked: false, color: 'from-green-400 to-emerald-600', reward: 'R10 Checkers Voucher' },
  { id: 'plastic_pro', name: 'Plastic Pro', icon: '🥤', description: 'Recycled plastic 5 times', unlocked: false, color: 'from-blue-400 to-indigo-600', reward: 'R50 Woolworths Card' },
  { id: 'hazard_hero', name: 'Hazard Hero', icon: '🛡️', description: 'Reported 3 environmental hazards', unlocked: false, color: 'from-red-400 to-pink-600', reward: 'Free Vida e Caffè Coffee' },
  { id: 'waste_warrior', name: 'Waste Warrior', icon: '⚔️', description: 'Reached 1000 points', unlocked: false, color: 'from-purple-400 to-fuchsia-600', reward: 'R100 Takealot Voucher' },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'reporting' | 'dashboard' | 'games'>('marketplace');
  
  const [user, setUser] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    avatar: DEFAULT_AVATAR,
    earnings: 0,
    reportsCount: 0,
    points: 0,
    badges: INITIAL_BADGES,
    salesHistory: [],
    isMunicipal: false
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('recycle_me_user_v4');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Ensure salesHistory exists for legacy saves
      setUser({ ...parsed, salesHistory: parsed.salesHistory || [] });
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (details: { name: string; email: string; phone: string }) => {
    const newUser = { ...user, ...details };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('recycle_me_user_v4', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('recycle_me_user_v4');
    setIsLoggedIn(false);
    setUser({
      name: '',
      email: '',
      phone: '',
      avatar: DEFAULT_AVATAR,
      earnings: 0,
      reportsCount: 0,
      points: 0,
      badges: INITIAL_BADGES,
      salesHistory: [],
      isMunicipal: false
    });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('recycle_me_user_v4', JSON.stringify(updatedUser));
  };

  const saveUser = (newProfile: UserProfile) => {
    const updatedBadges = [...newProfile.badges];
    
    if (newProfile.points > 0 && !updatedBadges.find(b => b.id === 'newbie')?.unlocked) {
      const idx = updatedBadges.findIndex(b => b.id === 'newbie');
      updatedBadges[idx] = { ...updatedBadges[idx], unlocked: true };
    }

    if (newProfile.reportsCount >= 3 && !updatedBadges.find(b => b.id === 'hazard_hero')?.unlocked) {
      const idx = updatedBadges.findIndex(b => b.id === 'hazard_hero');
      updatedBadges[idx] = { ...updatedBadges[idx], unlocked: true };
    }
    
    if (newProfile.points >= 1000 && !updatedBadges.find(b => b.id === 'waste_warrior')?.unlocked) {
      const idx = updatedBadges.findIndex(b => b.id === 'waste_warrior');
      updatedBadges[idx] = { ...updatedBadges[idx], unlocked: true };
    }

    const finalProfile = { ...newProfile, badges: updatedBadges };
    setUser(finalProfile);
    localStorage.setItem('recycle_me_user_v4', JSON.stringify(finalProfile));
  };

  const handleRecycle = (earnings: number, material: WasteType, weight: number) => {
    const bonusPoints = 50;
    const newSale: SaleTransaction = {
      id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toLocaleString(),
      materialType: material,
      weight: weight,
      value: earnings,
      status: 'Pending Verification'
    };

    saveUser({
      ...user,
      earnings: user.earnings + earnings,
      points: user.points + bonusPoints,
      salesHistory: [newSale, ...user.salesHistory]
    });
  };

  const handleReport = () => {
    const bonusPoints = 100;
    saveUser({
      ...user,
      reportsCount: user.reportsCount + 1,
      points: user.points + bonusPoints
    });
  };

  const handleGamePoints = (points: number) => {
    saveUser({
      ...user,
      points: user.points + points
    });
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-slate-950">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Header 
        user={user} 
        onLogout={handleLogout} 
        onProfileClick={() => setActiveTab('dashboard')}
      />

      <main className="container mx-auto px-4 pt-6 max-w-4xl">
        {activeTab === 'marketplace' && <Marketplace onEarningsUpdate={handleRecycle} />}
        {activeTab === 'reporting' && <HazardReporting onReportSubmitted={handleReport} />}
        {activeTab === 'dashboard' && <Dashboard user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} />}
        {activeTab === 'games' && <Games onPointsEarned={handleGamePoints} />}
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 glass-morphism px-6 py-3 rounded-[2rem] flex gap-6 sm:gap-10 items-center z-50 neon-border border-white/10">
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'marketplace' ? 'text-purple-400' : 'text-slate-500'}`}
        >
          <svg className={`w-6 h-6 transition-transform ${activeTab === 'marketplace' ? 'scale-110' : 'opacity-60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[8px] font-bold uppercase tracking-widest">Market</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('reporting')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'reporting' ? 'text-pink-400' : 'text-slate-500'}`}
        >
          <svg className={`w-6 h-6 transition-transform ${activeTab === 'reporting' ? 'scale-110' : 'opacity-60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[8px] font-bold uppercase tracking-widest">Hazards</span>
        </button>

        <button 
          onClick={() => setActiveTab('games')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'games' ? 'text-yellow-400' : 'text-slate-500'}`}
        >
          <svg className={`w-6 h-6 transition-transform ${activeTab === 'games' ? 'scale-110' : 'opacity-60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          <span className="text-[8px] font-bold uppercase tracking-widest">Games</span>
        </button>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <svg className={`w-6 h-6 transition-transform ${activeTab === 'dashboard' ? 'scale-110' : 'opacity-60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[8px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
