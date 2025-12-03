import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

type SubmitSectionProps = {
  submitError: string | null;
  isGenerating: boolean;
};

export function SubmitSection({ submitError, isGenerating }: SubmitSectionProps) {
  return (
    <div className="flex flex-col gap-3 pt-6">
      {submitError && (
        <p className="text-center text-sm text-red-500" aria-live="assertive">
          {submitError}
        </p>
      )}
      <div className="flex justify-center">
        <Button type="submit" size="lg" className="w-full md:w-auto px-12" disabled={isGenerating}>
          <FileText className="w-5 h-5 mr-2" />
          {isGenerating ? "生成中..." : "履歴書を作成する"}
        </Button>
      </div>
    </div>
  );
}
