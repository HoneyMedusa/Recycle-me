
import React from 'react';
import { UserProfile, DEFAULT_AVATAR } from '../types';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileClick }) => {
  const avatarUrl = user.avatar || DEFAULT_AVATAR;

  return (
    <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-slate-900/40 sticky top-0 backdrop-blur-md z-40 border-b border-white/5">
      <div className="flex flex-col">
        <h1 className="text-4xl font-bangers tracking-wider text-transparent bg-clip-text funky-gradient">
          RECYCLE ME
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Clean City • Smart Money</p>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Current Earnings</p>
          <p className="text-xl font-bold text-green-400">R {user.earnings.toFixed(2)}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onProfileClick}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px] shadow-lg group relative cursor-pointer hover:scale-105 active:scale-95 transition-all outline-none"
            title="View Profile"
          >
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </button>
          
          <button 
            onClick={onLogout}
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all border border-white/5"
            title="Log Out / Switch Account"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
