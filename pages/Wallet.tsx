import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CreditCard, Send, Download, Upload, Plus, Minus } from 'lucide-react';

const WalletPage: React.FC = () => {
  const { user, deposit, withdraw, transfer } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState<string>('');
  const [targetUser, setTargetUser] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/,/g, ''), 10);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ text: t('enterAmount'), type: 'error' });
      return;
    }

    setMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'deposit') {
        await deposit(numAmount);
        setMessage({ text: t('depositRequested'), type: 'success' });
        setAmount('');
      } else if (activeTab === 'withdraw') {
        // Validation for 10,000 unit
        if (numAmount % 10000 !== 0) {
          setMessage({ text: t('errorUnit10k'), type: 'error' });
          setIsLoading(false);
          return;
        }
        
        // Validation for Bank Info
        if (!bankName || !accountNumber || !accountHolder) {
          setMessage({ text: t('fillBankInfo'), type: 'error' });
          setIsLoading(false);
          return;
        }

        const success = await withdraw(numAmount);
        if (success) {
          setMessage({ text: t('withdrawSuccess'), type: 'success' });
          setAmount('');
          setBankName('');
          setAccountNumber('');
          setAccountHolder('');
        } else {
          setMessage({ text: t('errorBalance'), type: 'error' });
        }
      } else if (activeTab === 'transfer') {
        const result = await transfer(targetUser, numAmount);
        if (result.success) {
          setMessage({ text: t('transferSuccess'), type: 'success' });
          setAmount('');
          setTargetUser('');
        } else {
          setMessage({ text: t(result.message), type: 'error' });
        }
      }
    } catch (e) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'deposit' | 'withdraw' | 'transfer') => {
    setActiveTab(tab);
    setMessage(null);
    setAmount('');
  };

  const adjustAmount = (delta: number) => {
    setAmount(prev => {
      const val = parseInt(prev.replace(/,/g, '') || '0', 10);
      const newVal = Math.max(0, val + delta);
      return newVal.toString();
    });
  };

  const addAmount = (delta: number) => {
    setAmount(prev => {
      const val = parseInt(prev.replace(/,/g, '') || '0', 10);
      return (val + delta).toString();
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800">{t('myWallet')}</h2>
        <p className="text-slate-500 mt-2">{t('walletDesc')}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg mb-8 text-center">
        <p className="text-blue-100 font-medium mb-2">{t('currentBalance')}</p>
        <h1 className="text-5xl font-bold mb-4">{user?.balance.toLocaleString()} <span className="text-2xl font-normal">P</span></h1>
        <div className="flex justify-center space-x-2 text-sm bg-white/10 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          <span>ID: {user?.username}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => handleTabChange('deposit')}
            className={`flex-1 py-4 font-medium text-sm flex items-center justify-center space-x-2 transition-colors ${activeTab === 'deposit' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Download size={18} />
            <span>{t('deposit')}</span>
          </button>
          <button
            onClick={() => handleTabChange('withdraw')}
            className={`flex-1 py-4 font-medium text-sm flex items-center justify-center space-x-2 transition-colors ${activeTab === 'withdraw' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Upload size={18} />
            <span>{t('withdraw')}</span>
          </button>
          <button
            onClick={() => handleTabChange('transfer')}
            className={`flex-1 py-4 font-medium text-sm flex items-center justify-center space-x-2 transition-colors ${activeTab === 'transfer' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Send size={18} />
            <span>{t('transfer')}</span>
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleAction} className="max-w-md mx-auto space-y-6">
            <h3 className="text-xl font-bold text-center text-slate-800">
              {activeTab === 'deposit' && t('deposit')}
              {activeTab === 'withdraw' && t('withdraw')}
              {activeTab === 'transfer' && t('transfer')}
            </h3>

            {activeTab === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('recipientId')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder={t('placeholderId')}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('bankName')}</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder={t('bankName')}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('accountHolder')}</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder={t('accountHolder')}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('accountNumber')}</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder={t('accountNumber')}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('amount')}</label>
              
              {/* Up/Down Controls for Withdraw and Transfer */}
              {(activeTab === 'withdraw' || activeTab === 'transfer') ? (
                <div className="flex items-center space-x-2">
                   <button 
                    type="button" 
                    onClick={() => adjustAmount(-10000)}
                    disabled={isLoading}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors disabled:opacity-50"
                   >
                     <Minus size={20} />
                   </button>
                   <div className="relative flex-1">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₩</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg text-center"
                        placeholder="0"
                        required
                        min="1"
                        step="10000"
                        disabled={isLoading}
                      />
                   </div>
                   <button 
                    type="button" 
                    onClick={() => adjustAmount(10000)}
                    disabled={isLoading}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors disabled:opacity-50"
                   >
                     <Plus size={20} />
                   </button>
                </div>
              ) : (
                 <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₩</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg"
                    placeholder="0"
                    required
                    min="1"
                    disabled={isLoading}
                  />
                </div>
              )}
              
              {/* Helper Buttons */}
              <div className="flex justify-end space-x-2 mt-2">
                {[10000, 50000, 100000, 500000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addAmount(val)}
                    disabled={isLoading}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>
              
              {activeTab === 'withdraw' && (
                <p className="text-sm text-red-500 mt-2 font-medium">
                  {t('withdrawNotice')}
                </p>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                <>
                  {activeTab === 'deposit' && t('deposit')}
                  {activeTab === 'withdraw' && t('withdraw')}
                  {activeTab === 'transfer' && t('transfer')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;