import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ResumeFormData, resumeSchema } from "@/lib/validation";
import { calculateSchoolSchedule } from "@/lib/era-converter";
import { searchPostalCode } from "@/lib/postal-code";
import { generateResumePDF } from "@/lib/pdf-generator";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/local-storage";

const parseBirthDate = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("/").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
};

export const createBirthDateFormatter = (
  setValue: (name: "birthDate", value: string) => void,
) =>
  (rawValue: string) => {
    const raw = rawValue.replace(/[^0-9]/g, "");
    const limited = raw.slice(0, 8);
    const parts: string[] = [];

    if (limited.length >= 4) {
      parts.push(limited.slice(0, 4));
      if (limited.length >= 6) {
        parts.push(limited.slice(4, 6));
        if (limited.length > 6) {
          parts.push(limited.slice(6, 8));
        }
      } else {
        parts.push(limited.slice(4));
      }
    } else {
      parts.push(limited);
    }

    const formatted = parts.join("/");
    setValue("birthDate", formatted);
  };

export function useResumeForm() {
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      birthDate: "",
      education: [],
      workHistory: [],
      qualifications: [],
    },
  });

  const { control, watch, setValue, reset } = form;

  const educationArray = useFieldArray({ control, name: "education" });
  const workHistoryArray = useFieldArray({ control, name: "workHistory" });
  const qualificationArray = useFieldArray({ control, name: "qualifications" });

  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const formValues = watch();
  const selfPRValue = watch("selfPR") || "";
  const motivationValue = watch("motivation") || "";
  const remarksValue = watch("remarks") || "";
  const postalCodeValue = watch("postalCode") || "";
  const birthDateValue = watch("birthDate") || "";
  const isPostalCodeComplete = postalCodeValue.replace(/-/g, "").length === 7;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [postalLookupMessage, setPostalLookupMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const birthDateFormatter = useMemo(
    () => createBirthDateFormatter((name, value) => setValue(name, value)),
    [setValue],
  );

  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      Object.keys(savedData).forEach((key) => {
        setValue(key as any, (savedData as any)[key]);
      });
    }
  }, [setValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage(formValues as any);
    }, 500);

    return () => clearTimeout(timer);
  }, [formValues]);

  const parsedBirthDate = parseBirthDate(birthDateValue);
  const schoolSchedule = parsedBirthDate
    ? calculateSchoolSchedule(parsedBirthDate.year, parsedBirthDate.month, parsedBirthDate.day)
    : null;

  const handlePostalLookup = async () => {
    const postalCode = postalCodeValue;
    setPostalLookupMessage(null);
    if (!postalCode || postalCode.replace(/-/g, "").length !== 7) {
      setPostalLookupMessage("郵便番号は7桁で入力してください。");
      return;
    }

    const result = await searchPostalCode(postalCode);
    if (result) {
      setValue("prefecture", result.prefecture);
      setValue("city", result.city);
      setValue("address", result.address);
    } else {
      setPostalLookupMessage("住所を見つけられませんでした。手入力してください。");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ResumeFormData> = async () => {
    if (!resumePreviewRef.current) {
      alert("プレビューの生成に失敗しました。");
      return;
    }

    setIsGenerating(true);
    try {
      setSubmitError(null);
      await generateResumePDF(resumePreviewRef.current);
    } catch (error) {
      console.error("PDF生成に失敗しました:", error);
      alert("PDF生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const onError = () => {
    setSubmitError("未入力または不正な項目があります。赤枠の入力欄を確認してください。");
    const firstErrorElement = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstErrorElement?.focus();
  };

  const handleFillSample = () => {
    const sampleData: ResumeFormData = {
      name: "山田 太郎",
      furigana: "やまだ たろう",
      birthDate: "1990/04/15",
      gender: "male",
      postalCode: "100-0001",
      prefecture: "東京都",
      city: "千代田区",
      address: "千代田1-1",
      building: "テストビル101号室",
      email: "taro.yamada@example.com",
      phone: "09012345678",
      education: [
        {
          id: crypto.randomUUID(),
          entryYear: 2006,
          entryMonth: 4,
          completionYear: 2009,
          completionMonth: 3,
          schoolName: "東京都立第一高等学校",
          status: "graduated",
        },
        {
          id: crypto.randomUUID(),
          entryYear: 2009,
          entryMonth: 4,
          completionYear: 2013,
          completionMonth: 3,
          schoolName: "東京大学 経済学部",
          status: "graduated",
        },
      ],
      workHistory: [
        {
          id: crypto.randomUUID(),
          entryYear: 2013,
          entryMonth: 4,
          exitYear: 2018,
          exitMonth: 3,
          companyName: "株式会社サンプル",
          status: "resigned",
        },
        {
          id: crypto.randomUUID(),
          entryYear: 2018,
          entryMonth: 4,
          companyName: "ABCソリューションズ株式会社",
          status: "employed",
        },
      ],
      qualifications: [
        {
          id: crypto.randomUUID(),
          year: 2012,
          month: 9,
          name: "TOEIC 900点",
        },
        {
          id: crypto.randomUUID(),
          year: 2015,
          month: 12,
          name: "基本情報技術者",
        },
      ],
      selfPR:
        "チームでの成果を重視し、課題解決のために主体的に動くことを心掛けています。",
      motivation:
        "SaaSプロダクトの成長に携わり、ユーザー価値を高めることに挑戦したいと考えています。",
      remarks: "普通自動車第一種免許（2010年取得）",
    };

    reset(sampleData);
    saveToLocalStorage(sampleData);
  };

  const handleSubmitForm = form.handleSubmit(onSubmit, onError);

  return {
    form,
    formRef,
    resumePreviewRef,
    educationArray,
    workHistoryArray,
    qualificationArray,
    birthDateValue,
    postalCodeValue,
    schoolSchedule,
    isPostalCodeComplete,
    submitError,
    postalLookupMessage,
    isGenerating,
    formValues,
    selfPRLength: selfPRValue.length,
    motivationLength: motivationValue.length,
    remarksLength: remarksValue.length,
    handleSubmitForm,
    handlePostalLookup,
    handlePhotoUpload,
    handleFillSample,
    birthDateFormatter,
    setSubmitError,
    setPostalLookupMessage,
    setValue,
  };
}
