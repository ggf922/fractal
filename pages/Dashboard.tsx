import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, Wallet, ArrowUpRight, ArrowDownLeft, UserPlus, Award, ShoppingBag, Target, ExternalLink } from 'lucide-react';
import { UserLevel } from '../types';

const Dashboard: React.FC = () => {
  const { user, users, transactions, getUserLevel } = useAuth();
  const { t } = useLanguage();
  const [shopUrl, setShopUrl] = useState<string>('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('shopUrl') || '';
    setShopUrl(savedUrl);
  }, []);

  const handleShopClick = () => {
    if (shopUrl) {
      window.open(shopUrl, '_blank');
    } else {
      alert('쇼핑몰 URL이 설정되지 않았습니다. 관리자에게 문의하세요.');
    }
  };

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
        case 'VVIP': return <Target size={24} />;
        case 'VIP': return <UserPlus size={24} />;
        default: return <UserPlus size={24} />;
     }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">{t('welcome')}, {user?.username} 👋</h2>

      {/* 상단 4개 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 보유 포인트 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-blue-100 text-sm font-medium">{t('balance')}</p>
            <div className="bg-white/20 p-2 rounded-xl">
              <Wallet size={20} />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">
            {user?.balance.toLocaleString()} P
          </h3>
        </div>

        {/* 추천인 수 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <p className="text-purple-100 text-sm font-medium">{t('referrals')}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/20">
                {t(`lvl_${myLevel}`)}
              </span>
            </div>
            <div className="bg-white/20 p-2 rounded-xl">
              {getLevelIcon(myLevel)}
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">{directCount}</h3>
        </div>

        {/* 하위 파트너 수 */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-indigo-100 text-sm font-medium">{t('partners')}</p>
            <div className="bg-white/20 p-2 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">{downlineCount}</h3>
        </div>

        {/* 쇼핑몰 */}
        <div 
          onClick={handleShopClick}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl shadow-lg text-white cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-emerald-100 text-sm font-medium">쇼핑몰</p>
            <div className="bg-white/20 p-2 rounded-xl">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl md:text-2xl font-bold">바로가기</h3>
            <ExternalLink size={18} />
          </div>
        </div>
      </div>

      {/* 등급 진행 상황 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${getLevelColorStyle(myLevel)} border-0`}>
              {getLevelIcon(myLevel)}
            </div>
            <div>
              <p className="text-sm text-slate-500">현재 등급</p>
              <p className="text-lg font-bold text-slate-800">{t(`lvl_${myLevel}`)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">
              {nextLevel === 'MAX' ? t('maxLevel') : `다음 등급: ${t(`lvl_${nextLevel}`)}`}
            </p>
            <p className="text-lg font-bold text-slate-800">
              {nextLevel === 'MAX' ? '🎉' : `${directCount} / ${target}명`}
            </p>
          </div>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              myLevel === 'DIRECTOR' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              myLevel === 'DISTRIBUTOR' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
              myLevel === 'VVIP' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
              myLevel === 'VIP' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              'bg-gradient-to-r from-slate-400 to-slate-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 최근 거래 내역 - 본인 거래만 표시 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-4 text-lg">{t('recentTx')}</h3>
        <div className="space-y-3">
          {transactions.filter(tx => tx.relatedUserId === user?.id).length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-400">{t('noTx')}</p>
            </div>
          ) : (
            transactions.filter(tx => tx.relatedUserId === user?.id).slice(0, 6).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
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
                  {tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? '+' : '-'}{tx.amount.toLocaleString()} P
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
