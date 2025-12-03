import Link from "next/link";
import { ArrowRight, FileText, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

type ResumeHeroProps = {
  onFillSample: () => void;
};

export function ResumeHero({ onFillSample }: ResumeHeroProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <FileText className="w-12 h-12 text-primary mr-3" />
        <h1 className="text-4xl font-bold text-primary">かんたん履歴書作成</h1>
      </div>
      <p className="text-muted-foreground text-lg">シンプルで使いやすい履歴書作成ツール</p>
      <div className="flex items-center justify-center mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 max-w-2xl mx-auto">
        <Shield className="w-5 h-5 mr-2" />
        <span>このサイトはWEB上で完結します。あなたの情報は端末の外に出ることはありません。</span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Button variant="secondary" onClick={onFillSample}>
          サンプル入力
        </Button>
        <Link href="/career">
          <Button variant="outline" size="sm">
            職務経歴書ページへ
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
