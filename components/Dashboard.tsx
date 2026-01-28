
import React, { useState } from 'react';
import { UserProfile, LeaderboardEntry, RewardPartner, DEFAULT_AVATAR } from '../types';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Lerato S.', points: 1450, rank: 1, avatar: 'https://picsum.photos/seed/lerato/100/100' },
  { name: 'David M.', points: 1280, rank: 2, avatar: 'https://picsum.photos/seed/david/100/100' },
  { name: 'Sarah K.', points: 1100, rank: 3, avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { name: 'Tshepo M.', points: 450, rank: 4, avatar: DEFAULT_AVATAR },
  { name: 'Johan V.', points: 390, rank: 5, avatar: 'https://picsum.photos/seed/johan/100/100' },
];

const PARTNERS: RewardPartner[] = [
  { name: 'Checkers', logo: '🛒', offer: '10% off groceries', requiredBadgeId: 'newbie' },
  { name: 'Woolworths', logo: '🥗', offer: 'Eco-friendly range vouchers', requiredBadgeId: 'plastic_pro' },
  { name: 'Vida e Caffè', logo: '☕', offer: 'Buy 1 Get 1 Free Coffee', requiredBadgeId: 'hazard_hero' },
  { name: 'Takealot', logo: '📦', offer: 'R100 Discount on R500+', requiredBadgeId: 'waste_warrior' },
];

interface DashboardProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateProfile, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar || DEFAULT_AVATAR
  });

  const displayLeaderboard = MOCK_LEADERBOARD.map(entry => 
    entry.name.includes(user.name.split(' ')[0]) ? { ...entry, points: user.points, avatar: user.avatar || DEFAULT_AVATAR } : entry
  ).sort((a, b) => b.points - a.points).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handleClaimReward = (badgeName: string, reward: string) => {
    alert(`🎁 Congratulations! Your ${reward} for the "${badgeName}" badge has been sent to your email: ${user.email}`);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-left-10 duration-500 pb-12">
      {/* Profile Info */}
      <section className="glass-morphism p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 p-[3px] shadow-2xl overflow-hidden">
               <img 
                 src={user.avatar || DEFAULT_AVATAR} 
                 alt="User Profile" 
                 className="w-full h-full object-cover rounded-[21px]" 
               />
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute -bottom-2 -right-2 bg-slate-900 p-2 rounded-xl border border-white/10 text-indigo-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl font-bangers tracking-wider text-white mb-1 uppercase">{user.name}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
                {user.email || 'No email provided'}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {user.phone || 'No phone provided'}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 text-center min-w-[150px]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Eco Score</p>
            <p className="text-4xl font-bangers text-indigo-400">{user.points}</p>
            <p className="text-[9px] text-slate-600 font-bold uppercase mt-2">Level: Intermediate Warrior</p>
          </div>
        </div>

        {isEditing && (
          <div className="absolute inset-0 bg-slate-950/95 z-30 p-8 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bangers text-purple-400 mb-6 uppercase tracking-widest text-center">Update Identity</h3>
            <div className="max-w-md mx-auto w-full space-y-4">
                <div className="flex flex-col items-center mb-4">
                  <img src={editForm.avatar || DEFAULT_AVATAR} className="w-20 h-20 rounded-2xl object-cover mb-2" />
                  <label className="text-[10px] font-bold text-indigo-400 cursor-pointer">UPLOAD PHOTO <input type="file" className="hidden" onChange={handleAvatarChange} /></label>
                </div>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-900 p-3 rounded-xl" placeholder="Name" />
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-900 p-3 rounded-xl" placeholder="Email" />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="flex-1 funky-gradient p-3 rounded-xl font-bold uppercase text-xs">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 bg-slate-800 rounded-xl text-xs font-bold uppercase">Cancel</button>
                </div>
            </div>
          </div>
        )}
      </section>

      {/* Profile Context Explainer */}
      <div className="glass-morphism p-6 rounded-[2rem] border-l-4 border-indigo-500 bg-indigo-500/5">
        <h3 className="text-xl font-bangers text-indigo-400 mb-2 uppercase tracking-widest">Your Environmental Legacy</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          The Profile dashboard tracks your total earnings and community impact. 
          Every successful recycle scan and hazard report earns you <strong>Eco Points</strong>. 
          Unlocking badges based on your activity grants you access to exclusive rewards and vouchers from our corporate partners.
        </p>
      </div>

      {/* Sales History Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-2xl font-bangers tracking-wider text-white uppercase">TRANSACTION HISTORY</h3>
        </div>
        
        <div className="glass-morphism rounded-[2rem] overflow-hidden border border-white/5 divide-y divide-white/5">
          {user.salesHistory.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No sales recorded yet. Start scanning!</p>
            </div>
          ) : (
            user.salesHistory.map((tx) => (
              <div key={tx.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0 border border-white/5">
                    {tx.materialType === 'PLASTIC' ? '🥤' : tx.materialType === 'METAL' ? '🥫' : tx.materialType === 'GLASS' ? '🫙' : '📦'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-100 uppercase text-xs tracking-wider">{tx.materialType}</h4>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${tx.status === 'Verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">{tx.timestamp} • {tx.id}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Estimated Weight: {tx.weight.toFixed(2)}kg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Earned</p>
                  <p className="text-2xl font-bangers text-green-400 tracking-wider">R {tx.value.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Rewards Partners Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-2xl font-bangers tracking-wider text-white uppercase">REWARDS PARTNERS</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PARTNERS.map((partner, i) => (
            <div key={i} className="glass-morphism p-4 rounded-3xl flex flex-col items-center text-center border border-white/5 group hover:border-green-500/30 transition-all">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{partner.logo}</div>
              <h4 className="font-bold text-sm text-slate-100">{partner.name}</h4>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mt-1">{partner.offer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Badges & Claimable Rewards */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h3 className="text-2xl font-bangers tracking-wider text-white uppercase">UNLOCKED REWARDS</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`relative glass-morphism p-6 rounded-[2rem] flex items-center gap-4 transition-all duration-500 border border-white/5 ${badge.unlocked ? 'opacity-100 hover:border-yellow-500/30' : 'opacity-40 grayscale'}`}
            >
              <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl shadow-lg`}>
                {badge.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-100">{badge.name}</h4>
                <p className="text-[10px] text-slate-400 mb-2">{badge.description}</p>
                {badge.unlocked && badge.reward && (
                  <button 
                    onClick={() => handleClaimReward(badge.name, badge.reward!)}
                    className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full border border-yellow-500/30 hover:bg-yellow-500/30 transition-all uppercase tracking-widest"
                  >
                    Claim: {badge.reward}
                  </button>
                )}
              </div>
              {!badge.unlocked && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl opacity-20">🔒</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Account Actions Section */}
      <section className="pt-6 border-t border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onLogout}
            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Switch Account / Log Out
          </button>
          
          <button 
            className="flex-1 bg-slate-800 text-slate-400 border border-white/5 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all"
            onClick={() => alert("Account data synced and backed up to cloud.")}
          >
            Sync Account Data
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          Recycle Me v4.2 • Environmental Marketplace License
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
