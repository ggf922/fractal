import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Language } from '../types';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError(t('errorUserNotFound'));
      }
    } catch (e) {
      setError('An error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-75"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at center, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="flex space-x-2 mb-8 bg-white/10 backdrop-blur-md p-2 rounded-xl shadow-lg z-10 border border-white/10">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              language === lang.code
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-slate-300 hover:bg-white/10'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 z-10">
        <div className="flex flex-col items-center mb-8">
           <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl mb-6 transform hover:scale-105 transition-all duration-500 ease-out group cursor-pointer overflow-hidden relative border border-white/10">
              <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
                 <g stroke="white" fill="none" strokeWidth="1" opacity="0.3">
                    <rect x="10" y="10" width="80" height="80" rx="16" />
                    <rect x="20" y="20" width="60" height="60" rx="12" transform="rotate(15 50 50)" />
                    <rect x="30" y="30" width="40" height="40" rx="8" transform="rotate(30 50 50)" />
                    <rect x="40" y="40" width="20" height="20" rx="4" transform="rotate(45 50 50)" />
                 </g>
                 <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
                 <circle cx="50" cy="50" r="5" fill="white" className="animate-pulse" />
              </svg>
              <div className="relative z-10 pt-8">
                 <span className="text-white font-black text-xs tracking-widest drop-shadow-md">FRACTAL</span>
              </div>
           </div>
           
           <div className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-md shadow-inner mb-4 flex items-center justify-center">
             <span className="text-white font-bold text-lg tracking-[0.2em] drop-shadow-md">INFINITE EXPANSION</span>
           </div>
           
           <p className="text-slate-500 font-medium text-sm tracking-wide">
             {t('appDesc')}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder={t('loginPlaceholder')}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                <span>{t('loginBtn')}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {t('noAccount')}{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
            {t('registerLink')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;