"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResumeFormData, resumeSchema } from "@/lib/validation";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Shield, Plus, Trash2 } from "lucide-react";
import { calculateSchoolSchedule } from "@/lib/era-converter";
import { searchPostalCode, formatPostalCode } from "@/lib/postal-code";
import { generateResumePDF } from "@/lib/pdf-generator";
import { ResumePreview } from "@/components/ResumePreview";

export default function Home() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      birthDate: "",
      education: [],
      workHistory: [],
      qualifications: [],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  });

  const {
    fields: workHistoryFields,
    append: appendWorkHistory,
    remove: removeWorkHistory,
  } = useFieldArray({
    control,
    name: "workHistory",
  });

  const {
    fields: qualificationFields,
    append: appendQualification,
    remove: removeQualification,
  } = useFieldArray({
    control,
    name: "qualifications",
  });

  // PDF生成用のref
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // フォームの値を監視してローカルストレージに保存
  const formValues = watch();
  const selfPRValue = watch("selfPR") || "";
  const motivationValue = watch("motivation") || "";
  const remarksValue = watch("remarks") || "";
  const postalCodeValue = watch("postalCode") || "";
  const birthDateValue = watch("birthDate") || "";
  const isPostalCodeComplete = postalCodeValue.replace(/-/g, "").length === 7;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [postalLookupMessage, setPostalLookupMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const parseBirthDate = (value?: string) => {
    if (!value) return null;
    const [year, month, day] = value.split("/").map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
  };

  useEffect(() => {
    // 初回ロード時にローカルストレージから復元
    const savedData = loadFromLocalStorage();
    if (savedData) {
      Object.keys(savedData).forEach((key) => {
        setValue(key as any, (savedData as any)[key]);
      });
    }
  }, [setValue]);

  useEffect(() => {
    // フォームの値が変更されたら自動保存
    const timer = setTimeout(() => {
      saveToLocalStorage(formValues as any);
    }, 500);

    return () => clearTimeout(timer);
  }, [formValues]);

  // 生年月日から学歴を計算
  const parsedBirthDate = parseBirthDate(birthDateValue);
  const schoolSchedule = parsedBirthDate
    ? calculateSchoolSchedule(parsedBirthDate.year, parsedBirthDate.month, parsedBirthDate.day)
    : null;

  // 郵便番号から住所を自動入力
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

  // 写真のアップロード処理
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

  // PDF生成
  const onSubmit = async (_data: ResumeFormData) => {
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
    const firstErrorElement =
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstErrorElement?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-primary">かんたん履歴書作成</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            シンプルで使いやすい履歴書作成ツール
          </p>
          <div className="flex items-center justify-center mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 max-w-2xl mx-auto">
            <Shield className="w-5 h-5 mr-2" />
            <span>
              このサイトはWEB上で完結します。あなたの情報は端末の外に出ることはありません。
            </span>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>必須項目です。すべて入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 名前 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                    placeholder="山田 太郎"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="furigana">
                    ふりがな <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="furigana"
                    aria-invalid={!!errors.furigana}
                    {...register("furigana")}
                    placeholder="やまだ たろう"
                    className={errors.furigana ? "border-red-500" : ""}
                  />
                  {errors.furigana && (
                    <p className="text-sm text-red-500">{errors.furigana.message}</p>
                  )}
                </div>
              </div>

              {/* 生年月日 */}
              <div className="space-y-2">
                <Label>
                  生年月日 <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-1">
                  <Input
                    id="birthDate"
                    inputMode="numeric"
                    placeholder="2000/01/31"
                    aria-invalid={!!errors.birthDate}
                    value={birthDateValue}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const limited = raw.slice(0, 8);
                      const parts = [] as string[];
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
                    }}
                    className={`font-mono ${errors.birthDate ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.birthDate && (
                  <p className="text-sm text-red-500">{errors.birthDate.message}</p>
                )}
              </div>

              {/* 性別 */}
              <div className="space-y-2">
                <Label>
                  性別 <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  defaultValue={formValues.gender}
                  aria-invalid={!!errors.gender}
                  onValueChange={(value) => setValue("gender", value as "male" | "female")}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">
                        男性
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">
                        女性
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 写真 */}
          <Card>
            <CardHeader>
              <CardTitle>証明写真（任意）</CardTitle>
              <CardDescription>
                証明写真をアップロードできます。画像ファイル（JPG, PNG）を選択してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="cursor-pointer"
              />
              {formValues.photo && (
                <div className="mt-4">
                  <Image
                    src={formValues.photo}
                    alt="証明写真"
                    width={128}
                    height={160}
                    unoptimized
                    className="w-32 h-40 object-cover border rounded"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 住所 */}
          <Card>
            <CardHeader>
              <CardTitle>連絡先（任意）</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">郵便番号</Label>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                  <Input
                    id="postalCode"
                    {...register("postalCode")}
                    placeholder="123-4567"
                    maxLength={8}
                    onChange={(e) => {
                      const formatted = formatPostalCode(e.target.value);
                      setValue("postalCode", formatted);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePostalLookup}
                    disabled={!isPostalCodeComplete}
                  >
                    住所を自動入力
                  </Button>
                </div>
                {postalLookupMessage && (
                  <p className="text-sm text-muted-foreground" aria-live="polite">
                    {postalLookupMessage}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prefecture">都道府県</Label>
                  <Input id="prefecture" {...register("prefecture")} placeholder="東京都" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">市区町村</Label>
                  <Input id="city" {...register("city")} placeholder="渋谷区" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">町名・番地</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="渋谷1-2-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">建物名・部屋番号</Label>
                <Input
                  id="building"
                  {...register("building")}
                  placeholder="渋谷ビル 101号室"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="example@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>学歴（任意）</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {educationFields.map((field, index) => {
                  const status =
                    (watch(`education.${index}.status` as const) as
                      | NonNullable<ResumeFormData["education"]>[number]["status"]
                      | undefined) ||
                    field.status ||
                    "graduated";
                  return (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeEducation(index)}
                        aria-label="学歴を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>入学年月</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="2020"
                              {...register(`education.${index}.entryYear` as const, {
                                valueAsNumber: true,
                              })}
                            />
                            <Input
                              type="number"
                              placeholder="4"
                              min="1"
                              max="12"
                              {...register(`education.${index}.entryMonth` as const, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>終了年月</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="2024"
                              disabled={status === "enrolled"}
                              {...register(`education.${index}.completionYear` as const, {
                                setValueAs: (value) => (value === "" ? undefined : Number(value)),
                              })}
                            />
                            <Input
                              type="number"
                              placeholder="3"
                              min="1"
                              max="12"
                              disabled={status === "enrolled"}
                              {...register(`education.${index}.completionMonth` as const, {
                                setValueAs: (value) => (value === "" ? undefined : Number(value)),
                              })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <select
                            {...register(`education.${index}.status` as const, {
                              onChange: (e) => {
                                const value =
                                  e.target.value as NonNullable<
                                    ResumeFormData["education"]
                                  >[number]["status"];
                                setValue(`education.${index}.status` as const, value);
                                if (value === "enrolled") {
                                  setValue(`education.${index}.completionYear` as const, undefined);
                                  setValue(`education.${index}.completionMonth` as const, undefined);
                                }
                              },
                            })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="graduated">卒業</option>
                            <option value="withdrawn">中退</option>
                            <option value="completed">修了</option>
                            <option value="enrolled">在学中</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>学校名</Label>
                        <Input
                          {...register(`education.${index}.schoolName` as const)}
                          placeholder="○○大学 △△学部"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendEducation({
                    id: crypto.randomUUID(),
                    entryYear: undefined,
                    entryMonth: undefined,
                    schoolName: "",
                    status: "graduated",
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                学歴を追加
              </Button>

              <div className="space-y-3 rounded-lg border bg-muted/60 p-4">
                {schoolSchedule && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900">学歴目安</p>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>小学校: {schoolSchedule.elementary.entry} 入学 → {schoolSchedule.elementary.graduation} 卒業</p>
                      <p>中学校: {schoolSchedule.juniorHigh.entry} 入学 → {schoolSchedule.juniorHigh.graduation} 卒業</p>
                      <p>高校: {schoolSchedule.high.entry} 入学 → {schoolSchedule.high.graduation} 卒業</p>
                      <p>大学: {schoolSchedule.university.entry} 入学 → {schoolSchedule.university.graduation} 卒業</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1"></div>
              </div>
            </CardContent>
          </Card>

          {/* 職歴 */}
          <Card>
            <CardHeader>
              <CardTitle>職歴（任意）</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {workHistoryFields.map((field, index) => {
                  type WorkStatus =
                    NonNullable<ResumeFormData["workHistory"]>[number]["status"];
                  const status =
                    (watch(`workHistory.${index}.status` as const) as
                      | WorkStatus
                      | undefined) ||
                    field.status ||
                    "employed";
                  return (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeWorkHistory(index)}
                        aria-label="職歴を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>入社年月</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="2020"
                              {...register(`workHistory.${index}.entryYear` as const, {
                                valueAsNumber: true,
                              })}
                            />
                            <Input
                              type="number"
                              placeholder="4"
                              min="1"
                              max="12"
                              {...register(`workHistory.${index}.entryMonth` as const, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>退社年月</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="2024"
                              disabled={status === "employed"}
                              {...register(`workHistory.${index}.exitYear` as const, {
                                setValueAs: (value) => (value === "" ? undefined : Number(value)),
                              })}
                            />
                            <Input
                              type="number"
                              placeholder="3"
                              min="1"
                              max="12"
                              disabled={status === "employed"}
                              {...register(`workHistory.${index}.exitMonth` as const, {
                                setValueAs: (value) => (value === "" ? undefined : Number(value)),
                              })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <select
                            {...register(`workHistory.${index}.status` as const, {
                              onChange: (e) => {
                                const value = e.target.value as WorkStatus;
                                setValue(`workHistory.${index}.status` as const, value);
                                if (value === "employed") {
                                  setValue(`workHistory.${index}.exitYear` as const, undefined);
                                  setValue(`workHistory.${index}.exitMonth` as const, undefined);
                                }
                              },
                            })}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="employed">在職中</option>
                            <option value="resigned">退社</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>会社名</Label>
                        <Input
                          {...register(`workHistory.${index}.companyName` as const)}
                          placeholder="株式会社○○"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>業務内容（任意）</Label>
                        <Textarea
                          {...register(`workHistory.${index}.description` as const)}
                          placeholder="担当業務や役職など"
                          rows={5}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendWorkHistory({
                    id: crypto.randomUUID(),
                    entryYear: undefined,
                    entryMonth: undefined,
                    companyName: "",
                    status: "employed",
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                職歴を追加
              </Button>
            </CardContent>
          </Card>

          {/* 資格 */}
          <Card>
            <CardHeader>
              <CardTitle>資格・免許（任意）</CardTitle>
              <CardDescription>
                取得した資格や免許を追加できます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualificationFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeQualification(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>年</Label>
                      <Input
                        type="number"
                        {...register(`qualifications.${index}.year` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="2020"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>月</Label>
                      <Input
                        type="number"
                        {...register(`qualifications.${index}.month` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="4"
                        min="1"
                        max="12"
                      />
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-2">
                    <Label>資格・免許名</Label>
                    <Input
                      {...register(`qualifications.${index}.name` as const)}
                      placeholder="例：普通自動車第一種運転免許"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendQualification({
                    id: crypto.randomUUID(),
                    year: undefined,
                    month: undefined,
                    name: "",
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                資格を追加
              </Button>
            </CardContent>
          </Card>

          {/* 自己PR */}
          <Card>
            <CardHeader>
              <CardTitle>自己PR（任意）</CardTitle>
              <CardDescription>
                あなたの強みや特技、これまでの経験をアピールしましょう。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-medium mb-2">💡 自己PRの書き方のポイント</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>具体的なエピソードを交えて書く</li>
                  <li>数字や実績を盛り込むと説得力が増す</li>
                  <li>応募先企業で活かせる強みを強調する</li>
                  <li>200〜400字程度が目安</li>
                </ul>
              </div>
              <div className="flex justify-end text-sm text-muted-foreground">
                文字数: {selfPRValue.length}
              </div>
              <Textarea
                {...register("selfPR")}
                placeholder="例：私の強みは、コミュニケーション能力と問題解決力です。前職では..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* 志望動機 */}
          <Card>
            <CardHeader>
              <CardTitle>志望動機（任意）</CardTitle>
              <CardDescription>
                なぜこの企業・職種を志望するのか、あなたの思いを伝えましょう。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-medium mb-2">💡 志望動機の書き方のポイント</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>企業研究を行い、その企業ならではの魅力を述べる</li>
                  <li>自分の経験やスキルと関連付ける</li>
                  <li>入社後にどう貢献したいかを具体的に書く</li>
                  <li>200〜400字程度が目安</li>
                </ul>
              </div>
              <div className="flex justify-end text-sm text-muted-foreground">
                文字数: {motivationValue.length}
              </div>
              <Textarea
                {...register("motivation")}
                placeholder="例：貴社の〇〇という理念に共感し、これまでの経験を活かして..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* 本人希望欄 */}
          <Card>
            <CardHeader>
              <CardTitle>本人希望欄（任意）</CardTitle>
              <CardDescription>
                勤務時間、勤務地、その他特記事項があれば記入してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-end text-sm text-muted-foreground">
                文字数: {remarksValue.length}
              </div>
              <Textarea
                {...register("remarks")}
                placeholder="例：勤務地は東京都内を希望します。"
                rows={5}
              />
            </CardContent>
          </Card>

          {/* 提出ボタン */}
          <div className="flex flex-col gap-3 pt-6">
            {submitError && (
              <p className="text-center text-sm text-red-500" aria-live="assertive">
                {submitError}
              </p>
            )}
            <div className="flex justify-center">
              <Button type="submit" size="lg" className="w-full md:w-auto px-12">
                <FileText className="w-5 h-5 mr-2" />
                履歴書を作成する
              </Button>
            </div>
          </div>
        </form>

        {/* フッター */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>入力内容は自動的にブラウザに保存されます</p>
        </div>
      </div>

      {/* PDF生成用の非表示プレビュー */}
      <div className="fixed left-[-9999px] top-0">
        <ResumePreview ref={resumePreviewRef} data={formValues as ResumeFormData} />
      </div>
    </div>
  );
}
