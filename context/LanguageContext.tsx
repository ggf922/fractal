import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: { [key in Language]: string; };
}

const translations: Translations = {
  appName: { ko: 'FRACTAL', en: 'FRACTAL', zh: 'FRACTAL', ja: 'FRACTAL' },
  appDesc: { ko: '무한한 확장의 시작', en: 'The Beginning of Infinite Expansion', zh: '无限扩展的开始', ja: '無限の拡大の始まり' },
  loginTitle: { ko: '로그인', en: 'Login', zh: '登录', ja: 'ログイン' },
  registerTitle: { ko: '회원가입', en: 'Register', zh: '注册', ja: '登録' },
  username: { ko: '아이디', en: 'Username', zh: '用户名', ja: 'ユーザーID' },
  nameField: { ko: '이름 (실명)', en: 'Name (Real Name)', zh: '姓名', ja: '氏名' },
  loginPlaceholder: { ko: '아이디를 입력하세요', en: 'Enter ID', zh: '输入ID', ja: 'IDを入力' },
  password: { ko: '비밀번호', en: 'Password', zh: '密码', ja: 'パスワード' },
  confirmPassword: { ko: '비밀번호 확인', en: 'Confirm Password', zh: '确认密码', ja: 'パスワード確認' },
  phoneNumber: { ko: '전화번호', en: 'Phone Number', zh: '电话号码', ja: '電話番号' },
  country: { ko: '국가', en: 'Country', zh: '国家', ja: '国' },
  countryKR: { ko: '대한민국', en: 'South Korea', zh: '韩国', ja: '韓国' },
  countryUS: { ko: '미국', en: 'USA', zh: '美国', ja: '米国' },
  countryCN: { ko: '중국', en: 'China', zh: '中国', ja: '中国' },
  countryJP: { ko: '일본', en: 'Japan', zh: '日本', ja: '日本' },
  referrerPhone: { ko: '추천인 전화번호', en: 'Referrer Phone', zh: '推荐人电话', ja: '紹介者の電話番号' },
  referrerPhoneDesc: { ko: '입력하지 않을 경우 본사(Admin) 직속으로 가입됩니다.', en: 'If left blank, you will be registered under Admin.', zh: '若留空，将直接注册在Admin下。', ja: '空欄の場合、管理者の直下に登録されます。' },
  privacyAgree: { ko: '개인정보 수집 및 이용에 동의합니다.', en: 'I agree to the collection and use of personal information.', zh: '我同意收集和使用个人信息。', ja: '個人情報の収集および利用に同意します。' },
  privacyError: { ko: '개인정보 수집에 동의해야 합니다.', en: 'You must agree to the privacy policy.', zh: '您必须同意隐私政策。', ja: '個人情報の収集に同意する必要があります。' },
  loginBtn: { ko: '로그인', en: 'Sign In', zh: '登录', ja: 'サインイン' },
  registerBtn: { ko: '가입하기', en: 'Sign Up', zh: '注册', ja: 'サインアップ' },
  confirmBtn: { ko: '확인', en: 'OK', zh: '确认', ja: '確認' },
  noAccount: { ko: '계정이 없으신가요?', en: "Don't have an account?", zh: '没有账号？', ja: 'アカウントをお持ちでないですか？' },
  hasAccount: { ko: '이미 계정이 있으신가요?', en: 'Already have an account?', zh: '已有账号？', ja: 'すでにアカウントをお持ちですか？' },
  loginLink: { ko: '로그인', en: 'Login', zh: '登录', ja: 'ログイン' },
  registerLink: { ko: '회원가입', en: 'Register', zh: '注册', ja: '登録' },
  errorUserNotFound: { ko: '아이디 또는 비밀번호가 올바르지 않습니다.', en: 'Invalid username or password.', zh: '用户名或密码无效。', ja: 'IDまたはパスワードが無効입니다.' },
  errorRegFailed: { ko: '가입 실패: 중복된 정보이거나 추천인을 찾을 수 없습니다.', en: 'Registration failed: Duplicate info or invalid referrer.', zh: '注册失败：信息重复或推荐人无效。', ja: '登録失敗：重複情報または无効な紹介者。' },
  errorPasswordMismatch: { ko: '비밀번호가 일치하지 않습니다.', en: 'Passwords do not match.', zh: '密码不匹配。', ja: 'パスワードが一致しません。' },
  regSuccess: { ko: '회원가입이 완료되었습니다.', en: 'Registration successful.', zh: '注册成功。', ja: '登録が完了しました。' },
  regWelcomeMsg: { ko: '등록되었습니다. 환영합니다!', en: 'Registered successfully. Welcome!', zh: '注册成功。欢迎！', ja: '登録されました。ようこそ！' },
  dashboard: { ko: '대시보드', en: 'Dashboard', zh: '仪表板', ja: 'ダッシュボード' },
  myTree: { ko: '내 조직도', en: 'My Network', zh: '我的网络', ja: '組織図' },
  wallet: { ko: '지갑 / 송금', en: 'Wallet', zh: '钱包', ja: 'ウォレット' },
  settings: { ko: '설정', en: 'Settings', zh: '设置', ja: '設定' },
  logout: { ko: '로그아웃', en: 'Logout', zh: '登出', ja: 'ログアウト' },
  adminMenu: { ko: '회원 관리', en: 'User Management', zh: '会员管理', ja: '会員管理' },
  welcome: { ko: '안녕하세요', en: 'Welcome', zh: '你好', ja: 'こんにちは' },
  balance: { ko: '보유 포인트', en: 'Balance', zh: '余额', ja: '残高' },
  partners: { ko: '하위 파트너 수', en: 'Partners', zh: '合作伙伴', ja: 'パートナー' },
  referrals: { ko: '추천인 수', en: 'Direct Referrals', zh: '直推人数', ja: '紹介人数' },
  aiReport: { ko: 'AI 프렉탈 분석 리포트', en: 'AI Fractal Analysis Report', zh: 'AI分形分析报告', ja: 'AIフラクタル分析レポート' },
  analyzing: { ko: 'Gemini가 분석중입니다...', en: 'Gemini is analyzing...', zh: 'Gemini正在分析...', ja: 'Geminiが分析中...' },
  recentTx: { ko: '최근 거래 내역', en: 'Recent Transactions', zh: '最近交易', ja: '最近の取引' },
  noTx: { ko: '거래 내역이 없습니다.', en: 'No transactions.', zh: '无交易记录。', ja: '取引履歴가 없습니다.' },
  nextLevel: { ko: '다음 레벨', en: 'Next Level', zh: '下一等级', ja: '次のレベル' },
  toNextLevel: { ko: '다음 등급까지', en: 'To next level', zh: '距下一等级', ja: '次のレベルまで' },
  maxLevel: { ko: '최고 등급입니다', en: 'Max Level Reached', zh: '达到最高等级', ja: '最高ランク到達' },
  treeTitle: { ko: '조직도', en: 'Network Tree', zh: '网络结构图', ja: '組織図' },
  treeDesc: { ko: '내 하위 추천인 네트워크 구조를 시각적으로 확인하세요.', en: 'Visualize your referral network structure.', zh: '可视化您的推荐网络结构。', ja: '紹介ネットワーク構造を視覚化します。' },
  me: { ko: '나 (본인)', en: 'Me', zh: '我', ja: '私' },
  partner: { ko: '하위 파트너', en: 'Partner', zh: '合作伙伴', ja: 'パートナー' },
  searchPlaceholder: { ko: '아이디, 이름, 전화번호 검색', en: 'Search by ID, Name, Phone', zh: '搜索ID、姓名、电话', ja: 'ID、名前、電話番号検索' },
  searchResults: { ko: '검색 결과', en: 'Results', zh: '结果', ja: '検索結果' },
  tooltipName: { ko: '이름', en: 'Name', zh: '姓名', ja: '名前' },
  tooltipPhone: { ko: '전화번호', en: 'Phone', zh: '电话', ja: '電話番号' },
  menu: { ko: '메뉴', en: 'Menu', zh: '菜单', ja: 'メニュー' },
  menuDesc: { ko: '원하는 서비스를 선택하세요.', en: 'Select a service.', zh: '请选择服务。', ja: 'サービスを選択してください。' },
  myWallet: { ko: '나의 지갑', en: 'My Wallet', zh: '我的钱包', ja: 'マイウォレット' },
  walletDesc: { ko: '포인트를 관리하고 송금할 수 있습니다.', en: 'Manage points and transfers.', zh: '管理积分和转账。', ja: 'ポイントと送金を管理します。' },
  currentBalance: { ko: '현재 보유 잔액', en: 'Current Balance', zh: '当前余额', ja: '現在の残高' },
  deposit: { ko: '충전하기', en: 'Deposit', zh: '充值', ja: '入金' },
  withdraw: { ko: '출금하기', en: 'Withdraw', zh: '提现', ja: '出金' },
  transfer: { ko: '송금하기', en: 'Transfer', zh: '转账', ja: '送金' },
  recipientId: { ko: '받는 사람 (아이디)', en: 'Recipient ID', zh: '收款人ID', ja: '受取人ID' },
  amount: { ko: '금액', en: 'Amount', zh: '金额', ja: '金額' },
  placeholderId: { ko: '상대방의 아이디를 입력하세요', en: 'Enter recipient ID', zh: '输入对方ID', ja: '相手のIDを入力' },
  depositRequested: { ko: '충전 요청이 접수되었습니다. 관리자 승인 대기중입니다.', en: 'Deposit requested. Waiting for admin approval.', zh: '充值申请已提交，等待管理员批准。', ja: '入金申請が受付されました。管理者承認待ちです。' },
  transferSuccess: { ko: '송금이 완료되었습니다.', en: 'Transfer successful.', zh: '转账成功。', ja: '送金が完了しました。' },
  errorBalance: { ko: '잔액이 부족합니다.', en: 'Insufficient balance.', zh: '余额不足。', ja: '残高不足です。' },
  errorSelf: { ko: '본인에게 송금할 수 없습니다.', en: 'Cannot transfer to self.', zh: '不能给自己转账。', ja: '自分に送金することはできません。' },
  errorInvalidUser: { ko: '존재하지 않는 사용자입니다.', en: 'User not found.', zh: '用户不存在。', ja: 'ユーザーが存在しません。' },
  enterAmount: { ko: '올바른 금액을 입력해주세요.', en: 'Enter valid amount.', zh: '请输入有效金额。', ja: '有効な金額を入力してください。' },
  bankName: { ko: '은행명', en: 'Bank Name', zh: '银行名称', ja: '銀行名' },
  accountNumber: { ko: '계좌번호', en: 'Account Number', zh: '账号', ja: '口座番号' },
  accountHolder: { ko: '예금주', en: 'Account Holder', zh: '户名', ja: '口座名義' },
  withdrawNotice: { ko: '출금 수수료는 3.3%를 제외하고 나갑니다.', en: 'A 3.3% fee will be deducted from the withdrawal.', zh: '提现将扣除3.3%的手续费。', ja: '出金手数料3.3%が差し引かれます。' },
  errorUnit10k: { ko: '10,000원 단위로만 출금 가능합니다.', en: 'Withdrawals must be in units of 10,000.', zh: '提现金额必须是10,000的倍数。', ja: '出金は10,000単位でのみ可能です。' },
  fillBankInfo: { ko: '은행 정보를 모두 입력해주세요.', en: 'Please fill in all bank information.', zh: '请填写所有银行信息。', ja: '銀行情報をすべて入力してください。' },
  settingsTitle: { ko: '계정 설정', en: 'Account Settings', zh: '账户设置', ja: 'アカウント設定' },
  settingsDesc: { ko: '비밀번호를 변경하고 계정을 관리하세요.', en: 'Change password and manage account.', zh: '更改密码并管理账户。', ja: 'パスワードを変更してアカウントを管理します。' },
  changePassword: { ko: '비밀번호 변경', en: 'Change Password', zh: '更改密码', ja: 'パスワード変更' },
  currentPassword: { ko: '현재 비밀번호', en: 'Current Password', zh: '当前密码', ja: '現在のパスワード' },
  newPassword: { ko: '새 비밀번호', en: 'New Password', zh: '新密码', ja: '新しいパスワード' },
  confirmNewPassword: { ko: '새 비밀번호 확인', en: 'Confirm New Password', zh: '确认新密码', ja: '新しいパスワード確認' },
  passwordChanged: { ko: '비밀번호가 성공적으로 변경되었습니다.', en: 'Password changed successfully.', zh: '密码已成功更改。', ja: 'パスワードが正常に変更されました。' },
  errorPasswordIncorrect: { ko: '현재 비밀번호가 일치하지 않습니다.', en: 'Incorrect current password.', zh: '当前密码不正确。', ja: '現在のパスワードが間違っています。' },
  saveChanges: { ko: '변경사항 저장', en: 'Save Changes', zh: '保存更改', ja: '変更を保存' },
  adminTitle: { ko: '회원 관리 & 일괄 지급', en: 'Admin Dashboard', zh: '管理员控制台', ja: '管理者ダッシュボード' },
  adminDesc: { ko: '회원 등급을 관리하고 포인트를 일괄 지급합니다.', en: 'Manage user levels and bulk distribute points.', zh: '管理用户等级并批量分发积分。', ja: '会員ランクを管理し、ポイントを一括配布します。' },
  totalUsers: { ko: '총 회원 수', en: 'Total Users', zh: '总用户数', ja: '总会员数' },
  edit: { ko: '수정', en: 'Edit', zh: '编辑', ja: '編集' },
  delete: { ko: '삭제', en: 'Delete', zh: '删除', ja: '削除' },
  save: { ko: '저장', en: 'Save', zh: '保存', ja: '保存' },
  cancel: { ko: '취소', en: 'Cancel', zh: '取消', ja: 'キャンセル' },
  actions: { ko: '관리', en: 'Actions', zh: '操作', ja: '管理' },
  updateSuccess: { ko: '회원 정보가 수정되었습니다.', en: 'User updated successfully.', zh: '用户信息已更新。', ja: '会員情報가修正されました。' },
  updateFail: { ko: '수정 실패: 아이디 또는 전화번호가 중복되었습니다.', en: 'Update failed: Username or phone number exists.', zh: '更新失败：用户名或电话号码已存在。', ja: '更新失敗：IDまたは電話番号が重複しています。' },
  deleteSuccess: { ko: '회원이 삭제되었습니다.', en: 'User deleted successfully.', zh: '用户已删除。', ja: 'ユーザーが削除されました。' },
  confirmDelete: { ko: '정말로 이 회원을 삭제하시겠습니까? 하위 파트너는 상위 추천인으로 이동합니다.', en: 'Are you sure you want to delete this user? Downline partners will be moved to the referrer.', zh: '您确定要删除此用户吗？下线合作伙伴将转移给推荐人。', ja: '本当にこのユーザーを削除しますか？ 下位パートナーは上位の紹介者に移動します。' },
  level: { ko: '등급', en: 'Level', zh: '等级', ja: 'ランク' },
  lvl_ALL: { ko: '전체 회원', en: 'All Users', zh: '所有用户', ja: '全会員' },
  lvl_MEMBER: { ko: '일반회원', en: 'Member', zh: '普通会员', ja: '一般会員' },
  lvl_VIP: { ko: 'VIP (3명↑)', en: 'VIP (3+)', zh: 'VIP (3+)', ja: 'VIP (3名↑)' },
  lvl_VVIP: { ko: 'VVIP (5명↑)', en: 'VVIP (5+)', zh: 'VVIP (5+)', ja: 'VVIP (5名↑)' },
  lvl_DISTRIBUTOR: { ko: '총판 (10명↑)', en: 'Distributor (10+)', zh: '总代理 (10+)', ja: '総代理店 (10名↑)' },
  lvl_DIRECTOR: { ko: '이사 (관리자지정)', en: 'Director', zh: '理事', ja: '理事' },
  bulkSendTitle: { ko: '포인트 일괄 지급', en: 'Bulk Point Distribution', zh: '批量积分发送', ja: 'ポイント一括支給' },
  bulkTarget: { ko: '지급 대상', en: 'Target Group', zh: '目标群体', ja: '支給対象' },
  bulkSelected: { ko: '선택된 회원', en: 'Selected Users', zh: '已选用户', ja: '選択されたユーザー' },
  bulkAmount: { ko: '지급 포인트', en: 'Points to Send', zh: '发送积分', ja: '支給ポイント' },
  bulkType: { ko: '보너스 종류', en: 'Bonus Type', zh: '奖金类型', ja: 'ボーナス種類' },
  bulkSendBtn: { ko: '일괄 보내기', en: 'Send to All', zh: '全部发送', ja: '一括送信' },
  bulkSuccess: { ko: '명에게 포인트 지급 완료', en: 'points distributed to users.', zh: '积分已分发给用户。', ja: '名にポイント支給完了' },
  setDirector: { ko: '이사 설정', en: 'Set Director', zh: '设为理事', ja: '理事設定' },
  unsetDirector: { ko: '이사 해제', en: 'Unset Director', zh: '取消理事', ja: '理事解除' },
  adminDepositsTitle: { ko: '충전 요청 관리', en: 'Deposit Requests', zh: '充值申请管理', ja: '入金申請管理' },
  approve: { ko: '승인', en: 'Approve', zh: '批准', ja: '承認' },
  reject: { ko: '거절', en: 'Reject', zh: '拒绝', ja: '拒否' },
  status_PENDING: { ko: '대기', en: 'Pending', zh: '等待', ja: '待機' },
  status_COMPLETED: { ko: '완료', en: 'Completed', zh: '完成', ja: '完了' },
  status_REJECTED: { ko: '거절됨', en: 'Rejected', zh: '已拒绝', ja: '拒否' },
  noPendingDeposits: { ko: '대기중인 충전 요청이 없습니다.', en: 'No pending deposit requests.', zh: '没有待处理的充值申请。', ja: '待機中の入金申請はありません。' },
  date: { ko: '날짜', en: 'Date', zh: '日期', ja: '日付' },
  bonus_SIGN_UP: { ko: '가입 보너스', en: 'Sign Up Bonus', zh: '注册奖金', ja: 'サインアップボーナス' },
  bonus_DAILY: { ko: '매일 보너스', en: 'Daily Bonus', zh: '每日奖金', ja: 'デイリーボーナス' },
  bonus_WEEKLY: { ko: '주간 보너스', en: 'Weekly Bonus', zh: '每周奖金', ja: 'ウィークリーボーナス' },
  bonus_MONTHLY: { ko: '월간 보너스', en: 'Monthly Bonus', zh: '每月奖金', ja: 'マンスリーボーナス' },
  bonus_SPECIAL: { ko: '특별 보너스', en: 'Special Bonus', zh: '特别奖金', ja: '特别ボーナス' },
  withdrawSuccess: { ko: '포인트가 출금 신청되었습니다.', en: 'Withdrawal requested.', zh: '提现已申请。', ja: '出金が申請されました。' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};