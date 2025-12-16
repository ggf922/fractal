export type Language = 'ko' | 'en' | 'zh' | 'ja';
export type Country = 'KR' | 'US' | 'CN' | 'JP';
export type UserLevel = 'MEMBER' | 'VIP' | 'VVIP' | 'DISTRIBUTOR' | 'DIRECTOR';
export type BonusType = 'SIGN_UP' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string;
  phoneNumber: string; 
  referralCode: string; 
  referrerId: string | null;
  balance: number;
  joinedAt: string;
  country: Country;
  specialGrade?: 'DIRECTOR';
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  status?: 'PENDING' | 'COMPLETED' | 'REJECTED';
  amount: number;
  date: string;
  relatedUserId?: string;
  relatedUserName?: string;
  description: string;
  bonusType?: BonusType;
}

export interface TreeNode {
  name: string;
  attributes?: { [key: string]: string | number; };
  children?: TreeNode[];
}