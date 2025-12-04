"use client";

import { forwardRef } from "react";
import { CareerFormData } from "@/lib/validation";
import { convertToEra } from "@/lib/era-converter";

interface CareerPreviewProps {
  data: CareerFormData;
}

const employmentTypeLabels: Record<string, string> = {
  fullTime: "正社員",
  contract: "契約社員",
  partTime: "アルバイト・パート",
  dispatch: "派遣",
};

export const CareerPreview = forwardRef<HTMLDivElement, CareerPreviewProps>(
  ({ data }, ref) => {
    const parseBirthDate = () => {
      if (!data.birthDate) return null;
      const [year, month, day] = data.birthDate.split("/").map(Number);
      if (!year || !month || !day) return null;
      return { year, month, day };
    };

    // 生年月日の和暦変換
    const parsedBirthDate = parseBirthDate();
    const birthEra = parsedBirthDate
      ? convertToEra(parsedBirthDate.year, parsedBirthDate.month, parsedBirthDate.day)
      : null;

    // 年齢計算
    const calculateAge = () => {
      if (!parsedBirthDate) return "";
      const today = new Date();
      const birthDate = new Date(parsedBirthDate.year, parsedBirthDate.month - 1, parsedBirthDate.day);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // 現在の日付
    const today = new Date();
    const todayEra = convertToEra(today.getFullYear(), today.getMonth() + 1, today.getDate());

    return (
      <div
        ref={ref}
        className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-black"
        style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
      >
        {/* ヘッダー */}
        <div data-pdf-section="header" className="mb-8">
          {/* タイトル */}
          <h1 className="text-3xl font-bold text-center mb-6 tracking-widest">職務経歴書</h1>

          {/* 日付 */}
          <div className="text-right text-sm mb-4">
            {todayEra?.displayName}{today.getMonth() + 1}月{today.getDate()}日 現在
          </div>

          {/* 基本情報 */}
          <table className="w-full border-collapse border-2 border-black mb-6">
            <tbody>
              {/* ふりがな */}
              <tr>
                <td className="border border-black bg-gray-100 p-1 text-xs w-24">ふりがな</td>
                <td className="border border-black p-2 text-sm" colSpan={3}>
                  {data.furigana}
                </td>
              </tr>

              {/* 氏名 */}
              <tr>
                <td className="border border-black bg-gray-100 p-1 text-xs">氏名</td>
                <td className="border border-black p-2 text-xl font-bold" colSpan={3}>
                  {data.name}
                </td>
              </tr>

              {/* 生年月日 */}
              <tr>
                <td className="border border-black bg-gray-100 p-1 text-xs">生年月日</td>
                <td className="border border-black p-2 text-sm" colSpan={3}>
                  {parsedBirthDate && (
                    <>
                      {birthEra?.displayName}
                      {parsedBirthDate.month}月{parsedBirthDate.day}日生（満{calculateAge()}歳）
                    </>
                  )}
                </td>
              </tr>

              {/* 性別 */}
              <tr>
                <td className="border border-black bg-gray-100 p-1 text-xs">性別</td>
                <td className="border border-black p-2 text-sm" colSpan={3}>
                  {data.gender === "male" ? "男" : data.gender === "female" ? "女" : ""}
                </td>
              </tr>

              {/* 住所 */}
              {(data.prefecture || data.city || data.address) && (
                <>
                  <tr>
                    <td className="border border-black bg-gray-100 p-1 text-xs" rowSpan={2}>
                      現住所
                    </td>
                    <td className="border border-black p-1 text-xs bg-gray-50" colSpan={3}>
                      〒{data.postalCode || ""}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 text-sm" colSpan={3}>
                      {[data.prefecture, data.city, data.address, data.building]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                  </tr>
                </>
              )}

              {/* 連絡先 */}
              {(data.phone || data.email) && (
                <tr>
                  <td className="border border-black bg-gray-100 p-1 text-xs">電話番号</td>
                  <td className="border border-black p-2 text-sm" colSpan={1}>
                    {data.phone || ""}
                  </td>
                  <td className="border border-black bg-gray-100 p-1 text-xs w-16">メール</td>
                  <td className="border border-black p-2 text-sm break-all">
                    {data.email || ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 職務要約 */}
        {data.summary && (
          <div data-pdf-section="summary" className="mt-8 mb-6">
            <div className="bg-gray-100 border-2 border-black p-2">
              <h2 className="text-lg font-bold">職務要約</h2>
            </div>
            <div className="border-2 border-t-0 border-black p-3 text-sm whitespace-pre-wrap">
              {data.summary}
            </div>
          </div>
        )}

        {/* 職務経歴 */}
        {data.careerHistory && data.careerHistory.length > 0 && (
          <div data-pdf-section="career-history" className="mt-8 mb-6">
            <div className="bg-gray-100 border-2 border-black p-2">
              <h2 className="text-lg font-bold">職務経歴</h2>
            </div>
            <div className="border-2 border-t-0 border-black">
              {data.careerHistory.map((career, index) => {
                const startEra =
                  career.startYear && career.startMonth
                    ? convertToEra(career.startYear, career.startMonth, 1)
                    : null;
                const endEra =
                  career.endYear && career.endMonth
                    ? convertToEra(career.endYear, career.endMonth, 1)
                    : null;

                const periodText = (() => {
                  const startText = startEra
                    ? `${startEra.displayName}${career.startMonth}月`
                    : career.startYear && career.startMonth
                    ? `${career.startYear}年${career.startMonth}月`
                    : "";
                  const endText =
                    career.endYear && career.endMonth
                      ? endEra
                        ? `${endEra.displayName}${career.endMonth}月`
                        : `${career.endYear}年${career.endMonth}月`
                      : "在職中";

                  return startText && endText ? `${startText} 〜 ${endText}` : startText || endText;
                })();

                return (
                  <div
                    key={career.id}
                    className={`p-4 ${
                      index !== data.careerHistory!.length - 1 ? "border-b border-black" : ""
                    }`}
                  >
                    {/* 会社名と期間 */}
                    <div className="mb-3">
                      <div className="font-bold text-base mb-1">{career.companyName}</div>
                      <div className="text-sm text-gray-700">
                        {periodText}
                        {career.employmentType && (
                          <> （{employmentTypeLabels[career.employmentType] || career.employmentType}）</>
                        )}
                      </div>
                    </div>

                    {/* 部署・役職 */}
                    {(career.department || career.position) && (
                      <div className="mb-2 text-sm">
                        {career.department && <span>部署：{career.department}</span>}
                        {career.department && career.position && <span className="mx-2">|</span>}
                        {career.position && <span>役職：{career.position}</span>}
                      </div>
                    )}

                    {/* 業務内容 */}
                    {career.jobDescription && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">【業務内容】</div>
                        <div className="text-sm whitespace-pre-wrap pl-2">
                          {career.jobDescription}
                        </div>
                      </div>
                    )}

                    {/* 実績・成果 */}
                    {career.achievements && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">【実績・成果】</div>
                        <div className="text-sm whitespace-pre-wrap pl-2">
                          {career.achievements}
                        </div>
                      </div>
                    )}

                    {/* 使用技術・スキル */}
                    {career.technologies && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">
                          【使用技術・スキル】
                        </div>
                        <div className="text-sm whitespace-pre-wrap pl-2">
                          {career.technologies}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 保有スキル */}
        {data.skills && data.skills.length > 0 && (
          <div data-pdf-section="skills" className="mt-8 mb-6">
            <div className="bg-gray-100 border-2 border-black p-2 mb-2">
              <h2 className="text-lg font-bold">保有スキル</h2>
            </div>
            <table className="w-full border-2 border-t-0 border-black border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-2 text-xs w-32">カテゴリ</th>
                  <th className="border border-black p-2 text-xs">スキル名</th>
                  <th className="border border-black p-2 text-xs w-32">経験</th>
                </tr>
              </thead>
              <tbody>
                {data.skills.map((skill) => (
                  <tr key={skill.id}>
                    <td className="border border-black p-2 text-sm">
                      {skill.category || "-"}
                    </td>
                    <td className="border border-black p-2 text-sm">{skill.skillName}</td>
                    <td className="border border-black p-2 text-sm">
                      {skill.experience || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    );
  }
);

CareerPreview.displayName = "CareerPreview";
