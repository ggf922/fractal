import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, CheckCircle, ShieldCheck } from 'lucide-react';
import { Language, Country } from '../types';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referrerPhoneNumber, setReferrerPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState<Country>('KR');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreePrivacy) {
      setError(t('privacyError'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await register(username, name, phoneNumber, referrerPhoneNumber, password, country);
      if (success) {
        setIsSuccess(true);
      } else {
        setError(t('errorRegFailed'));
      }
    } catch (e) {
      setError(t('errorRegFailed'));
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

  const getFlagEmoji = (countryCode: Country) => {
    switch (countryCode) {
      case 'KR': return '🇰🇷';
      case 'US': return '🇺🇸';
      case 'CN': return '🇨🇳';
      case 'JP': return '🇯🇵';
      default: return '🇰🇷';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
       <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm z-10">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              language === lang.code
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 z-10">
        {isSuccess ? (
          <div className="text-center py-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-8">{t('regWelcomeMsg')}</h2>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              {t('confirmBtn')}
            </button>
          </div>
        ) : (
          <>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('country')}</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={isSubmitting}
                >
                  <option value="KR">{getFlagEmoji('KR')} {t('countryKR')}</option>
                  <option value="US">{getFlagEmoji('US')} {t('countryUS')}</option>
                  <option value="CN">{getFlagEmoji('CN')} {t('countryCN')}</option>
                  <option value="JP">{getFlagEmoji('JP')} {t('countryJP')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('username')}</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                      disabled={isSubmitting}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('nameField')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                      disabled={isSubmitting}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="010-0000-0000"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">{t('referrerPhone')}</label>
                  <span className="text-xs text-slate-500 font-normal">{t('optional')}</span>
                </div>
                <input
                  type="tel"
                  value={referrerPhoneNumber}
                  onChange={(e) => setReferrerPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="010-0000-0000"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-400 mt-1">{t('referrerPhoneDesc')}</p>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                 <input 
                   type="checkbox" 
                   id="privacy" 
                   checked={agreePrivacy}
                   onChange={(e) => setAgreePrivacy(e.target.checked)}
                   className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                   disabled={isSubmitting}
                 />
                 <label htmlFor="privacy" className="text-sm text-slate-600 cursor-pointer select-none leading-tight">
                    <span className="flex items-center gap-1 font-medium text-slate-800">
                      <ShieldCheck size={14} className="text-slate-500" /> 
                      {t('privacyAgree')}
                    </span>
                 </label>
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>{t('registerBtn')}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              {t('hasAccount')}{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                {t('loginLink')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;