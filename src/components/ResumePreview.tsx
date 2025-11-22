"use client";

import { forwardRef } from "react";
import { ResumeFormData } from "@/lib/validation";
import { convertToEra } from "@/lib/era-converter";

interface ResumePreviewProps {
  data: ResumeFormData;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data }, ref) => {
    // 生年月日の和暦変換
    const birthEra = data.birthYear && data.birthMonth && data.birthDay
      ? convertToEra(data.birthYear, data.birthMonth, data.birthDay)
      : null;

    // 年齢計算
    const calculateAge = () => {
      if (!data.birthYear || !data.birthMonth || !data.birthDay) return "";
      const today = new Date();
      const birthDate = new Date(data.birthYear, data.birthMonth - 1, data.birthDay);
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
        {/* タイトル */}
        <h1 className="text-3xl font-bold text-center mb-6 tracking-widest">履 歴 書</h1>

        {/* 日付 */}
        <div className="text-right text-sm mb-4">
          {todayEra?.displayName}{today.getMonth() + 1}月{today.getDate()}日 現在
        </div>

        {/* 基本情報テーブル */}
        <table className="w-full border-collapse border-2 border-black mb-4">
          <tbody>
            {/* ふりがな */}
            <tr>
              <td className="border border-black bg-gray-100 p-1 text-xs w-24">ふりがな</td>
              <td className="border border-black p-2 text-sm" colSpan={3}>
                {data.furigana}
              </td>
              <td className="border border-black p-0 w-32 align-top" rowSpan={4}>
                {data.photo ? (
                  <img
                    src={data.photo}
                    alt="証明写真"
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
                {data.birthYear && data.birthMonth && data.birthDay && (
                  <>
                    {birthEra?.displayName}{data.birthMonth}月{data.birthDay}日生
                    （満{calculateAge()}歳）
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
              <td className="border border-black p-2 text-sm" colSpan={2}>
                {data.phone || ""}
              </td>
              <td className="border border-black bg-gray-100 p-1 text-xs">メール</td>
              <td className="border border-black p-2 text-sm break-all">
                {data.email || ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 学歴・職歴 */}
        <table className="w-full border-collapse border-2 border-black mb-4">
          <thead>
            <tr>
              <th className="border border-black bg-gray-100 p-2 text-sm w-20">年</th>
              <th className="border border-black bg-gray-100 p-2 text-sm w-12">月</th>
              <th className="border border-black bg-gray-100 p-2 text-sm">学歴・職歴</th>
            </tr>
          </thead>
          <tbody>
            {/* 学歴ヘッダー */}
            {data.education && data.education.length > 0 && (
              <>
                <tr>
                  <td className="border border-black p-2 text-sm text-center" colSpan={3}>
                    学　歴
                  </td>
                </tr>
                {data.education.map((edu) => {
                  const eduEra = convertToEra(edu.year, edu.month, 1);
                  return (
                    <tr key={edu.id}>
                      <td className="border border-black p-2 text-sm text-center">
                        {eduEra?.displayName || edu.year}
                      </td>
                      <td className="border border-black p-2 text-sm text-center">
                        {edu.month}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {edu.schoolName} {edu.type === "entry" ? "入学" : "卒業"}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}

            {/* 職歴ヘッダー */}
            {data.workHistory && data.workHistory.length > 0 && (
              <>
                <tr>
                  <td className="border border-black p-2 text-sm text-center" colSpan={3}>
                    職　歴
                  </td>
                </tr>
                {data.workHistory.map((work) => {
                  const workEra = convertToEra(work.year, work.month, 1);
                  return (
                    <tr key={work.id}>
                      <td className="border border-black p-2 text-sm text-center">
                        {workEra?.displayName || work.year}
                      </td>
                      <td className="border border-black p-2 text-sm text-center">
                        {work.month}
                      </td>
                      <td className="border border-black p-2 text-sm">
                        {work.companyName} {work.type === "entry" ? "入社" : "退社"}
                        {work.description && (
                          <span className="block text-xs text-gray-600 mt-1">
                            {work.description}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}

            {/* 以上 */}
            {(data.education?.length || data.workHistory?.length) ? (
              <tr>
                <td className="border border-black p-2 text-sm text-center" colSpan={2}></td>
                <td className="border border-black p-2 text-sm text-right">以上</td>
              </tr>
            ) : null}
          </tbody>
        </table>

        {/* 資格・免許 */}
        {data.qualifications && data.qualifications.length > 0 && (
          <table className="w-full border-collapse border-2 border-black mb-4">
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
          <table className="w-full border-collapse border-2 border-black mb-4">
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
          <table className="w-full border-collapse border-2 border-black">
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
