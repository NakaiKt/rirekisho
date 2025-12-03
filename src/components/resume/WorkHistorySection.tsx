import { UseFieldArrayReturn, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeFormData } from "@/lib/validation";

type WorkHistorySectionProps = {
  register: UseFormRegister<ResumeFormData>;
  workHistoryArray: UseFieldArrayReturn<ResumeFormData, "workHistory", "id">;
  watch: UseFormWatch<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
};

export function WorkHistorySection({
  register,
  workHistoryArray,
  watch,
  setValue,
}: WorkHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>職歴</CardTitle>
        <CardDescription>複数の職歴を追加できます。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workHistoryArray.fields.map((field, index) => {
          type WorkStatus = NonNullable<ResumeFormData["workHistory"]>[number]["status"];
          const status =
            (watch(`workHistory.${index}.status` as const) as WorkStatus | undefined) ||
            field.status ||
            "employed";
          return (
            <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => workHistoryArray.remove(index)}
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
                  <div className="w-1/2">
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
              </div>

              <div className="space-y-2">
                <Label>会社名</Label>
                <Input {...register(`workHistory.${index}.companyName` as const)} placeholder="株式会社○○" />
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            workHistoryArray.append({
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
  );
}
