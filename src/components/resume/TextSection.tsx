import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegisterReturn } from "react-hook-form";
import { ReactNode } from "react";

type TextSectionProps = {
  title: string;
  description: string;
  valueLength: number;
  textareaProps: UseFormRegisterReturn;
  helper?: ReactNode;
};

export function TextSection({ title, description, valueLength, textareaProps, helper }: TextSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {helper}
        <div className="flex justify-end text-sm text-muted-foreground">文字数: {valueLength}</div>
        <Textarea {...textareaProps} rows={5} />
      </CardContent>
    </Card>
  );
}
