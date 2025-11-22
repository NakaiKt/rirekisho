import { z } from "zod";

export const resumeSchema = z.object({
  // 必須項目
  name: z.string().min(1, "お名前は必須です"),
  furigana: z.string().min(1, "ふりがなは必須です"),
  birthYear: z
    .number({ invalid_type_error: "数字を入力してください" })
    .min(1900, "正しい年を入力してください")
    .max(new Date().getFullYear(), "正しい年を入力してください"),
  birthMonth: z
    .number({ invalid_type_error: "数字を入力してください" })
    .min(1, "月は1〜12で入力してください")
    .max(12, "月は1〜12で入力してください"),
  birthDay: z
    .number({ invalid_type_error: "数字を入力してください" })
    .min(1, "日は1〜31で入力してください")
    .max(31, "日は1〜31で入力してください"),
  gender: z.enum(["male", "female"], {
    required_error: "性別を選択してください",
  }),

  // 任意項目
  photo: z.string().optional(),
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  building: z.string().optional(),
  email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  phone: z.string().optional(),

  education: z
    .array(
      z.object({
        id: z.string(),
        year: z.number(),
        month: z.number(),
        schoolName: z.string(),
        type: z.enum(["entry", "graduation"]),
      })
    )
    .optional(),

  workHistory: z
    .array(
      z.object({
        id: z.string(),
        year: z.number(),
        month: z.number(),
        companyName: z.string(),
        type: z.enum(["entry", "exit"]),
        description: z.string().optional(),
      })
    )
    .optional(),

  selfPR: z.string().optional(),
  motivation: z.string().optional(),

  qualifications: z
    .array(
      z.object({
        id: z.string(),
        year: z.number(),
        month: z.number(),
        name: z.string(),
      })
    )
    .optional(),

  remarks: z.string().optional(),
});

export type ResumeFormData = z.infer<typeof resumeSchema>;
