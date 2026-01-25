"use client";

import { ResumePreview } from "@/components/ResumePreview";
import { BasicInfoSection } from "@/components/resume/BasicInfoSection";
import { ContactSection } from "@/components/resume/ContactSection";
import { EducationSection } from "@/components/resume/EducationSection";
import { PhotoSection } from "@/components/resume/PhotoSection";
import { QualificationsSection } from "@/components/resume/QualificationsSection";
import { ResumeHero } from "@/components/resume/ResumeHero";
import { SubmitSection } from "@/components/resume/SubmitSection";
import { TextSection } from "@/components/resume/TextSection";
import { WorkHistorySection } from "@/components/resume/WorkHistorySection";
import { useResumeForm } from "@/hooks/useResumeForm";
import { ResumeFormData } from "@/lib/validation";

const SelfPrHelper = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
    <p className="font-medium mb-2">💡 自己PRの書き方のポイント</p>
    <ul className="list-disc list-inside space-y-1">
      <li>具体的なエピソードを交えて書く</li>
      <li>数字や実績を盛り込むと説得力が増す</li>
      <li>応募先企業で活かせる強みを強調する</li>
      <li>200〜400字程度が目安</li>
    </ul>
  </div>
);

const MotivationHelper = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
    <p className="font-medium mb-2">💡 志望動機の書き方のポイント</p>
    <ul className="list-disc list-inside space-y-1">
      <li>企業研究を行い、その企業ならではの魅力を述べる</li>
      <li>自分の経験やスキルと関連付ける</li>
      <li>入社後にどう貢献したいかを具体的に書く</li>
      <li>200〜400字程度が目安</li>
    </ul>
  </div>
);

export default function Home() {
  const {
    form,
    formRef,
    resumePreviewRef,
    educationArray,
    workHistoryArray,
    qualificationArray,
    birthDateValue,
    schoolSchedule,
    isPostalCodeComplete,
    submitError,
    postalLookupMessage,
    isGenerating,
    formValues,
    selfPRLength,
    motivationLength,
    remarksLength,
    handleSubmitForm,
    handlePostalLookup,
    handlePhotoUpload,
    handleFillSample,
    birthDateFormatter,
    setValue,
  } = useResumeForm();

  const { register, watch, formState } = form;
  const { errors } = formState;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ResumeHero onFillSample={handleFillSample} />

        <form ref={formRef} onSubmit={handleSubmitForm} className="space-y-6">
          <BasicInfoSection
            register={register}
            errors={errors}
            genderValue={watch("gender")}
            birthDateValue={birthDateValue}
            onBirthDateChange={birthDateFormatter}
            setValue={setValue}
          />

          <PhotoSection photo={formValues.photo} onUpload={handlePhotoUpload} />

          <ContactSection
            register={register}
            errors={errors}
            onPostalLookup={handlePostalLookup}
            isPostalCodeComplete={isPostalCodeComplete}
            postalLookupMessage={postalLookupMessage}
            setValue={setValue}
          />

          <EducationSection
            register={register}
            educationArray={educationArray}
            watch={watch}
            setValue={setValue}
            schoolSchedule={schoolSchedule}
          />

          <WorkHistorySection
            register={register}
            workHistoryArray={workHistoryArray}
            watch={watch}
            setValue={setValue}
          />

          <QualificationsSection register={register} qualificationArray={qualificationArray} />

          <TextSection
            title="志望動機（任意）"
            description="なぜこの企業・職種を志望するのか、あなたの思いを伝えましょう。"
            valueLength={motivationLength}
            textareaProps={register("motivation")}
            helper={<MotivationHelper />}
          />

          <TextSection
            title="自己PR（任意）"
            description="あなたの強みや特技、これまでの経験をアピールしましょう。"
            valueLength={selfPRLength}
            textareaProps={register("selfPR")}
            helper={<SelfPrHelper />}
          />

          <TextSection
            title="本人希望欄（任意）"
            description="勤務時間、勤務地、その他特記事項があれば記入してください。"
            valueLength={remarksLength}
            textareaProps={register("remarks")}
          />

          <SubmitSection submitError={submitError} isGenerating={isGenerating} />
        </form>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>入力内容は自動的にブラウザに保存されます</p>
        </div>
      </div>

      <div className="fixed left-[-9999px] top-0">
        <ResumePreview ref={resumePreviewRef} data={formValues as ResumeFormData} />
      </div>
    </div>
  );
}
