import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeFormData } from "@/lib/validation";
import { formatPostalCode } from "@/lib/postal-code";

type ContactSectionProps = {
  register: UseFormRegister<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
  onPostalLookup: () => Promise<void>;
  isPostalCodeComplete: boolean;
  postalLookupMessage: string | null;
  setValue: UseFormSetValue<ResumeFormData>;
};

export function ContactSection({
  register,
  errors,
  onPostalLookup,
  isPostalCodeComplete,
  postalLookupMessage,
  setValue,
}: ContactSectionProps) {
  return (
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
            <Button type="button" variant="outline" onClick={onPostalLookup} disabled={!isPostalCodeComplete}>
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
          <Input id="address" {...register("address")} placeholder="渋谷1-2-3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="building">建物名・部屋番号</Label>
          <Input id="building" {...register("building")} placeholder="渋谷ビル 101号室" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="example@example.com"
              aria-invalid={!!errors.email}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="phone">電話番号</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="090-1234-5678" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
