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
        entryYear: z.number().optional(),
        entryMonth: z.number().optional(),
        status: z.enum(["graduated", "withdrawn", "completed", "enrolled"]),
        completionYear: z.number().optional(),
        completionMonth: z.number().optional(),
      })
    )
    .superRefine((entries, ctx) => {
      entries.forEach((entry, index) => {
        if (typeof entry.entryYear !== "number" || Number.isNaN(entry.entryYear)) {
          ctx.addIssue({
            code: "custom",
            message: "入学年を入力してください",
            path: [index, "entryYear"],
          });
        }

        if (typeof entry.entryMonth !== "number" || Number.isNaN(entry.entryMonth)) {
          ctx.addIssue({
            code: "custom",
            message: "入学月を入力してください",
            path: [index, "entryMonth"],
          });
        }

        if (entry.status !== "enrolled") {
          if (typeof entry.completionYear !== "number" || Number.isNaN(entry.completionYear)) {
            ctx.addIssue({
              code: "custom",
              message: "終了年を入力してください",
              path: [index, "completionYear"],
            });
          }

          if (typeof entry.completionMonth !== "number" || Number.isNaN(entry.completionMonth)) {
            ctx.addIssue({
              code: "custom",
              message: "終了月を入力してください",
              path: [index, "completionMonth"],
            });
          }
        }
      });
    })
    .optional(),

  workHistory: z
    .array(
      z.object({
        id: z.string(),
        companyName: z.string().min(1, "会社名を入力してください"),
        entryYear: z.number().optional(),
        entryMonth: z.number().optional(),
        status: z.enum(["employed", "resigned"]),
        exitYear: z.number().optional(),
        exitMonth: z.number().optional(),
      })
    )
    .superRefine((entries, ctx) => {
      entries.forEach((entry, index) => {
        if (typeof entry.entryYear !== "number" || Number.isNaN(entry.entryYear)) {
          ctx.addIssue({
            code: "custom",
            message: "入社年を入力してください",
            path: [index, "entryYear"],
          });
        }

        if (typeof entry.entryMonth !== "number" || Number.isNaN(entry.entryMonth)) {
          ctx.addIssue({
            code: "custom",
            message: "入社月を入力してください",
            path: [index, "entryMonth"],
          });
        }

        if (entry.status === "resigned") {
          if (typeof entry.exitYear !== "number" || Number.isNaN(entry.exitYear)) {
            ctx.addIssue({
              code: "custom",
              message: "退社年を入力してください",
              path: [index, "exitYear"],
            });
          }

          if (typeof entry.exitMonth !== "number" || Number.isNaN(entry.exitMonth)) {
            ctx.addIssue({
              code: "custom",
              message: "退社月を入力してください",
              path: [index, "exitMonth"],
            });
          }
        }
      });
    })
    .optional(),

  selfPR: z.string().optional(),
  motivation: z.string().optional(),

  qualifications: z
    .array(
      z.object({
        id: z.string(),
        year: z.number().optional(),
        month: z.number().optional(),
        name: z.string(),
      })
    )
    .superRefine((entries, ctx) => {
      entries.forEach((entry, index) => {
        if (typeof entry.year !== "number" || Number.isNaN(entry.year)) {
          ctx.addIssue({
            code: "custom",
            message: "取得年を入力してください",
            path: [index, "year"],
          });
        }

        if (typeof entry.month !== "number" || Number.isNaN(entry.month)) {
          ctx.addIssue({
            code: "custom",
            message: "取得月を入力してください",
            path: [index, "month"],
          });
        }
      });
    })
    .optional(),

  remarks: z.string().optional(),
});

export type ResumeFormData = z.infer<typeof resumeSchema>;

// 職務経歴書のバリデーションスキーマ
export const careerSchema = z.object({
  // 必須項目（履歴書と共有）
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

  // 任意項目（履歴書と共有）
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  building: z.string().optional(),
  email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  phone: z.string().optional(),

  // 職務経歴書固有の項目
  summary: z.string().optional(), // 職務要約

  careerHistory: z
    .array(
      z.object({
        id: z.string(),
        companyName: z.string().min(1, "会社名を入力してください"),
        startYear: z.number().optional(),
        startMonth: z.number().optional(),
        endYear: z.number().optional(),
        endMonth: z.number().optional(),
        employmentType: z.enum(["fullTime", "contract", "partTime", "dispatch"]).optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        jobDescription: z.string().optional(),
        achievements: z.string().optional(),
        technologies: z.string().optional(),
      })
    )
    .superRefine((entries, ctx) => {
      entries.forEach((entry, index) => {
        if (typeof entry.startYear !== "number" || Number.isNaN(entry.startYear)) {
          ctx.addIssue({
            code: "custom",
            message: "入社年を入力してください",
            path: [index, "startYear"],
          });
        }

        if (typeof entry.startMonth !== "number" || Number.isNaN(entry.startMonth)) {
          ctx.addIssue({
            code: "custom",
            message: "入社月を入力してください",
            path: [index, "startMonth"],
          });
        }
      });
    })
    .optional(),

  skills: z
    .array(
      z.object({
        id: z.string(),
        category: z.string().optional(),
        skillName: z.string().min(1, "スキル名を入力してください"),
        experience: z.string().optional(),
      })
    )
    .optional(),
});

export type CareerFormData = z.infer<typeof careerSchema>;
