import { GoogleGenerativeAI } from "@google/generative-ai";
import { User, Language } from '../types';

// API Key가 없으면 null로 설정 (AI 기능 비활성화)
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || null;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const getLanguageName = (lang: Language): string => {
  switch(lang) {
    case 'ko': return 'Korean (Hangul)';
    case 'en': return 'English';
    case 'zh': return 'Chinese (Simplified)';
    case 'ja': return 'Japanese';
    default: return 'Korean';
  }
};

export const analyzeNetwork = async (
  currentUser: User,
  downlineCount: number,
  totalDownlineBalance: number,
  language: Language
): Promise<string> => {
  // AI가 설정되지 않은 경우 기본 메시지 반환
  if (!genAI) {
    return "AI 분석 기능을 사용하려면 Gemini API Key가 필요합니다.";
  }
  
  try {
    const langName = getLanguageName(language);
    const prompt = `
      You are a professional financial advisor and network marketing analyst.
      Analyze the following user's status in a referral tree system.

      User Data:
      - Username: ${currentUser.username}
      - Current Balance: ${currentUser.balance} points
      - Direct/Indirect Downline Members: ${downlineCount}
      - Total Network Volume (Downline Balance): ${totalDownlineBalance} points

      Please provide a concise, motivating analysis in ${langName}.
      1. Assess their current growth.
      2. Provide 2 specific actionable tips to grow their network or manage their points better.
      3. Keep the tone professional yet encouraging.
      4. Format with clean bullet points.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || "AI analysis unavailable.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI service is currently unavailable. Please try again later.";
  }
};