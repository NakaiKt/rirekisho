import { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResumeFormData } from "@/lib/validation";

type BasicInfoSectionProps = {
  register: UseFormRegister<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
  genderValue?: ResumeFormData["gender"];
  birthDateValue: string;
  onBirthDateChange: (value: string) => void;
  setValue: UseFormSetValue<ResumeFormData>;
};

export function BasicInfoSection({
  register,
  errors,
  genderValue,
  birthDateValue,
  onBirthDateChange,
  setValue,
}: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>基本情報</CardTitle>
        <CardDescription>必須項目です。すべて入力してください。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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
            {errors.furigana && <p className="text-sm text-red-500">{errors.furigana.message}</p>}
          </div>
        </div>

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
              onChange={(e) => onBirthDateChange(e.target.value)}
              className={`font-mono ${errors.birthDate ? "border-red-500" : ""}`}
            />
          </div>
          {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>
            性別 <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={genderValue}
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
          {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
