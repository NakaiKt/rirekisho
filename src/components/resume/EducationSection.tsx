import { UseFieldArrayReturn, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { calculateSchoolSchedule } from "@/lib/era-converter";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeFormData } from "@/lib/validation";
import { Plus, Trash2 } from "lucide-react";

type EducationSectionProps = {
  register: UseFormRegister<ResumeFormData>;
  educationArray: UseFieldArrayReturn<ResumeFormData, "education", "id">;
  watch: UseFormWatch<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
  schoolSchedule: ReturnType<typeof calculateSchoolSchedule> | null;
};

export function EducationSection({
  register,
  educationArray,
  watch,
  setValue,
  schoolSchedule,
}: EducationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>学歴</CardTitle>
        <CardDescription>卒業・在学を選択してください。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {educationArray.fields.map((field, index) => {
          type EducationStatus = NonNullable<ResumeFormData["education"]>[number]["status"];
          const status =
            (watch(`education.${index}.status` as const) as EducationStatus | undefined) ||
            field.status ||
            "enrolled";

          return (
            <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => educationArray.remove(index)}
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

                <div className="space-y-2">
                  <Label>卒業年月</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="2024"
                      disabled={status === "enrolled" || status === "on_leave"}
                      {...register(`education.${index}.completionYear` as const, {
                        setValueAs: (value) => (value === "" ? undefined : Number(value)),
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="3"
                      min="1"
                      max="12"
                      disabled={status === "enrolled" || status === "on_leave"}
                      {...register(`education.${index}.completionMonth` as const, {
                        setValueAs: (value) => (value === "" ? undefined : Number(value)),
                      })}
                    />
                  </div>
                  <div className="w-1/2">
                    <select
                      {...register(`education.${index}.status` as const, {
                        onChange: (event) => {
                          const value = event.target.value as EducationStatus;
                          setValue(`education.${index}.status`, value);
                          if (value === "enrolled" || value === "on_leave") {
                            setValue(`education.${index}.completionYear`, undefined);
                            setValue(`education.${index}.completionMonth`, undefined);
                          }
                        },
                      })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="enrolled">在学中</option>
                      <option value="graduated">卒業</option>
                      <option value="completed">修了</option>
                      <option value="withdrawn">中退</option>
                      <option value="on_leave">休学中</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>学校名</Label>
                <Input {...register(`education.${index}.schoolName` as const)} placeholder="東京大学 ○○学部" />
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            educationArray.append({
              id: crypto.randomUUID(),
              entryYear: undefined,
              entryMonth: undefined,
              schoolName: "",
              status: "enrolled",
            })
          }
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          学歴を追加
        </Button>

        {schoolSchedule && (
          <div className="bg-muted text-sm rounded-lg p-4 space-y-1">
            <p className="font-medium">生年月日から自動計算された学歴</p>
            <p>小学校: {schoolSchedule.elementary.entry} 入学 → {schoolSchedule.elementary.graduation} 卒業</p>
            <p>中学校: {schoolSchedule.juniorHigh.entry} 入学 → {schoolSchedule.juniorHigh.graduation} 卒業</p>
            <p>高校: {schoolSchedule.high.entry} 入学 → {schoolSchedule.high.graduation} 卒業</p>
            <p>大学: {schoolSchedule.university.entry} 入学 → {schoolSchedule.university.graduation} 卒業</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
