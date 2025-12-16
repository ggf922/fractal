import { createClient } from '@supabase/supabase-js';

// Vite 환경 변수에서 Supabase 설정 값을 가져옵니다.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// 키가 없을 경우 경고를 출력하지만 앱이 멈추지 않도록 null 처리를 합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL 또는 Key가 누락되었습니다. .env 파일을 확인해주세요.');
}

// 클라이언트 생성 (키가 유효할 때만)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;