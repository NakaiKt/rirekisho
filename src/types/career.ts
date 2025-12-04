// 職務経歴書のデータ型定義

export interface CareerFormData {
  // 基本情報（履歴書と共有）
  name: string;
  furigana: string;
  birthDate: string;
  gender: "male" | "female";

  // 住所情報（履歴書と共有、任意）
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  building?: string;

  // 連絡先（履歴書と共有、任意）
  email?: string;
  phone?: string;

  // 職務要約
  summary?: string;

  // 職務経歴の詳細
  careerHistory?: CareerHistoryEntry[];

  // 保有スキル
  skills?: SkillEntry[];
}

export interface CareerHistoryEntry {
  id: string;
  companyName: string;
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  employmentType?: "fullTime" | "contract" | "partTime" | "dispatch"; // 正社員、契約社員、アルバイト・パート、派遣
  department?: string; // 部署
  position?: string; // 役職
  jobDescription?: string; // 業務内容
  achievements?: string; // 実績・成果
  technologies?: string; // 使用技術・スキル
}

export interface SkillEntry {
  id: string;
  category?: string; // カテゴリ（例：プログラミング言語、フレームワーク、ツール等）
  skillName: string;
  experience?: string; // 経験年数や詳細
}
