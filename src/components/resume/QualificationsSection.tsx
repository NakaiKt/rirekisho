import { UseFieldArrayReturn, UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeFormData } from "@/lib/validation";

type QualificationsSectionProps = {
  register: UseFormRegister<ResumeFormData>;
  qualificationArray: UseFieldArrayReturn<ResumeFormData, "qualifications", "id">;
};

export function QualificationsSection({ register, qualificationArray }: QualificationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>資格・免許（任意）</CardTitle>
        <CardDescription>取得した資格や免許を追加できます。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qualificationArray.fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => qualificationArray.remove(index)}
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
            qualificationArray.append({
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
  );
}
