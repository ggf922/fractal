import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Network, Wallet, LogOut, UserCircle, Globe, Settings, Shield, Activity } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Language } from '../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden md:flex h-screen w-64 bg-slate-900 text-white flex-col fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
           <Activity className="text-blue-500" size={24} />
           <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent tracking-tight">
            {t('appName')}
           </h1>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{t('appDesc')}</p>
      </div>

      <div className="p-4 flex items-center space-x-3 bg-slate-800/50 mx-4 mt-4 rounded-lg border border-white/5">
        <div className="bg-blue-600 p-2 rounded-full">
          <UserCircle size={24} />
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm truncate">{user?.username}</p>
          <p className="text-xs text-slate-400 truncate">{user?.phoneNumber}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link to="/" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <LayoutDashboard size={20} />
          <span>{t('dashboard')}</span>
        </Link>
        <Link to="/tree" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/tree') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <Network size={20} />
          <span>{t('myTree')}</span>
        </Link>
        <Link to="/wallet" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/wallet') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <Wallet size={20} />
          <span>{t('wallet')}</span>
        </Link>
        <Link to="/settings" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/settings') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <Settings size={20} />
          <span>{t('settings')}</span>
        </Link>
        
        {user?.username === 'admin' && (
          <Link to="/admin" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-indigo-900/50 hover:text-white'}`}>
            <Shield size={20} />
            <span>{t('adminMenu')}</span>
          </Link>
        )}
      </nav>

      <div className="px-4 mb-2">
        <div className="bg-slate-800 rounded-lg p-2 flex justify-between items-center">
          <Globe size={16} className="text-slate-400 ml-2" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent text-xs text-white outline-none border-none p-1 cursor-pointer"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 text-slate-400 hover:text-white w-full p-2 transition-colors hover:bg-red-500/10 hover:text-red-400 rounded-lg"
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;