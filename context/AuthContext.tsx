import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Country, UserLevel, BonusType } from '../types';
import { supabase } from '../src/supabaseClient';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, name: string, phoneNumber: string, referrerPhoneNumber: string, password: string, country: Country) => Promise<boolean>;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<boolean>;
  transfer: (targetUsername: string, amount: number) => Promise<{ success: boolean; message: 'transferSuccess' | 'errorBalance' | 'errorSelf' | 'errorInvalidUser' | string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUserProfile: (userId: string, data: { username: string; phoneNumber: string; balance?: number }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  transactions: Transaction[];
  getUserLevel: (targetUser: User) => UserLevel;
  distributePoints: (amount: number, targetLevel: 'ALL' | UserLevel, bonusType: BonusType) => Promise<{ success: boolean; count: number }>;
  distributePointsToSelected: (amount: number, selectedIds: string[], bonusType: BonusType) => Promise<{ success: boolean; count: number }>;
  bulkTransfer: (amount: number, targetLevel: UserLevel) => Promise<{ success: boolean; count: number; message: string }>;
  toggleDirector: (userId: string) => Promise<void>;
  approveDeposit: (transactionId: string) => Promise<void>;
  rejectDeposit: (transactionId: string) => Promise<void>;
  restoreSystemData: (users: User[], transactions: Transaction[]) => void;
  shopUrl: string;
  saveShopUrl: (url: string) => Promise<void>;
  deleteShopUrl: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map DB columns (snake_case) to App types (camelCase)
const mapUserFromDB = (u: any): User => ({
  id: u.id,
  username: u.username,
  name: u.name,
  password: u.password,
  phoneNumber: u.phone_number,
  referralCode: u.referral_code,
  referrerId: u.referrer_id,
  balance: u.balance,
  joinedAt: u.created_at,
  country: u.country as Country,
  specialGrade: u.special_grade
});

const mapTxFromDB = (t: any): Transaction => ({
  id: t.id,
  type: t.type,
  status: t.status,
  amount: t.amount,
  date: t.created_at,
  description: t.description,
  bonusType: t.bonus_type,
  relatedUserId: t.related_user_id,
  relatedUserName: t.related_user_name
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shopUrl, setShopUrl] = useState<string>('');

  // 1. 초기 데이터 로드 및 구독 (Realtime)
  const fetchData = async () => {
    if (!supabase) return;
    
    // Users Fetch
    const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: true });
    if (usersData) {
      setUsers(usersData.map(mapUserFromDB));
    }

    // Transactions Fetch
    const { data: txData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (txData) {
      setTransactions(txData.map(mapTxFromDB));
    }

    // Settings Fetch (shopUrl)
    const { data: settingsData } = await supabase.from('settings').select('*').eq('key', 'shop_url').single();
    if (settingsData) {
      setShopUrl(settingsData.value || '');
    }
  };

  useEffect(() => {
    fetchData();

    // 로그인 세션 유지 (로컬 스토리지에 ID만 저장하고 DB에서 불러옴)
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId && supabase) {
      supabase.from('users').select('*').eq('id', storedUserId).single()
        .then(({ data }) => {
          if (data) setUser(mapUserFromDB(data));
        });
    }

    // 실시간 구독 (DB 변경 시 자동 업데이트)
    if (supabase) {
      const db = supabase; // TypeScript null 체크 우회
      const usersSub = db.channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchData())
        .subscribe();

      const txSub = db.channel('public:transactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
        .subscribe();

      return () => {
        db.removeChannel(usersSub);
        db.removeChannel(txSub);
      };
    }
  }, []);

  // 유저 상태가 변경되면 로컬 스토리지 싱크
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUserId', user.id);
      // users 목록에서 최신 정보를 찾아 업데이트
      const currentUserInList = users.find(u => u.id === user.id);
      if (currentUserInList && (currentUserInList.balance !== user.balance || currentUserInList.specialGrade !== user.specialGrade)) {
        setUser(currentUserInList);
      }
    } else {
      localStorage.removeItem('currentUserId');
    }
  }, [user, users]);


  // --- Actions ---

  const login = async (username: string, password: string) => {
    if (!supabase) return false;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) return false;
    if (data.password === password) {
      setUser(mapUserFromDB(data));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
  };

  const register = async (username: string, name: string, phoneNumber: string, referrerPhoneNumber: string, password: string, country: Country) => {
    if (!supabase) return false;

    // 중복 체크
    const { data: existing } = await supabase.from('users').select('id').or(`username.eq.${username},phone_number.eq.${phoneNumber}`);
    if (existing && existing.length > 0) return false;

    // 추천인 찾기
    let referrerId: string | null = null;
    if (referrerPhoneNumber) {
      const { data: refData } = await supabase.from('users').select('id').eq('phone_number', referrerPhoneNumber).single();
      if (refData) referrerId = refData.id;
      else return false; // 추천인 정보가 잘못됨
    } else {
      // 추천인 없으면 admin 밑으로
      const { data: adminData } = await supabase.from('users').select('id').eq('username', 'admin').single();
      if (adminData) referrerId = adminData.id;
    }

    const newUser = {
      username,
      name,
      password, // 상용화 시 해싱 필요
      phone_number: phoneNumber,
      referral_code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referrer_id: referrerId,
      balance: 1000, // 가입 보너스
      country,
      special_grade: null
    };

    const { data: insertedUser, error } = await supabase.from('users').insert(newUser).select().single();
    
    if (error || !insertedUser) {
      console.error(error);
      return false;
    }

    // 가입 보너스 거래 내역
    await supabase.from('transactions').insert({
      type: 'DEPOSIT',
      status: 'COMPLETED',
      amount: 1000,
      description: 'Sign Up Bonus',
      bonus_type: 'SIGN_UP',
      related_user_id: insertedUser.id
    });

    return true;
  };

  const deposit = async (amount: number) => {
    if (!user || !supabase) return;
    await supabase.from('transactions').insert({
      type: 'DEPOSIT',
      status: 'PENDING',
      amount,
      description: 'Deposit Request',
      related_user_id: user.id,
      related_user_name: user.username
    });
  };

  const withdraw = async (amount: number) => {
    if (!user || !supabase) return false;
    if (user.balance < amount) return false;

    // 1. 잔액 차감
    const { error } = await supabase.from('users').update({ balance: user.balance - amount }).eq('id', user.id);
    if (error) return false;

    // 2. 거래 기록
    await supabase.from('transactions').insert({
      type: 'WITHDRAW',
      status: 'PENDING',
      amount,
      description: 'Withdraw Request',
      related_user_id: user.id
    });

    return true;
  };

  const transfer = async (targetUsername: string, amount: number) => {
    if (!user || !supabase) return { success: false, message: 'loginRequired' };
    if (user.balance < amount) return { success: false, message: 'errorBalance' };
    if (user.username === targetUsername) return { success: false, message: 'errorSelf' };

    const { data: targetUser } = await supabase.from('users').select('*').eq('username', targetUsername).single();
    if (!targetUser) return { success: false, message: 'errorInvalidUser' };

    // Transactional Update (Client-side sequence)
    // 1. Sender balance decrease
    const { error: senderErr } = await supabase.from('users').update({ balance: user.balance - amount }).eq('id', user.id);
    if (senderErr) return { success: false, message: 'errorBalance' };

    // 2. Receiver balance increase
    await supabase.from('users').update({ balance: targetUser.balance + amount }).eq('id', targetUser.id);

    // 3. Record Transaction
    await supabase.from('transactions').insert({
      type: 'TRANSFER_OUT',
      status: 'COMPLETED',
      amount,
      description: `Transfer to ${targetUser.username}`,
      related_user_id: user.id, // Sender
      related_user_name: targetUser.username // Store receiver name for easy display
    });
    
    // Optional: Insert TRANSFER_IN record for receiver visibility
    await supabase.from('transactions').insert({
      type: 'TRANSFER_IN',
      status: 'COMPLETED',
      amount,
      description: `Received from ${user.username}`,
      related_user_id: targetUser.id,
      related_user_name: user.username
    });

    return { success: true, message: 'transferSuccess' };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !supabase) return false;
    if (user.password !== currentPassword) return false;

    const { error } = await supabase.from('users').update({ password: newPassword }).eq('id', user.id);
    return !error;
  };

  const updateUserProfile = async (userId: string, data: { username: string, phoneNumber: string, balance?: number }) => {
    if (!supabase) return false;
    
    // Check duplicates
    const { data: dups } = await supabase.from('users').select('id')
      .neq('id', userId)
      .or(`username.eq.${data.username},phone_number.eq.${data.phoneNumber}`);
      
    if (dups && dups.length > 0) return false;

    const updateData: any = { username: data.username, phone_number: data.phoneNumber };
    if (data.balance !== undefined) updateData.balance = data.balance;

    const { error } = await supabase.from('users').update(updateData).eq('id', userId);
    return !error;
  };

  const deleteUser = async (userId: string) => {
    if (!supabase) return false;
    // 1. Update children referrer to admin or root
    // 2. Delete user
    // Simple delete for now (Cascade handled by DB or manual update)
    const { error } = await supabase.from('users').delete().eq('id', userId);
    return !error;
  };

  // --- Admin Functions ---

  const getUserLevel = (targetUser: User): UserLevel => {
    if (targetUser.specialGrade === 'DIRECTOR') return 'DIRECTOR';
    const referralCount = users.filter(u => u.referrerId === targetUser.id).length;
    if (referralCount >= 10) return 'DISTRIBUTOR';
    if (referralCount >= 5) return 'VVIP';
    if (referralCount >= 3) return 'VIP';
    return 'MEMBER';
  };

  const distributePoints = async (amount: number, targetLevel: 'ALL' | UserLevel, bonusType: BonusType) => {
    if (!supabase) return { success: false, count: 0 };
    const db = supabase; // TypeScript null 체크 우회
    
    let count = 0;
    const updates = users.map(async (u) => {
      if (u.username === 'admin') return;
      
      const level = getUserLevel(u);
      let shouldReceive = false;
      if (targetLevel === 'ALL') shouldReceive = true;
      else if (targetLevel === level) shouldReceive = true;

      if (shouldReceive) {
        count++;
        // Update Balance
        await db.from('users').update({ balance: u.balance + amount }).eq('id', u.id);
        // Insert Transaction
        await db.from('transactions').insert({
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount,
          description: `${bonusType} Bonus`,
          bonus_type: bonusType,
          related_user_id: u.id
        });
      }
    });

    await Promise.all(updates);
    return { success: true, count };
  };

  const distributePointsToSelected = async (amount: number, selectedIds: string[], bonusType: BonusType) => {
    if (!supabase) return { success: false, count: 0 };
    const db = supabase; // TypeScript null 체크 우회
    let count = 0;
    const updates = selectedIds.map(async (id) => {
       const u = users.find(user => user.id === id);
       if (u) {
         count++;
         await db.from('users').update({ balance: u.balance + amount }).eq('id', u.id);
         await db.from('transactions').insert({
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount,
          description: `${bonusType} Bonus`,
          bonus_type: bonusType,
          related_user_id: u.id
        });
       }
    });
    await Promise.all(updates);
    return { success: true, count };
  };

  // 관리자 전용: 등급별 일괄 송금 (관리자 잔액 차감)
  const bulkTransfer = async (amount: number, targetLevel: UserLevel) => {
    if (!supabase || !user) return { success: false, count: 0, message: '로그인 필요' };
    if (user.username !== 'admin') return { success: false, count: 0, message: '관리자만 가능' };
    
    const db = supabase;
    
    // 대상 회원 필터링
    const targetUsers = users.filter(u => {
      if (u.username === 'admin') return false;
      return getUserLevel(u) === targetLevel;
    });
    
    if (targetUsers.length === 0) {
      return { success: false, count: 0, message: '대상 회원이 없습니다' };
    }
    
    const totalAmount = amount * targetUsers.length;
    
    // 관리자 잔액 확인
    if (user.balance < totalAmount) {
      return { success: false, count: 0, message: `잔액 부족 (필요: ${totalAmount.toLocaleString()}P)` };
    }
    
    // 1. 관리자 잔액 차감
    const { error: adminErr } = await db.from('users').update({ balance: user.balance - totalAmount }).eq('id', user.id);
    if (adminErr) {
      return { success: false, count: 0, message: '관리자 잔액 차감 실패' };
    }
    
    // 2. 각 회원에게 송금 및 거래내역 기록
    let count = 0;
    const updates = targetUsers.map(async (u) => {
      count++;
      // 회원 잔액 증가
      await db.from('users').update({ balance: u.balance + amount }).eq('id', u.id);
      
      // 회원 거래내역 (받음)
      await db.from('transactions').insert({
        type: 'TRANSFER_IN',
        status: 'COMPLETED',
        amount,
        description: `관리자 일괄 송금`,
        related_user_id: u.id,
        related_user_name: 'admin'
      });
    });
    
    await Promise.all(updates);
    
    // 3. 관리자 거래내역 (보냄)
    await db.from('transactions').insert({
      type: 'TRANSFER_OUT',
      status: 'COMPLETED',
      amount: totalAmount,
      description: `${targetLevel} 등급 ${count}명에게 일괄 송금`,
      related_user_id: user.id,
      related_user_name: `${targetLevel} (${count}명)`
    });
    
    return { success: true, count, message: '송금 완료' };
  };

  const toggleDirector = async (userId: string) => {
    if (!supabase) return;
    const u = users.find(u => u.id === userId);
    if (!u) return;
    
    const newGrade = u.specialGrade === 'DIRECTOR' ? null : 'DIRECTOR';
    await supabase.from('users').update({ special_grade: newGrade }).eq('id', userId);
  };

  const approveDeposit = async (transactionId: string) => {
    if (!supabase) return;
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status !== 'PENDING') return;

    const targetUser = users.find(u => u.id === tx.relatedUserId);
    if (!targetUser) return;

    // 1. Transaction status update
    await supabase.from('transactions').update({ status: 'COMPLETED', description: 'Deposit Approved' }).eq('id', transactionId);
    // 2. User balance update
    await supabase.from('users').update({ balance: targetUser.balance + tx.amount }).eq('id', targetUser.id);
  };

  const rejectDeposit = async (transactionId: string) => {
    if (!supabase) return;
    await supabase.from('transactions').update({ status: 'REJECTED', description: 'Deposit Rejected' }).eq('id', transactionId);
  };

  const restoreSystemData = async (newUsers: User[], newTransactions: Transaction[]) => {
     // Not implemented for Supabase (Requires complex SQL reset)
     console.log("Restore not available in Supabase mode via client.");
  };

  // 쇼핑몰 URL 저장 (Supabase settings 테이블)
  const saveShopUrl = async (url: string) => {
    if (!supabase) return;
    
    // upsert: 있으면 업데이트, 없으면 삽입
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'shop_url', value: url }, { onConflict: 'key' });
    
    if (!error) {
      setShopUrl(url);
    }
  };

  // 쇼핑몰 URL 삭제
  const deleteShopUrl = async () => {
    if (!supabase) return;
    
    await supabase.from('settings').delete().eq('key', 'shop_url');
    setShopUrl('');
  };

  return (
    <AuthContext.Provider value={{ 
      user, users, login, logout, register, deposit, withdraw, transfer, 
      changePassword, updateUserProfile, deleteUser, transactions,
      getUserLevel, distributePoints, distributePointsToSelected, bulkTransfer, toggleDirector,
      approveDeposit, rejectDeposit, restoreSystemData,
      shopUrl, saveShopUrl, deleteShopUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};