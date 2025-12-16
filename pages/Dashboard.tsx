import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles, UserPlus, Award } from 'lucide-react';
import { analyzeNetwork } from '../services/geminiService';
import { UserLevel } from '../types';

const Dashboard: React.FC = () => {
  const { user, users, transactions, getUserLevel } = useAuth();
  const { t, language } = useLanguage();
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const getDownlineCount = (userId: string): number => {
    const directReports = users.filter(u => u.referrerId === userId);
    let count = directReports.length;
    directReports.forEach(dr => {
      count += getDownlineCount(dr.id);
    });
    return count;
  };

  const getDownlineVolume = (userId: string): number => {
    const directReports = users.filter(u => u.referrerId === userId);
    let volume = directReports.reduce((acc, curr) => acc + curr.balance, 0);
    directReports.forEach(dr => {
      volume += getDownlineVolume(dr.id);
    });
    return volume;
  };

  const downlineCount = user ? getDownlineCount(user.id) : 0;
  const downlineVolume = user ? getDownlineVolume(user.id) : 0;
  
  const directCount = user ? users.filter(u => u.referrerId === user.id).length : 0;
  const myLevel = user ? getUserLevel(user) : 'MEMBER';

  const getNextLevelTarget = (count: number, currentLevel: UserLevel) => {
    if (currentLevel === 'DIRECTOR') return { target: 10, nextLevel: 'MAX' };
    if (count < 3) return { target: 3, nextLevel: 'VIP' };
    if (count < 5) return { target: 5, nextLevel: 'VVIP' };
    if (count < 10) return { target: 10, nextLevel: 'DISTRIBUTOR' };
    return { target: 10, nextLevel: 'MAX' };
  };

  const { target, nextLevel } = getNextLevelTarget(directCount, myLevel);
  const progressPercent = Math.min(100, (directCount / target) * 100);

  useEffect(() => {
    if (user) {
      setLoadingAi(true);
      setGeminiAnalysis('');
      analyzeNetwork(user, downlineCount, downlineVolume, language)
        .then(analysis => {
          setGeminiAnalysis(analysis);
          setLoadingAi(false);
        })
        .catch(() => setLoadingAi(false));
    }
  }, [user, downlineCount, downlineVolume, language]);

  const getLevelColorStyle = (level: UserLevel) => {
    switch (level) {
      case 'DIRECTOR': return 'text-red-600 bg-red-100 border-red-200';
      case 'DISTRIBUTOR': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'VVIP': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'VIP': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getLevelIcon = (level: UserLevel) => {
     switch(level) {
        case 'DIRECTOR': return <Award size={24} />;
        case 'DISTRIBUTOR': return <Award size={24} />;
        case 'VVIP': return <Sparkles size={24} />;
        case 'VIP': return <UserPlus size={24} />;
        default: return <UserPlus size={24} />;
     }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">{t('welcome')}, {user?.username} 👋</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('balance')}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {user?.balance.toLocaleString()} P
            </h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
           <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-slate-500 text-sm font-medium">{t('referrals')}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getLevelColorStyle(myLevel)}`}>
                     {t(`lvl_${myLevel}`)}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">
                  {directCount}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${getLevelColorStyle(myLevel)} border-0`}>
                 {getLevelIcon(myLevel)}
              </div>
           </div>

           <div className="w-full">
             <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">
                  {nextLevel === 'MAX' ? t('maxLevel') : t('toNextLevel')}
                </span>
                <span className="font-bold text-slate-600">
                  {nextLevel === 'MAX' ? '' : `${directCount}/${target}`}
                </span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className={`h-full rounded-full transition-all duration-500 ${
                    myLevel === 'DIRECTOR' || myLevel === 'DISTRIBUTOR' ? 'bg-green-500' : 'bg-blue-500'
                 }`}
                 style={{ width: `${progressPercent}%` }}
               ></div>
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">{t('partners')}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {downlineCount}
            </h3>
          </div>
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} />
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="text-yellow-400" size={20} />
            <h3 className="font-semibold text-lg">{t('aiReport')}</h3>
          </div>
          
          <div className="prose prose-invert max-w-none text-slate-200">
            {loadingAi ? (
              <div className="flex items-center space-x-3 py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>{t('analyzing')}</span>
              </div>
            ) : (
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {geminiAnalysis}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4">{t('recentTx')}</h3>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-slate-400 text-center py-4">{t('noTx')}</p>
            ) : (
              transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {tx.bonusType ? t(`bonus_${tx.bonusType}`) : tx.description}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;