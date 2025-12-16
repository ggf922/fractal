import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Network, Wallet, Settings, Shield, LogOut, Globe, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';

const MobileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: t('dashboard'), icon: <LayoutDashboard size={28} />, path: '/', color: 'bg-blue-100 text-blue-600' },
    { label: t('myTree'), icon: <Network size={28} />, path: '/tree', color: 'bg-indigo-100 text-indigo-600' },
    { label: t('wallet'), icon: <Wallet size={28} />, path: '/wallet', color: 'bg-emerald-100 text-emerald-600' },
    { label: t('settings'), icon: <Settings size={28} />, path: '/settings', color: 'bg-slate-100 text-slate-600' },
  ];

  if (user?.username === 'admin') {
    menuItems.push({ label: t('adminMenu'), icon: <Shield size={28} />, path: '/admin', color: 'bg-amber-100 text-amber-600' });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      {/* User Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-full shadow-lg shadow-blue-500/20">
            <UserCircle size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">{user?.username}</h2>
            <p className="text-xs text-slate-500">{user?.phoneNumber}</p>
          </div>
        </div>
        
        {/* Language Selector */}
        <div className="bg-white rounded-full px-3 py-1.5 shadow-sm border border-slate-200 flex items-center">
            <Globe size={14} className="text-slate-400 mr-1" />
            <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs text-slate-600 outline-none font-medium"
            >
                <option value="ko">한국어</option>
                <option value="en">Eng</option>
                <option value="zh">中文</option>
                <option value="ja">日本</option>
            </select>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t('menu')}</h1>
        <p className="text-slate-500 text-sm">{t('menuDesc')}</p>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-3 active:scale-95 transition-transform"
          >
            <div className={`p-4 rounded-full ${item.color}`}>
              {item.icon}
            </div>
            <span className="font-semibold text-slate-700">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;