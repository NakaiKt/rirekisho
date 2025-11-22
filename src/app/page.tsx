"use client";

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
  const birthYear = watch("birthYear");
  const birthMonth = watch("birthMonth");
  const birthDay = watch("birthDay");
  const schoolSchedule =
    birthYear && birthMonth && birthDay
      ? calculateSchoolSchedule(birthYear, birthMonth, birthDay)
      : null;

  // 郵便番号から住所を自動入力
  const postalCode = watch("postalCode");
  useEffect(() => {
    if (postalCode && postalCode.replace(/-/g, "").length === 7) {
      const result = searchPostalCode(postalCode);
      if (result) {
        setValue("prefecture", result.prefecture);
        setValue("city", result.city);
        setValue("address", result.address);
      }
    }
  }, [postalCode, setValue]);

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
  const onSubmit = async () => {
    if (!resumePreviewRef.current) {
      alert("プレビューの生成に失敗しました。");
      return;
    }

    setIsGenerating(true);
    try {
      await generateResumePDF(resumePreviewRef.current);
    } catch (error) {
      console.error("PDF生成に失敗しました:", error);
      alert("PDF生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>必須項目です。すべて入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 名前 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="number"
                      {...register("birthYear", { valueAsNumber: true })}
                      placeholder="1990"
                      className={errors.birthYear ? "border-red-500" : ""}
                    />
                    <span className="text-sm text-muted-foreground">年</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      {...register("birthMonth", { valueAsNumber: true })}
                      placeholder="1"
                      min="1"
                      max="12"
                      className={errors.birthMonth ? "border-red-500" : ""}
                    />
                    <span className="text-sm text-muted-foreground">月</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      {...register("birthDay", { valueAsNumber: true })}
                      placeholder="1"
                      min="1"
                      max="31"
                      className={errors.birthDay ? "border-red-500" : ""}
                    />
                    <span className="text-sm text-muted-foreground">日</span>
                  </div>
                </div>
                {(errors.birthYear || errors.birthMonth || errors.birthDay) && (
                  <p className="text-sm text-red-500">
                    {errors.birthYear?.message ||
                      errors.birthMonth?.message ||
                      errors.birthDay?.message}
                  </p>
                )}
              </div>

              {/* 性別 */}
              <div className="space-y-2">
                <Label>
                  性別 <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  defaultValue={formValues.gender}
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
                  <img
                    src={formValues.photo}
                    alt="証明写真"
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
              <CardDescription>
                郵便番号を入力すると、住所が自動入力されます（主要な郵便番号のみ対応）。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">郵便番号</Label>
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

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="090-1234-5678"
                />
              </div>
            </CardContent>
          </Card>

          {/* 学歴 */}
          <Card>
            <CardHeader>
              <CardTitle>学歴（任意）</CardTitle>
              <CardDescription>
                学校の入学・卒業情報を追加できます。上記の生年月日から自動計算された目安を参考にしてください。
              </CardDescription>
            </CardHeader>
          <CardContent>
            <div className="space-y-6 lg:grid lg:grid-cols-[1.6fr,1fr] lg:gap-6 lg:space-y-0">
              <div className="space-y-4">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>年</Label>
                        <Input
                          type="number"
                          {...register(`education.${index}.year` as const, {
                            valueAsNumber: true,
                          })}
                          placeholder="2020"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>月</Label>
                        <Input
                          type="number"
                          {...register(`education.${index}.month` as const, {
                            valueAsNumber: true,
                          })}
                          placeholder="4"
                          min="1"
                          max="12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>入学/卒業</Label>
                        <RadioGroup
                          defaultValue={field.type}
                          onValueChange={(value) =>
                            setValue(`education.${index}.type`, value as "entry" | "graduation")
                          }
                        >
                          <div className="flex space-x-2">
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="entry"
                                id={`education-${index}-entry`}
                              />
                              <Label
                                htmlFor={`education-${index}-entry`}
                                className="font-normal cursor-pointer text-sm"
                              >
                                入学
                              </Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="graduation"
                                id={`education-${index}-graduation`}
                              />
                              <Label
                                htmlFor={`education-${index}-graduation`}
                                className="font-normal cursor-pointer text-sm"
                              >
                                卒業
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
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
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendEducation({
                      id: crypto.randomUUID(),
                      year: new Date().getFullYear(),
                      month: 4,
                      schoolName: "",
                      type: "entry",
                    })
                  }
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  学歴を追加
                </Button>
              </div>

              <div className="space-y-4">
                {schoolSchedule && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-blue-900">学歴目安</p>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>小学校: {schoolSchedule.elementary.entry} 入学 → {schoolSchedule.elementary.graduation} 卒業</p>
                      <p>中学校: {schoolSchedule.juniorHigh.entry} 入学 → {schoolSchedule.juniorHigh.graduation} 卒業</p>
                      <p>高校: {schoolSchedule.high.entry} 入学 → {schoolSchedule.high.graduation} 卒業</p>
                      <p>大学: {schoolSchedule.university.entry} 入学 → {schoolSchedule.university.graduation} 卒業</p>
                    </div>
                  </div>
                )}

                <div className="bg-muted border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">入力のヒント</p>
                  <p className="text-sm text-muted-foreground">
                    入学・卒業の区分と年／月を揃えて入力すると並び替えや確認がしやすくなります。学校名には学部や学科まで記載すると、経歴がより伝わりやすくなります。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>

          {/* 職歴 */}
          <Card>
            <CardHeader>
              <CardTitle>職歴（任意）</CardTitle>
              <CardDescription>
                これまでの職歴を追加できます。入社・退社の情報を入力してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workHistoryFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeWorkHistory(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>年</Label>
                      <Input
                        type="number"
                        {...register(`workHistory.${index}.year` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="2020"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>月</Label>
                      <Input
                        type="number"
                        {...register(`workHistory.${index}.month` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="4"
                        min="1"
                        max="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>入社/退社</Label>
                      <RadioGroup
                        defaultValue={field.type}
                        onValueChange={(value) =>
                          setValue(`workHistory.${index}.type`, value as "entry" | "exit")
                        }
                      >
                        <div className="flex space-x-2">
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem
                              value="entry"
                              id={`work-${index}-entry`}
                            />
                            <Label
                              htmlFor={`work-${index}-entry`}
                              className="font-normal cursor-pointer text-sm"
                            >
                              入社
                            </Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem
                              value="exit"
                              id={`work-${index}-exit`}
                            />
                            <Label
                              htmlFor={`work-${index}-exit`}
                              className="font-normal cursor-pointer text-sm"
                            >
                              退社
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
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
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendWorkHistory({
                    id: crypto.randomUUID(),
                    year: new Date().getFullYear(),
                    month: 4,
                    companyName: "",
                    type: "entry",
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
                    year: new Date().getFullYear(),
                    month: 4,
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
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-medium mb-2">💡 自己PRの書き方のポイント</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>具体的なエピソードを交えて書く</li>
                  <li>数字や実績を盛り込むと説得力が増す</li>
                  <li>応募先企業で活かせる強みを強調する</li>
                  <li>200〜400字程度が目安</li>
                </ul>
              </div>
              <Textarea
                {...register("selfPR")}
                placeholder="例：私の強みは、コミュニケーション能力と問題解決力です。前職では..."
                rows={6}
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
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-medium mb-2">💡 志望動機の書き方のポイント</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>企業研究を行い、その企業ならではの魅力を述べる</li>
                  <li>自分の経験やスキルと関連付ける</li>
                  <li>入社後にどう貢献したいかを具体的に書く</li>
                  <li>200〜400字程度が目安</li>
                </ul>
              </div>
              <Textarea
                {...register("motivation")}
                placeholder="例：貴社の〇〇という理念に共感し、これまでの経験を活かして..."
                rows={6}
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
            <CardContent>
              <Textarea
                {...register("remarks")}
                placeholder="例：勤務地は東京都内を希望します。"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* 提出ボタン */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto px-12"
              disabled={isGenerating}
            >
              <FileText className="w-5 h-5 mr-2" />
              {isGenerating ? "生成中..." : "履歴書を作成する"}
            </Button>
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
