export interface ResumeFormData {
  // 必須項目
  name: string;
  furigana: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: "male" | "female";

  // 任意項目
  photo?: string; // Base64 encoded image
  postalCode?: string;
  prefecture?: string;
  city?: string;
  address?: string;
  building?: string;
  email?: string;
  phone?: string;

  // 学歴
  education?: EducationEntry[];

  // 職歴
  workHistory?: WorkHistoryEntry[];

  // 自己PR
  selfPR?: string;

  // 志望動機
  motivation?: string;

  // 資格
  qualifications?: QualificationEntry[];

  // 本人希望欄
  remarks?: string;
}

export interface EducationEntry {
  id: string;
  year: number;
  month: number;
  schoolName: string;
  type: "entry" | "graduation";
}

export interface WorkHistoryEntry {
  id: string;
  year: number;
  month: number;
  companyName: string;
  type: "entry" | "exit";
  description?: string;
}

export interface QualificationEntry {
  id: string;
  year: number;
  month: number;
  name: string;
}
