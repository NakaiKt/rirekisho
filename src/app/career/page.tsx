"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CareerFormData, careerSchema } from "@/lib/validation";
import { saveCareerToLocalStorage, loadCareerFromLocalStorage, getSharedBasicInfo } from "@/lib/local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Shield, Plus, Trash2, ArrowLeft } from "lucide-react";
import { formatPostalCode, searchPostalCode } from "@/lib/postal-code";
import { generateCareerPDF } from "@/lib/react-pdf-generator";
import { CareerPreview } from "@/components/CareerPreview";

const employmentTypeLabels = {
  fullTime: "正社員",
  contract: "契約社員",
  partTime: "アルバイト・パート",
  dispatch: "派遣",
};

export default function CareerPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      name: "",
      furigana: "",
      birthDate: "",
      gender: undefined,
      postalCode: "",
      prefecture: "",
      city: "",
      address: "",
      building: "",
      email: "",
      phone: "",
      summary: "",
      careerHistory: [],
      skills: "",
    },
  });

  const {
    fields: careerHistoryFields,
    append: appendCareerHistory,
    remove: removeCareerHistory,
  } = useFieldArray({
    control,
    name: "careerHistory",
  });


  // PDF生成用のref
  const careerPreviewRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const formValues = watch();
  const summaryValue = watch("summary") || "";
  const postalCodeValue = watch("postalCode") || "";
  const birthDateValue = watch("birthDate") || "";
  const isPostalCodeComplete = postalCodeValue.replace(/-/g, "").length === 7;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [postalLookupMessage, setPostalLookupMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    // 初回ロード時にローカルストレージから復元
    // まず共有の基本情報を取得
    const sharedInfo = getSharedBasicInfo();
    const savedCareerData = loadCareerFromLocalStorage();

    if (savedCareerData) {
      // 職務経歴書のデータがある場合はそれを使用
      Object.keys(savedCareerData).forEach((key) => {
        setValue(key as any, (savedCareerData as any)[key]);
      });
    } else if (sharedInfo) {
      // 職務経歴書のデータがない場合は履歴書の基本情報を使用
      Object.keys(sharedInfo).forEach((key) => {
        if ((sharedInfo as any)[key]) {
          setValue(key as any, (sharedInfo as any)[key]);
        }
      });
    }
  }, [setValue]);

  useEffect(() => {
    // フォームの値が変更されたら自動保存
    const timer = setTimeout(() => {
      saveCareerToLocalStorage(formValues as any);
    }, 500);

    return () => clearTimeout(timer);
  }, [formValues]);

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

  // PDF生成
  const onSubmit = async (data: CareerFormData) => {
    setIsGenerating(true);
    try {
      setSubmitError(null);
      await generateCareerPDF(data);
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

  // テスト用のサンプル入力（必要に応じて削除可能）
  const handleFillSample = () => {
    const sampleData: CareerFormData = {
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
      summary:
        "法人営業とITプロジェクトマネジメントの経験を持ち、顧客課題のヒアリングから施策実行まで一貫して推進。",
      careerHistory: [
        {
          id: crypto.randomUUID(),
          companyName: "株式会社サンプル",
          startYear: 2013,
          startMonth: 4,
          endYear: 2018,
          endMonth: 3,
          employmentType: "fullTime",
          department: "営業部",
          position: "主任",
          jobDescription: `法人向けソリューション営業に従事し、新規開拓と既存顧客深耕を担当。

年間売上トップ10%を4年間維持。

使用ツール：Salesforce / Excel / PowerPoint`,
        },
        {
          id: crypto.randomUUID(),
          companyName: "ABCソリューションズ株式会社",
          startYear: 2018,
          startMonth: 4,
          employmentType: "fullTime",
          department: "プロダクト開発部",
          position: "プロジェクトマネージャー",
          jobDescription: `SaaSプロダクトの企画から開発進行、リリース後の改善サイクルまでを統括。

月間アクティブユーザーを前年比20%向上。

使用技術：TypeScript / React / AWS / Figma`,
        },
      ],
      skills: `【言語/フレームワーク】
TypeScript（5年）、React（5年）

【プロジェクト管理】
Scrum / アジャイル開発（4年）

【デザイン/ドキュメント】
Figma / Notion（3年）`,
    };

    reset(sampleData);
    saveCareerToLocalStorage(sampleData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-primary">職務経歴書作成</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            詳細な職務経歴を記録しましょう
          </p>
          <div className="flex items-center justify-center mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 max-w-2xl mx-auto">
            <Shield className="w-5 h-5 mr-2" />
            <span>
              このサイトはWEB上で完結します。あなたの情報は端末の外に出ることはありません。
            </span>
          </div>

          {/* 履歴書へのリンク */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="secondary" onClick={handleFillSample}>
              サンプル入力
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                履歴書ページに戻る
              </Button>
            </Link>
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

          {/* 職務要約 */}
          <Card>
            <CardHeader>
              <CardTitle>職務要約（任意）</CardTitle>
              <CardDescription>
                これまでの職務経験を簡潔にまとめてください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-medium mb-2">職務要約の書き方のポイント</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>これまでの経験を3〜5行程度で簡潔にまとめる</li>
                  <li>業界、職種、主な業務内容を含める</li>
                  <li>特に強みとなる経験やスキルを強調する</li>
                </ul>
              </div>
              <div className="flex justify-end text-sm text-muted-foreground">
                文字数: {summaryValue.length}
              </div>
              <Textarea
                {...register("summary")}
                placeholder="例：〇〇年にわたり、Web開発エンジニアとして従事。フロントエンド・バックエンド両方の開発経験があり..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* 職務経歴 */}
          <Card>
            <CardHeader>
              <CardTitle>職務経歴（任意）</CardTitle>
              <CardDescription>
                これまでの職務経歴を詳しく記入してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {careerHistoryFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeCareerHistory(index)}
                      aria-label="職務経歴を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="space-y-2">
                      <Label>会社名</Label>
                      <Input
                        {...register(`careerHistory.${index}.companyName` as const)}
                        placeholder="株式会社○○"
                      />
                      {errors.careerHistory?.[index]?.companyName && (
                        <p className="text-sm text-red-500">
                          {errors.careerHistory[index]?.companyName?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>入社年月</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="2020"
                            {...register(`careerHistory.${index}.startYear` as const, {
                              valueAsNumber: true,
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="4"
                            min="1"
                            max="12"
                            {...register(`careerHistory.${index}.startMonth` as const, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        {(errors.careerHistory?.[index]?.startYear || errors.careerHistory?.[index]?.startMonth) && (
                          <p className="text-sm text-red-500">
                            {errors.careerHistory[index]?.startYear?.message || errors.careerHistory[index]?.startMonth?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>退社年月（在職中の場合は空欄）</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="2024"
                            {...register(`careerHistory.${index}.endYear` as const, {
                              setValueAs: (value) => (value === "" ? undefined : Number(value)),
                            })}
                          />
                          <Input
                            type="number"
                            placeholder="3"
                            min="1"
                            max="12"
                            {...register(`careerHistory.${index}.endMonth` as const, {
                              setValueAs: (value) => (value === "" ? undefined : Number(value)),
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>雇用形態</Label>
                        <select
                          {...register(`careerHistory.${index}.employmentType` as const)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">選択してください</option>
                          {Object.entries(employmentTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>部署</Label>
                        <Input
                          {...register(`careerHistory.${index}.department` as const)}
                          placeholder="開発部"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>役職</Label>
                      <Input
                        {...register(`careerHistory.${index}.position` as const)}
                        placeholder="例：プロジェクトリーダー、エンジニア"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>業務内容</Label>
                      <Textarea
                        {...register(`careerHistory.${index}.jobDescription` as const)}
                        placeholder={`【業務内容】
担当した業務の内容を詳しく記入してください

【実績・成果】
具体的な成果や実績を記入してください

【使用技術・スキル】
React, TypeScript, Node.js, AWS 等`}
                        rows={10}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendCareerHistory({
                    id: crypto.randomUUID(),
                    companyName: "",
                    startYear: undefined,
                    startMonth: undefined,
                    endYear: undefined,
                    endMonth: undefined,
                  })
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                職務経歴を追加
              </Button>
            </CardContent>
          </Card>

          {/* 保有スキル */}
          <Card>
            <CardHeader>
              <CardTitle>保有スキル（任意）</CardTitle>
              <CardDescription>
                保有しているスキルや技術を記入してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                {...register("skills")}
                placeholder={`【プログラミング言語】
TypeScript（5年）、Python（3年）、Java（2年）

【フレームワーク】
React（5年）、Next.js（3年）、Node.js（4年）

【ツール・その他】
Git、Docker、AWS、Figma`}
                rows={8}
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
                職務経歴書を作成する
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
        <CareerPreview ref={careerPreviewRef} data={formValues as CareerFormData} />
      </div>
    </div>
  );
}
