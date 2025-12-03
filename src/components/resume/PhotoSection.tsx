import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PhotoSectionProps = {
  photo?: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function PhotoSection({ photo, onUpload }: PhotoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>証明写真（任意）</CardTitle>
        <CardDescription>
          証明写真をアップロードできます。画像ファイル（JPG, PNG）を選択してください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input type="file" accept="image/*" onChange={onUpload} className="cursor-pointer" />
        {photo && (
          <div className="mt-4">
            <Image
              src={photo}
              alt="証明写真"
              width={128}
              height={160}
              unoptimized
              className="w-32 h-40 object-cover border rounded"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
