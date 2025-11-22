"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { ResumeFormData } from "@/lib/validation";
import { convertToEra } from "@/lib/era-converter";

interface ResumePreviewProps {
  data: ResumeFormData;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
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

    const educationRows = (data.education ?? []).flatMap((edu) => {
      const rows: { id: string; year: string | number; month: string | number; text: string }[] = [];
      if (typeof edu.entryYear !== "number" || typeof edu.entryMonth !== "number") {
        return rows;
      }

      const entryEra = convertToEra(edu.entryYear, edu.entryMonth, 1);
      rows.push({
        id: `${edu.id}-entry`,
        year: entryEra?.displayName || edu.entryYear,
        month: edu.entryMonth,
        text: `${edu.schoolName} 入学`,
      });

      if (edu.status === "enrolled") {
        rows.push({ id: `${edu.id}-status`, year: "", month: "", text: `${edu.schoolName} 在学中` });
      } else {
        const completionEra =
          edu.completionYear && edu.completionMonth
            ? convertToEra(edu.completionYear, edu.completionMonth, 1)
            : null;
        const statusLabel =
          edu.status === "graduated" ? "卒業" : edu.status === "withdrawn" ? "中退" : "修了";
        rows.push({
          id: `${edu.id}-complete`,
          year: completionEra?.displayName || edu.completionYear || "",
          month: edu.completionMonth || "",
          text: `${edu.schoolName} ${statusLabel}`,
        });
      }

      return rows;
    });

    const workHistoryRows = (data.workHistory ?? []).flatMap((work) => {
      const rows: { id: string; year: string | number; month: string | number; text: string; description?: string }[] = [];
      if (typeof work.entryYear !== "number" || typeof work.entryMonth !== "number") {
        return rows;
      }

      const entryEra = convertToEra(work.entryYear, work.entryMonth, 1);
      rows.push({
        id: `${work.id}-entry`,
        year: entryEra?.displayName || work.entryYear,
        month: work.entryMonth,
        text: `${work.companyName} 入社`,
        description: work.description,
      });

      if (work.status === "resigned") {
        const exitEra = work.exitYear && work.exitMonth ? convertToEra(work.exitYear, work.exitMonth, 1) : null;
        rows.push({
          id: `${work.id}-exit`,
          year: exitEra?.displayName || work.exitYear || "",
          month: work.exitMonth || "",
          text: `${work.companyName} 退社`,
        });
      } else {
        rows.push({ id: `${work.id}-status`, year: "", month: "", text: `${work.companyName} 在職中` });
      }

      return rows;
    });

    return (
      <div
        ref={ref}
        className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-black"
        style={{ fontFamily: "'Noto Sans JP', sans-serif", pageBreakInside: "avoid", breakInside: "avoid" }}
      >
        {/* タイトル */}
        <h1 className="text-3xl font-bold text-center mb-6 tracking-widest">履 歴 書</h1>

        {/* 日付 */}
        <div className="text-right text-sm mb-4">
          {todayEra?.displayName}{today.getMonth() + 1}月{today.getDate()}日 現在
        </div>

        {/* 基本情報テーブル */}
        <table
          className="w-full border-collapse border-2 border-black mb-4"
          style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
        >
          <tbody>
            {/* ふりがな */}
            <tr>
              <td className="border border-black bg-gray-100 p-1 text-xs w-24">ふりがな</td>
              <td className="border border-black p-2 text-sm" colSpan={3}>
                {data.furigana}
              </td>
              <td className="border border-black p-0 w-32 align-top" rowSpan={4}>
                {data.photo ? (
                  <Image
                    src={data.photo}
                    alt="証明写真"
                    width={128}
                    height={160}
                    unoptimized
                    className="w-full h-full object-cover"
                    style={{ height: "160px" }}
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-xs text-gray-400 border-l border-black">
                    写真
                  </div>
                )}
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

            {/* ふりがな（住所） */}
            <tr>
              <td className="border border-black bg-gray-100 p-1 text-xs" rowSpan={2}>
                現住所
              </td>
              <td className="border border-black p-1 text-xs bg-gray-50" colSpan={4}>
                〒{data.postalCode || ""}
              </td>
            </tr>

            {/* 住所 */}
            <tr>
              <td className="border border-black p-2 text-sm" colSpan={4}>
                {[data.prefecture, data.city, data.address, data.building]
                  .filter(Boolean)
                  .join(" ")}
              </td>
            </tr>

            {/* 連絡先 */}
            <tr>
              <td className="border border-black bg-gray-100 p-1 text-xs">電話番号</td>
              <td className="border border-black p-2 text-sm" colSpan={1}>
                {data.phone || ""}
              </td>
              <td className="border border-black bg-gray-100 p-1 text-xs">メール</td>
              <td className="border border-black p-2 text-sm break-all" colSpan={2}>
                {data.email || ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 学歴・職歴 */}
        <table
          className="w-full border-collapse border-2 border-black mb-4"
          style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
        >
          <thead>
            <tr>
              <th className="border border-black bg-gray-100 p-2 text-sm w-20">年</th>
              <th className="border border-black bg-gray-100 p-2 text-sm w-12">月</th>
              <th className="border border-black bg-gray-100 p-2 text-sm">学歴・職歴</th>
            </tr>
          </thead>
          <tbody>
            {/* 学歴ヘッダー */}
            {educationRows.length > 0 && (
              <>
                <tr>
                  <td className="border border-black p-2 text-sm text-center" colSpan={3}>
                    学　歴
                  </td>
                </tr>
                {educationRows.map((edu) => (
                  <tr key={edu.id}>
                    <td className="border border-black p-2 text-sm text-center">{edu.year}</td>
                    <td className="border border-black p-2 text-sm text-center">{edu.month}</td>
                    <td className="border border-black p-2 text-sm">{edu.text}</td>
                  </tr>
                ))}
              </>
            )}

            {/* 職歴ヘッダー */}
            {workHistoryRows.length > 0 && (
              <>
                <tr>
                  <td className="border border-black p-2 text-sm text-center" colSpan={3}>
                    職　歴
                  </td>
                </tr>
                {workHistoryRows.map((work) => (
                  <tr key={work.id}>
                    <td className="border border-black p-2 text-sm text-center">{work.year}</td>
                    <td className="border border-black p-2 text-sm text-center">{work.month}</td>
                    <td className="border border-black p-2 text-sm">
                      {work.text}
                      {work.description && (
                        <span className="block text-xs text-gray-600 mt-1">{work.description}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* 以上 */}
            {(educationRows.length || workHistoryRows.length) ? (
              <tr>
                <td className="border border-black p-2 text-sm text-center" colSpan={2}></td>
                <td className="border border-black p-2 text-sm text-right">以上</td>
              </tr>
            ) : null}
          </tbody>
        </table>

        {/* 資格・免許 */}
        {data.qualifications && data.qualifications.length > 0 && (
          <table
            className="w-full border-collapse border-2 border-black mb-4"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <thead>
              <tr>
                <th className="border border-black bg-gray-100 p-2 text-sm w-20">年</th>
                <th className="border border-black bg-gray-100 p-2 text-sm w-12">月</th>
                <th className="border border-black bg-gray-100 p-2 text-sm">資格・免許</th>
              </tr>
            </thead>
            <tbody>
              {data.qualifications.map((qual) => {
                const qualEra = convertToEra(qual.year, qual.month, 1);
                return (
                  <tr key={qual.id}>
                    <td className="border border-black p-2 text-sm text-center">
                      {qualEra?.displayName || qual.year}
                    </td>
                    <td className="border border-black p-2 text-sm text-center">
                      {qual.month}
                    </td>
                    <td className="border border-black p-2 text-sm">{qual.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 志望動機・自己PR */}
        {(data.motivation || data.selfPR) && (
          <table
            className="w-full border-collapse border-2 border-black mb-4"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <tbody>
              {data.motivation && (
                <tr>
                  <td className="border border-black bg-gray-100 p-2 text-sm w-28 align-top">
                    志望動機
                  </td>
                  <td className="border border-black p-3 text-sm whitespace-pre-wrap">
                    {data.motivation}
                  </td>
                </tr>
              )}
              {data.selfPR && (
                <tr>
                  <td className="border border-black bg-gray-100 p-2 text-sm w-28 align-top">
                    自己PR
                  </td>
                  <td className="border border-black p-3 text-sm whitespace-pre-wrap">
                    {data.selfPR}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 本人希望欄 */}
        {data.remarks && (
          <table
            className="w-full border-collapse border-2 border-black"
            style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
          >
            <tbody>
              <tr>
                <td className="border border-black bg-gray-100 p-2 text-sm w-28 align-top">
                  本人希望欄
                </td>
                <td className="border border-black p-3 text-sm whitespace-pre-wrap">
                  {data.remarks}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
