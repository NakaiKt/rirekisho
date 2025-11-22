import { z } from "zod";

export const resumeSchema = z.object({
  // 必須項目
  name: z.string().min(1, "お名前は必須です"),
  furigana: z.string().min(1, "ふりがなは必須です"),
  birthDate: z
    .string()
    .min(1, "生年月日は必須です")
    .regex(/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/, "YYYY/MM/DD形式で入力してください")
    .refine((value) => {
      const [year, month, day] = value.split("/").map(Number);
      if (!year || !month || !day) return false;
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        year >= 1900 &&
        year <= new Date().getFullYear()
      );
    }, "存在する日付を入力してください"),
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
        schoolName: z.string().min(1, "学校名を入力してください"),
        entryYear: z.number(),
        entryMonth: z.number(),
        status: z.enum(["graduated", "withdrawn", "completed", "enrolled"]),
        completionYear: z.number().optional(),
        completionMonth: z.number().optional(),
      })
    )
    .refine(
      (entries) =>
        entries.every((entry) => {
          if (entry.status === "enrolled") return true;
          return typeof entry.completionYear === "number" && typeof entry.completionMonth === "number";
        }),
      {
        message: "卒業・中退・修了を選択した場合は終了年月を入力してください",
        path: ["education"],
      }
    )
    .optional(),

  workHistory: z
    .array(
      z.object({
        id: z.string(),
        companyName: z.string().min(1, "会社名を入力してください"),
        entryYear: z.number(),
        entryMonth: z.number(),
        status: z.enum(["employed", "resigned"]),
        exitYear: z.number().optional(),
        exitMonth: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .refine(
      (entries) =>
        entries.every((entry) => {
          if (entry.status === "employed") return true;
          return typeof entry.exitYear === "number" && typeof entry.exitMonth === "number";
        }),
      {
        message: "退社を選択した場合は退社年月を入力してください",
        path: ["workHistory"],
      }
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
