import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, changePassword } = useAuth();
  const { t } = useLanguage();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setMessage({ text: t('errorPasswordMismatch'), type: 'error' });
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      setMessage({ text: t('passwordChanged'), type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setMessage({ text: t('errorPasswordIncorrect'), type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">{t('settingsTitle')}</h2>
        <p className="text-slate-500 mt-2">{t('settingsDesc')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="bg-slate-100 p-2 rounded-lg">
            <Lock className="text-slate-600" size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{t('changePassword')}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('currentPassword')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('confirmNewPassword')}</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-slate-900/10 transition-all transform hover:-translate-y-1"
            >
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;