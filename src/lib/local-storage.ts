import { ResumeFormData } from "@/types/resume";
import { CareerFormData } from "@/types/career";

const STORAGE_KEY = "rirekisho_form_data";
const CAREER_STORAGE_KEY = "rirekisho_career_data";

export function saveToLocalStorage(data: ResumeFormData): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }
}

export function loadFromLocalStorage(): ResumeFormData | null {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }
  return null;
}

export function clearLocalStorage(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }
}

// 職務経歴書用のローカルストレージ関数
export function saveCareerToLocalStorage(data: CareerFormData): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save career data to localStorage:", error);
    }
  }
}

export function loadCareerFromLocalStorage(): CareerFormData | null {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(CAREER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load career data from localStorage:", error);
      return null;
    }
  }
  return null;
}

export function clearCareerLocalStorage(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CAREER_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear career data from localStorage:", error);
    }
  }
}

// 履歴書と職務経歴書で基本情報を共有する関数
export function getSharedBasicInfo(): {
  name?: string;
  furigana?: string;
  birthDate?: string;
  gender?: "male" | "female";
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  building?: string;
  email?: string;
  phone?: string;
} {
  const resumeData = loadFromLocalStorage();
  const careerData = loadCareerFromLocalStorage();

  // 最新のデータを使用（職務経歴書を優先）
  return {
    name: careerData?.name || resumeData?.name,
    furigana: careerData?.furigana || resumeData?.furigana,
    birthDate: careerData?.birthDate || resumeData?.birthDate,
    gender: careerData?.gender || resumeData?.gender,
    postalCode: careerData?.postalCode || resumeData?.postalCode,
    prefecture: careerData?.prefecture || resumeData?.prefecture,
    city: careerData?.city || resumeData?.city,
    address: careerData?.address || resumeData?.address,
    building: careerData?.building || resumeData?.building,
    email: careerData?.email || resumeData?.email,
    phone: careerData?.phone || resumeData?.phone,
  };
}
