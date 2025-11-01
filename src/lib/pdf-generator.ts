import jsPDF from "jspdf";
import { ResumeFormData } from "./validation";
import { convertToEra } from "./era-converter";

// 日本語フォントを使用するための設定
// 注: jsPDFはデフォルトで日本語に対応していないため、
// フォントを埋め込む必要がありますが、ここでは簡易的な実装とします

export async function generateResumePDF(data: ResumeFormData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ページの基本設定
  const pageWidth = 210; // A4幅
  const pageHeight = 297; // A4高さ
  const margin = 15;
  let currentY = margin;

  // タイトル
  doc.setFontSize(20);
  doc.text("履歴書", pageWidth / 2, currentY, { align: "center" });
  currentY += 15;

  // 基本情報
  doc.setFontSize(12);

  // 名前
  doc.text(`氏名: ${data.name}`, margin, currentY);
  currentY += 7;
  doc.text(`ふりがな: ${data.furigana}`, margin, currentY);
  currentY += 10;

  // 生年月日
  const birthEra = convertToEra(data.birthYear, data.birthMonth, data.birthDay);
  const birthDateStr = `${data.birthYear}年${data.birthMonth}月${data.birthDay}日`;
  const birthEraStr = birthEra ? `(${birthEra.displayName}${birthEra.year !== 1 ? '' : ''}${data.birthMonth}月${data.birthDay}日)` : "";
  doc.text(`生年月日: ${birthDateStr} ${birthEraStr}`, margin, currentY);
  currentY += 7;

  // 性別
  const genderText = data.gender === "male" ? "男性" : "女性";
  doc.text(`性別: ${genderText}`, margin, currentY);
  currentY += 10;

  // 写真（任意）
  if (data.photo) {
    try {
      // 写真を右上に配置
      const photoWidth = 30;
      const photoHeight = 40;
      const photoX = pageWidth - margin - photoWidth;
      const photoY = margin + 10;
      doc.addImage(data.photo, "JPEG", photoX, photoY, photoWidth, photoHeight);
    } catch (error) {
      console.error("Failed to add photo:", error);
    }
  }

  // 連絡先（任意）
  if (data.postalCode || data.prefecture || data.city || data.address || data.building) {
    doc.setFontSize(14);
    doc.text("連絡先", margin, currentY);
    currentY += 7;
    doc.setFontSize(11);

    if (data.postalCode) {
      doc.text(`〒${data.postalCode}`, margin, currentY);
      currentY += 6;
    }

    const addressParts = [
      data.prefecture,
      data.city,
      data.address,
      data.building,
    ].filter(Boolean);

    if (addressParts.length > 0) {
      const fullAddress = addressParts.join(" ");
      // 長い住所の場合は折り返す
      const addressLines = doc.splitTextToSize(fullAddress, pageWidth - margin * 2);
      doc.text(addressLines, margin, currentY);
      currentY += 6 * addressLines.length;
    }

    currentY += 4;
  }

  if (data.email || data.phone) {
    if (data.email) {
      doc.text(`Email: ${data.email}`, margin, currentY);
      currentY += 6;
    }
    if (data.phone) {
      doc.text(`TEL: ${data.phone}`, margin, currentY);
      currentY += 6;
    }
    currentY += 4;
  }

  // 学歴（任意）
  if (data.education && data.education.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text("学歴", margin, currentY);
    currentY += 7;
    doc.setFontSize(11);

    data.education.forEach((edu) => {
      const typeText = edu.type === "entry" ? "入学" : "卒業";
      const eduEra = convertToEra(edu.year, edu.month, 1);
      const eraStr = eduEra ? `${eduEra.displayName}` : `${edu.year}年`;
      doc.text(`${eraStr}${edu.month}月 ${edu.schoolName} ${typeText}`, margin + 5, currentY);
      currentY += 6;
    });
    currentY += 4;
  }

  // 職歴（任意）
  if (data.workHistory && data.workHistory.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text("職歴", margin, currentY);
    currentY += 7;
    doc.setFontSize(11);

    data.workHistory.forEach((work) => {
      const typeText = work.type === "entry" ? "入社" : "退社";
      const workEra = convertToEra(work.year, work.month, 1);
      const eraStr = workEra ? `${workEra.displayName}` : `${work.year}年`;
      doc.text(`${eraStr}${work.month}月 ${work.companyName} ${typeText}`, margin + 5, currentY);
      currentY += 6;

      if (work.description) {
        const descLines = doc.splitTextToSize(work.description, pageWidth - margin * 2 - 10);
        doc.text(descLines, margin + 10, currentY);
        currentY += 6 * descLines.length;
      }
    });
    currentY += 4;
  }

  // 資格（任意）
  if (data.qualifications && data.qualifications.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text("資格・免許", margin, currentY);
    currentY += 7;
    doc.setFontSize(11);

    data.qualifications.forEach((qual) => {
      const qualEra = convertToEra(qual.year, qual.month, 1);
      const eraStr = qualEra ? `${qualEra.displayName}` : `${qual.year}年`;
      doc.text(`${eraStr}${qual.month}月 ${qual.name}`, margin + 5, currentY);
      currentY += 6;
    });
    currentY += 4;
  }

  // 自己PR（任意）
  if (data.selfPR) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text("自己PR", margin, currentY);
    currentY += 7;
    doc.setFontSize(11);

    const prLines = doc.splitTextToSize(data.selfPR, pageWidth - margin * 2);
    doc.text(prLines, margin, currentY);
    currentY += 6 * prLines.length + 4;
  }

  // 志望動機（任意）
  if (data.motivation) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text("志望動機", margin, currentY);
    currentY += 7;
    doc.setFontSize(11);

    const motLines = doc.splitTextToSize(data.motivation, pageWidth - margin * 2);
    doc.text(motLines, margin, currentY);
    currentY += 6 * motLines.length + 4;
  }

  // 本人希望欄（任意）
  if (data.remarks) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFontSize(14);
    doc.text("本人希望欄", margin, currentY);
    currentY += 7;
    doc.setFontSize(11);

    const remarkLines = doc.splitTextToSize(data.remarks, pageWidth - margin * 2);
    doc.text(remarkLines, margin, currentY);
  }

  // PDFを新しいタブで開く
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
}
