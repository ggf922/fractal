-- FRACTAL App Database Schema
-- Supabase SQL Editor에서 실행하세요

-- 1. Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  country VARCHAR(5) DEFAULT 'KR',
  special_grade VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'TRANSFER_IN', 'TRANSFER_OUT')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED')),
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  bonus_type VARCHAR(20),
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_user_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Admin 계정 생성 (최초 1회만)
INSERT INTO users (username, name, password, phone_number, referral_code, balance, country, special_grade)
VALUES ('admin', '관리자', 'admin123', '010-0000-0000', 'ADMIN1', 1000000, 'KR', 'DIRECTOR')
ON CONFLICT (username) DO NOTHING;

-- 4. Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 - 모든 사용자가 읽기/쓰기 가능 (개발용)
-- 상용화 시에는 더 엄격한 정책 적용 권장

-- Users 테이블 정책
CREATE POLICY "Allow all users to read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update users" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete users" ON users
  FOR DELETE USING (true);

-- Transactions 테이블 정책
CREATE POLICY "Allow all users to read transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update transactions" ON transactions
  FOR UPDATE USING (true);

-- 6. 실시간 기능 활성화 (Supabase Realtime)
-- Supabase Dashboard > Database > Replication에서 users, transactions 테이블 활성화 필요

-- 완료 메시지
SELECT 'FRACTAL Database schema created successfully!' AS message;



