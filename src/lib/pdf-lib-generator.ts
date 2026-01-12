import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ResumeFormData, CareerFormData } from './validation';
import { convertToEra } from './era-converter';

// A4サイズの定義 (mm)
const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const MARGIN = 10;

// mm to points conversion (1mm = 2.83465 points)
const mmToPoints = (mm: number) => mm * 2.83465;

// 日本語フォントをGoogle Fontsから取得
let cachedFont: ArrayBuffer | null = null;

async function loadJapaneseFont(): Promise<ArrayBuffer> {
  if (cachedFont) {
    return cachedFont;
  }

  try {
    // Google Fonts API から Noto Sans JP の CSS を取得
    const cssResponse = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    if (!cssResponse.ok) {
      throw new Error('Failed to fetch font CSS');
    }

    const cssText = await cssResponse.text();

    // CSS から フォント URL を抽出
    const fontUrlMatch = cssText.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf|otf))\)/);

    if (!fontUrlMatch) {
      throw new Error('Font URL not found in CSS');
    }

    const fontUrl = fontUrlMatch[1];

    // フォントファイルをフェッチ
    const fontResponse = await fetch(fontUrl);

    if (!fontResponse.ok) {
      throw new Error('Failed to fetch font file');
    }

    cachedFont = await fontResponse.arrayBuffer();
    return cachedFont;
  } catch (error) {
    console.error('Failed to load Japanese font:', error);
    throw new Error('日本語フォントの読み込みに失敗しました。もう一度お試しください。');
  }
}

// 履歴書PDF生成
export async function generateResumePDFWithText(data: ResumeFormData): Promise<void> {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // 日本語フォントをロード
    const fontBytes = await loadJapaneseFont();
    const jpFont = await pdfDoc.embedFont(fontBytes);

    // ページを追加
    let page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
    const { width, height } = page.getSize();
    const margin = mmToPoints(MARGIN);
    const usableWidth = width - margin * 2;

    let currentY = height - margin;

    // タイトル
    const titleSize = 24;
    const title = '履 歴 書';
    const titleWidth = jpFont.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: currentY,
      size: titleSize,
      font: jpFont,
      color: rgb(0, 0, 0),
    });
    currentY -= titleSize + mmToPoints(6);

    // 現在の日付
    const today = new Date();
    const todayEra = convertToEra(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const dateText = `${todayEra?.displayName || ''}${today.getMonth() + 1}月${today.getDate()}日 現在`;
    const dateSize = 10;
    const dateWidth = jpFont.widthOfTextAtSize(dateText, dateSize);
    page.drawText(dateText, {
      x: width - margin - dateWidth,
      y: currentY,
      size: dateSize,
      font: jpFont,
      color: rgb(0, 0, 0),
    });
    currentY -= dateSize + mmToPoints(4);

    // 基本情報テーブル
    currentY = await drawBasicInfoTable(page, jpFont, data, margin, currentY, usableWidth);

    // 学歴・職歴テーブル
    currentY -= mmToPoints(8);
    if (currentY < margin + mmToPoints(100)) {
      page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
      currentY = height - margin;
    }
    currentY = await drawHistoryTable(page, jpFont, data, margin, currentY, usableWidth);

    // 資格・免許
    if (data.qualifications && data.qualifications.length > 0) {
      currentY -= mmToPoints(8);
      if (currentY < margin + mmToPoints(80)) {
        page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
        currentY = height - margin;
      }
      currentY = await drawQualificationsTable(page, jpFont, data, margin, currentY, usableWidth);
    }

    // 志望動機・自己PR
    if (data.motivation || data.selfPR) {
      currentY -= mmToPoints(8);
      if (currentY < margin + mmToPoints(60)) {
        page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
        currentY = height - margin;
      }
      currentY = await drawMotivationTable(page, jpFont, data, margin, currentY, usableWidth);
    }

    // 本人希望欄
    if (data.remarks) {
      currentY -= mmToPoints(8);
      if (currentY < margin + mmToPoints(40)) {
        page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
        currentY = height - margin;
      }
      await drawRemarksTable(page, jpFont, data, margin, currentY, usableWidth);
    }

    // PDFを保存
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('PDF生成に失敗しました:', error);
    throw new Error('PDF生成に失敗しました。もう一度お試しください。');
  }
}

// 基本情報テーブルを描画
async function drawBasicInfoTable(
  page: any,
  font: any,
  data: ResumeFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  const borderWidth = 1.5;
  const cellPadding = mmToPoints(2);
  const labelWidth = mmToPoints(24);
  const photoWidth = mmToPoints(32);
  const photoHeight = mmToPoints(40);
  const rowHeight = mmToPoints(10);

  let currentY = startY;
  const tableWidth = usableWidth;
  const contentWidth = tableWidth - labelWidth - photoWidth;

  // 外枠を描画
  const tableHeight = rowHeight * 4 + mmToPoints(15); // 住所用に追加の高さ
  page.drawRectangle({
    x: margin,
    y: currentY - tableHeight,
    width: tableWidth,
    height: tableHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
  });

  // 生年月日のパース
  const parseBirthDate = () => {
    if (!data.birthDate) return null;
    const [year, month, day] = data.birthDate.split('/').map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
  };

  const parsedBirthDate = parseBirthDate();
  const birthEra = parsedBirthDate
    ? convertToEra(parsedBirthDate.year, parsedBirthDate.month, parsedBirthDate.day)
    : null;

  // 年齢計算
  const calculateAge = () => {
    if (!parsedBirthDate) return '';
    const today = new Date();
    const birthDate = new Date(parsedBirthDate.year, parsedBirthDate.month - 1, parsedBirthDate.day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 写真エリアを描画（右上）
  page.drawRectangle({
    x: margin + labelWidth + contentWidth,
    y: currentY - photoHeight,
    width: photoWidth,
    height: photoHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });

  // 写真があれば埋め込み（実装は後で）
  if (data.photo) {
    // TODO: 画像の埋め込み処理
  } else {
    page.drawText('写真', {
      x: margin + labelWidth + contentWidth + photoWidth / 2 - font.widthOfTextAtSize('写真', 8) / 2,
      y: currentY - photoHeight / 2,
      size: 8,
      font: font,
      color: rgb(0.7, 0.7, 0.7),
    });
  }

  // 行1: ふりがな
  drawTableCell(page, font, 'ふりがな', data.furigana || '', margin, currentY, labelWidth, contentWidth, rowHeight, cellPadding, true, false, 8, 10);
  currentY -= rowHeight;

  // 行2: 氏名
  drawTableCell(page, font, '氏名', data.name || '', margin, currentY, labelWidth, contentWidth, rowHeight, cellPadding, true, true, 8, 14);
  currentY -= rowHeight;

  // 行3: 生年月日
  const birthText = parsedBirthDate
    ? `${birthEra?.displayName || ''}${parsedBirthDate.month}月${parsedBirthDate.day}日生（満${calculateAge()}歳）`
    : '';
  drawTableCell(page, font, '生年月日', birthText, margin, currentY, labelWidth, contentWidth, rowHeight, cellPadding, false, false, 8, 10);
  currentY -= rowHeight;

  // 行4: 性別
  const genderText = data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : '';
  drawTableCell(page, font, '性別', genderText, margin, currentY, labelWidth, contentWidth, rowHeight, cellPadding, false, false, 8, 10);
  currentY -= rowHeight;

  // 行5-6: 現住所
  const addressRowHeight = mmToPoints(15);

  // ラベルセル
  page.drawRectangle({
    x: margin,
    y: currentY - addressRowHeight,
    width: labelWidth,
    height: addressRowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('現住所', {
    x: margin + cellPadding,
    y: currentY - addressRowHeight / 2,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });

  // 郵便番号行
  const postalHeight = mmToPoints(6);
  page.drawRectangle({
    x: margin + labelWidth,
    y: currentY - postalHeight,
    width: contentWidth + photoWidth,
    height: postalHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.95, 0.95, 0.95),
  });
  page.drawText(`〒${data.postalCode || ''}`, {
    x: margin + labelWidth + cellPadding,
    y: currentY - postalHeight + cellPadding,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });

  // 住所行
  const addressText = [data.prefecture, data.city, data.address, data.building]
    .filter(Boolean)
    .join(' ');
  page.drawRectangle({
    x: margin + labelWidth,
    y: currentY - addressRowHeight,
    width: contentWidth + photoWidth,
    height: addressRowHeight - postalHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  page.drawText(addressText, {
    x: margin + labelWidth + cellPadding,
    y: currentY - addressRowHeight + cellPadding,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  currentY -= addressRowHeight;

  // 行7: 電話番号とメール
  const contactHeight = mmToPoints(10);
  const halfWidth = (contentWidth + photoWidth) / 2;

  // 電話番号ラベル
  page.drawRectangle({
    x: margin,
    y: currentY - contactHeight,
    width: labelWidth,
    height: contactHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('電話番号', {
    x: margin + cellPadding,
    y: currentY - contactHeight / 2,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });

  // 電話番号
  page.drawRectangle({
    x: margin + labelWidth,
    y: currentY - contactHeight,
    width: halfWidth,
    height: contactHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  page.drawText(data.phone || '', {
    x: margin + labelWidth + cellPadding,
    y: currentY - contactHeight / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // メールラベル
  page.drawRectangle({
    x: margin + labelWidth + halfWidth,
    y: currentY - contactHeight,
    width: labelWidth,
    height: contactHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('メール', {
    x: margin + labelWidth + halfWidth + cellPadding,
    y: currentY - contactHeight / 2,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });

  // メールアドレス
  page.drawRectangle({
    x: margin + labelWidth + halfWidth + labelWidth,
    y: currentY - contactHeight,
    width: halfWidth - labelWidth,
    height: contactHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  const emailSize = 8;
  page.drawText(data.email || '', {
    x: margin + labelWidth + halfWidth + labelWidth + cellPadding,
    y: currentY - contactHeight / 2,
    size: emailSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  currentY -= contactHeight;

  return currentY;
}

// テーブルセルを描画するヘルパー関数
function drawTableCell(
  page: any,
  font: any,
  label: string,
  value: string,
  x: number,
  y: number,
  labelWidth: number,
  contentWidth: number,
  height: number,
  padding: number,
  grayLabel: boolean,
  boldValue: boolean,
  labelSize: number,
  valueSize: number
) {
  // ラベルセル
  page.drawRectangle({
    x: x,
    y: y - height,
    width: labelWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: grayLabel ? rgb(0.9, 0.9, 0.9) : undefined,
  });
  page.drawText(label, {
    x: x + padding,
    y: y - height / 2,
    size: labelSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // 値セル
  page.drawRectangle({
    x: x + labelWidth,
    y: y - height,
    width: contentWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  page.drawText(value, {
    x: x + labelWidth + padding,
    y: y - height / 2,
    size: valueSize,
    font: font,
    color: rgb(0, 0, 0),
  });
}

// 学歴・職歴テーブルを描画
async function drawHistoryTable(
  page: any,
  font: any,
  data: ResumeFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  const borderWidth = 1.5;
  const cellPadding = mmToPoints(2);
  const rowHeight = mmToPoints(9);
  const yearWidth = mmToPoints(20);
  const monthWidth = mmToPoints(12);
  const contentWidth = usableWidth - yearWidth - monthWidth;

  let currentY = startY;

  // 学歴データの準備
  const educationRows = (data.education ?? []).flatMap((edu) => {
    const rows: { year: string | number; month: string | number; text: string }[] = [];
    if (typeof edu.entryYear !== 'number' || typeof edu.entryMonth !== 'number') {
      return rows;
    }

    const entryEra = convertToEra(edu.entryYear, edu.entryMonth, 1);
    rows.push({
      year: entryEra?.displayName || edu.entryYear,
      month: edu.entryMonth,
      text: `${edu.schoolName} 入学`,
    });

    if (edu.status === 'enrolled') {
      rows.push({ year: '', month: '', text: `${edu.schoolName} 在学中` });
    } else if (edu.status === 'on_leave') {
      rows.push({ year: '', month: '', text: `${edu.schoolName} 休学中` });
    } else {
      const completionEra =
        edu.completionYear && edu.completionMonth
          ? convertToEra(edu.completionYear, edu.completionMonth, 1)
          : null;
      const statusLabel =
        edu.status === 'graduated' ? '卒業' : edu.status === 'withdrawn' ? '中退' : '修了';
      rows.push({
        year: completionEra?.displayName || edu.completionYear || '',
        month: edu.completionMonth || '',
        text: `${edu.schoolName} ${statusLabel}`,
      });
    }

    return rows;
  });

  // 職歴データの準備
  const workHistoryRows = (data.workHistory ?? []).flatMap((work) => {
    const rows: { year: string | number; month: string | number; text: string }[] = [];
    if (typeof work.entryYear !== 'number' || typeof work.entryMonth !== 'number') {
      return rows;
    }

    const entryEra = convertToEra(work.entryYear, work.entryMonth, 1);
    rows.push({
      year: entryEra?.displayName || work.entryYear,
      month: work.entryMonth,
      text: `${work.companyName} 入社`,
    });

    if (work.status === 'resigned') {
      const exitEra =
        work.exitYear && work.exitMonth ? convertToEra(work.exitYear, work.exitMonth, 1) : null;
      rows.push({
        year: exitEra?.displayName || work.exitYear || '',
        month: work.exitMonth || '',
        text: `${work.companyName} 退社`,
      });
    } else {
      rows.push({ year: '', month: '', text: `${work.companyName} 在職中` });
    }

    return rows;
  });

  const totalRows =
    (educationRows.length > 0 ? educationRows.length + 1 : 0) +
    (workHistoryRows.length > 0 ? workHistoryRows.length + 1 : 0) +
    1; // "以上"行

  const tableHeight = rowHeight * (totalRows + 1); // +1 for header

  // テーブルの外枠
  page.drawRectangle({
    x: margin,
    y: currentY - tableHeight,
    width: usableWidth,
    height: tableHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
  });

  // ヘッダー行
  drawHistoryHeaderRow(page, font, margin, currentY, yearWidth, monthWidth, contentWidth, rowHeight, cellPadding);
  currentY -= rowHeight;

  // 学歴
  if (educationRows.length > 0) {
    // "学　歴" セクションヘッダー
    page.drawRectangle({
      x: margin,
      y: currentY - rowHeight,
      width: usableWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    const sectionText = '学　歴';
    const sectionWidth = font.widthOfTextAtSize(sectionText, 10);
    page.drawText(sectionText, {
      x: margin + usableWidth / 2 - sectionWidth / 2,
      y: currentY - rowHeight / 2,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= rowHeight;

    // 学歴の各行
    for (const row of educationRows) {
      drawHistoryRow(
        page,
        font,
        margin,
        currentY,
        yearWidth,
        monthWidth,
        contentWidth,
        rowHeight,
        cellPadding,
        String(row.year),
        String(row.month),
        row.text
      );
      currentY -= rowHeight;
    }
  }

  // 職歴
  if (workHistoryRows.length > 0) {
    // "職　歴" セクションヘッダー
    page.drawRectangle({
      x: margin,
      y: currentY - rowHeight,
      width: usableWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    const sectionText = '職　歴';
    const sectionWidth = font.widthOfTextAtSize(sectionText, 10);
    page.drawText(sectionText, {
      x: margin + usableWidth / 2 - sectionWidth / 2,
      y: currentY - rowHeight / 2,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= rowHeight;

    // 職歴の各行
    for (const row of workHistoryRows) {
      drawHistoryRow(
        page,
        font,
        margin,
        currentY,
        yearWidth,
        monthWidth,
        contentWidth,
        rowHeight,
        cellPadding,
        String(row.year),
        String(row.month),
        row.text
      );
      currentY -= rowHeight;
    }
  }

  // "以上" 行
  if (educationRows.length > 0 || workHistoryRows.length > 0) {
    page.drawRectangle({
      x: margin,
      y: currentY - rowHeight,
      width: yearWidth + monthWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    page.drawRectangle({
      x: margin + yearWidth + monthWidth,
      y: currentY - rowHeight,
      width: contentWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    const endText = '以上';
    const endTextWidth = font.widthOfTextAtSize(endText, 10);
    page.drawText(endText, {
      x: margin + usableWidth - endTextWidth - cellPadding,
      y: currentY - rowHeight / 2,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= rowHeight;
  }

  return currentY;
}

function drawHistoryHeaderRow(
  page: any,
  font: any,
  x: number,
  y: number,
  yearWidth: number,
  monthWidth: number,
  contentWidth: number,
  height: number,
  padding: number
) {
  // 年
  page.drawRectangle({
    x: x,
    y: y - height,
    width: yearWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  const yearText = '年';
  const yearTextWidth = font.widthOfTextAtSize(yearText, 10);
  page.drawText(yearText, {
    x: x + yearWidth / 2 - yearTextWidth / 2,
    y: y - height / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // 月
  page.drawRectangle({
    x: x + yearWidth,
    y: y - height,
    width: monthWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  const monthText = '月';
  const monthTextWidth = font.widthOfTextAtSize(monthText, 10);
  page.drawText(monthText, {
    x: x + yearWidth + monthWidth / 2 - monthTextWidth / 2,
    y: y - height / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // 学歴・職歴
  page.drawRectangle({
    x: x + yearWidth + monthWidth,
    y: y - height,
    width: contentWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('学歴・職歴', {
    x: x + yearWidth + monthWidth + padding,
    y: y - height / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
}

function drawHistoryRow(
  page: any,
  font: any,
  x: number,
  y: number,
  yearWidth: number,
  monthWidth: number,
  contentWidth: number,
  height: number,
  padding: number,
  year: string,
  month: string,
  text: string
) {
  // 年
  page.drawRectangle({
    x: x,
    y: y - height,
    width: yearWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  if (year) {
    const yearTextWidth = font.widthOfTextAtSize(year, 10);
    page.drawText(year, {
      x: x + yearWidth / 2 - yearTextWidth / 2,
      y: y - height / 2,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
  }

  // 月
  page.drawRectangle({
    x: x + yearWidth,
    y: y - height,
    width: monthWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  if (month) {
    const monthTextWidth = font.widthOfTextAtSize(month, 10);
    page.drawText(month, {
      x: x + yearWidth + monthWidth / 2 - monthTextWidth / 2,
      y: y - height / 2,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
  }

  // テキスト
  page.drawRectangle({
    x: x + yearWidth + monthWidth,
    y: y - height,
    width: contentWidth,
    height: height,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });
  page.drawText(text, {
    x: x + yearWidth + monthWidth + padding,
    y: y - height / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
}

// 資格・免許テーブルを描画
async function drawQualificationsTable(
  page: any,
  font: any,
  data: ResumeFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  if (!data.qualifications || data.qualifications.length === 0) {
    return startY;
  }

  const borderWidth = 1.5;
  const cellPadding = mmToPoints(2);
  const rowHeight = mmToPoints(9);
  const yearWidth = mmToPoints(20);
  const monthWidth = mmToPoints(12);
  const contentWidth = usableWidth - yearWidth - monthWidth;

  let currentY = startY;
  const tableHeight = rowHeight * (data.qualifications.length + 1); // +1 for header

  // テーブルの外枠
  page.drawRectangle({
    x: margin,
    y: currentY - tableHeight,
    width: usableWidth,
    height: tableHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
  });

  // ヘッダー行
  page.drawRectangle({
    x: margin,
    y: currentY - rowHeight,
    width: yearWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  const yearText = '年';
  const yearTextWidth = font.widthOfTextAtSize(yearText, 10);
  page.drawText(yearText, {
    x: margin + yearWidth / 2 - yearTextWidth / 2,
    y: currentY - rowHeight / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  page.drawRectangle({
    x: margin + yearWidth,
    y: currentY - rowHeight,
    width: monthWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  const monthText = '月';
  const monthTextWidth = font.widthOfTextAtSize(monthText, 10);
  page.drawText(monthText, {
    x: margin + yearWidth + monthWidth / 2 - monthTextWidth / 2,
    y: currentY - rowHeight / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  page.drawRectangle({
    x: margin + yearWidth + monthWidth,
    y: currentY - rowHeight,
    width: contentWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('資格・免許', {
    x: margin + yearWidth + monthWidth + cellPadding,
    y: currentY - rowHeight / 2,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  currentY -= rowHeight;

  // 各資格
  for (const qual of data.qualifications) {
    const qualEra =
      qual.year !== undefined && qual.month !== undefined
        ? convertToEra(qual.year, qual.month, 1)
        : undefined;

    drawHistoryRow(
      page,
      font,
      margin,
      currentY,
      yearWidth,
      monthWidth,
      contentWidth,
      rowHeight,
      cellPadding,
      qualEra?.displayName || String(qual.year || ''),
      String(qual.month || ''),
      qual.name
    );
    currentY -= rowHeight;
  }

  return currentY;
}

// 志望動機・自己PRテーブルを描画
async function drawMotivationTable(
  page: any,
  font: any,
  data: ResumeFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  const borderWidth = 1.5;
  const cellPadding = mmToPoints(2);
  const labelWidth = mmToPoints(28);
  const contentWidth = usableWidth - labelWidth;
  const minRowHeight = mmToPoints(30);

  let currentY = startY;

  if (data.motivation) {
    const motivationHeight = Math.max(minRowHeight, mmToPoints(10)); // 簡易実装

    page.drawRectangle({
      x: margin,
      y: currentY - motivationHeight,
      width: usableWidth,
      height: motivationHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: borderWidth,
    });

    page.drawRectangle({
      x: margin,
      y: currentY - motivationHeight,
      width: labelWidth,
      height: motivationHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText('志望動機', {
      x: margin + cellPadding,
      y: currentY - cellPadding - 10,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + labelWidth,
      y: currentY - motivationHeight,
      width: contentWidth,
      height: motivationHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });

    // テキストの折り返し処理（簡易版）
    const lines = wrapText(data.motivation, font, 10, contentWidth - cellPadding * 2);
    let textY = currentY - cellPadding - 10;
    for (const line of lines) {
      page.drawText(line, {
        x: margin + labelWidth + cellPadding,
        y: textY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      textY -= 12;
      if (textY < currentY - motivationHeight + cellPadding) break;
    }

    currentY -= motivationHeight;
  }

  if (data.selfPR) {
    const prHeight = Math.max(minRowHeight, mmToPoints(10));

    page.drawRectangle({
      x: margin,
      y: currentY - prHeight,
      width: usableWidth,
      height: prHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: borderWidth,
    });

    page.drawRectangle({
      x: margin,
      y: currentY - prHeight,
      width: labelWidth,
      height: prHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText('自己PR', {
      x: margin + cellPadding,
      y: currentY - cellPadding - 10,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + labelWidth,
      y: currentY - prHeight,
      width: contentWidth,
      height: prHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });

    const lines = wrapText(data.selfPR, font, 10, contentWidth - cellPadding * 2);
    let textY = currentY - cellPadding - 10;
    for (const line of lines) {
      page.drawText(line, {
        x: margin + labelWidth + cellPadding,
        y: textY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      textY -= 12;
      if (textY < currentY - prHeight + cellPadding) break;
    }

    currentY -= prHeight;
  }

  return currentY;
}

// 本人希望欄テーブルを描画
async function drawRemarksTable(
  page: any,
  font: any,
  data: ResumeFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  if (!data.remarks) {
    return startY;
  }

  const borderWidth = 1.5;
  const cellPadding = mmToPoints(2);
  const labelWidth = mmToPoints(28);
  const contentWidth = usableWidth - labelWidth;
  const remarksHeight = mmToPoints(30);

  let currentY = startY;

  page.drawRectangle({
    x: margin,
    y: currentY - remarksHeight,
    width: usableWidth,
    height: remarksHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
  });

  page.drawRectangle({
    x: margin,
    y: currentY - remarksHeight,
    width: labelWidth,
    height: remarksHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('本人希望欄', {
    x: margin + cellPadding,
    y: currentY - cellPadding - 10,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  page.drawRectangle({
    x: margin + labelWidth,
    y: currentY - remarksHeight,
    width: contentWidth,
    height: remarksHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });

  const lines = wrapText(data.remarks, font, 10, contentWidth - cellPadding * 2);
  let textY = currentY - cellPadding - 10;
  for (const line of lines) {
    page.drawText(line, {
      x: margin + labelWidth + cellPadding,
      y: textY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    textY -= 12;
    if (textY < currentY - remarksHeight + cellPadding) break;
  }

  currentY -= remarksHeight;
  return currentY;
}

// テキストの折り返しヘルパー
function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('');
      continue;
    }

    let currentLine = '';
    for (const char of paragraph) {
      const testLine = currentLine + char;
      const width = font.widthOfTextAtSize(testLine, size);
      if (width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

// 職務経歴書PDF生成
export async function generateCareerPDFWithText(data: CareerFormData): Promise<void> {
  try {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // 日本語フォントをロード
    const fontBytes = await loadJapaneseFont();
    const jpFont = await pdfDoc.embedFont(fontBytes);

    // ページを追加
    let page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
    const { width, height } = page.getSize();
    const margin = mmToPoints(MARGIN);
    const usableWidth = width - margin * 2;

    let currentY = height - margin;

    // タイトル
    const titleSize = 24;
    const title = '職務経歴書';
    const titleWidth = jpFont.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: currentY,
      size: titleSize,
      font: jpFont,
      color: rgb(0, 0, 0),
    });
    currentY -= titleSize + mmToPoints(6);

    // 現在の日付
    const today = new Date();
    const todayEra = convertToEra(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const dateText = `${todayEra?.displayName || ''}${today.getMonth() + 1}月${today.getDate()}日 現在`;
    const dateSize = 10;
    const dateWidth = jpFont.widthOfTextAtSize(dateText, dateSize);
    page.drawText(dateText, {
      x: width - margin - dateWidth,
      y: currentY,
      size: dateSize,
      font: jpFont,
      color: rgb(0, 0, 0),
    });
    currentY -= dateSize + mmToPoints(4);

    // 基本情報テーブル
    currentY = await drawCareerBasicInfoTable(page, jpFont, data, margin, currentY, usableWidth);

    // 職務要約
    if (data.summary) {
      currentY -= mmToPoints(8);
      if (currentY < margin + mmToPoints(60)) {
        page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
        currentY = height - margin;
      }
      currentY = await drawCareerSummary(page, jpFont, data, margin, currentY, usableWidth);
    }

    // 職務経歴
    if (data.careerHistory && data.careerHistory.length > 0) {
      currentY -= mmToPoints(8);
      if (currentY < margin + mmToPoints(100)) {
        page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
        currentY = height - margin;
      }
      currentY = await drawCareerHistory(page, pdfDoc, jpFont, data, margin, currentY, usableWidth, height);
    }

    // 保有スキル
    if (data.skills && data.skills.length > 0) {
      currentY -= mmToPoints(8);
      if (currentY < margin + mmToPoints(60)) {
        page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
        currentY = height - margin;
      }
      await drawCareerSkills(page, jpFont, data, margin, currentY, usableWidth);
    }

    // PDFを保存
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('PDF生成に失敗しました:', error);
    throw new Error('PDF生成に失敗しました。もう一度お試しください。');
  }
}

// 職務経歴書の基本情報テーブルを描画
async function drawCareerBasicInfoTable(
  page: any,
  font: any,
  data: CareerFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  const borderWidth = 1.5;
  const cellPadding = mmToPoints(2);
  const labelWidth = mmToPoints(24);
  const rowHeight = mmToPoints(10);

  let currentY = startY;
  const contentWidth = usableWidth - labelWidth;

  // 生年月日のパース
  const parseBirthDate = () => {
    if (!data.birthDate) return null;
    const [year, month, day] = data.birthDate.split('/').map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
  };

  const parsedBirthDate = parseBirthDate();
  const birthEra = parsedBirthDate
    ? convertToEra(parsedBirthDate.year, parsedBirthDate.month, parsedBirthDate.day)
    : null;

  // 年齢計算
  const calculateAge = () => {
    if (!parsedBirthDate) return '';
    const today = new Date();
    const birthDate = new Date(parsedBirthDate.year, parsedBirthDate.month - 1, parsedBirthDate.day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const rows = [
    { label: 'ふりがな', value: data.furigana || '', labelSize: 8, valueSize: 10 },
    { label: '氏名', value: data.name || '', labelSize: 8, valueSize: 14 },
    { label: '生年月日', value: parsedBirthDate ? `${birthEra?.displayName || ''}${parsedBirthDate.month}月${parsedBirthDate.day}日生（満${calculateAge()}歳）` : '', labelSize: 8, valueSize: 10 },
    { label: '性別', value: data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : '', labelSize: 8, valueSize: 10 },
  ];

  const tableHeight = rowHeight * rows.length;

  // 外枠を描画
  page.drawRectangle({
    x: margin,
    y: currentY - tableHeight,
    width: usableWidth,
    height: tableHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
  });

  // 各行を描画
  for (const row of rows) {
    drawTableCell(page, font, row.label, row.value, margin, currentY, labelWidth, contentWidth, rowHeight, cellPadding, true, false, row.labelSize, row.valueSize);
    currentY -= rowHeight;
  }

  return currentY;
}

// 職務要約を描画
async function drawCareerSummary(
  page: any,
  font: any,
  data: CareerFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  if (!data.summary) return startY;

  const borderWidth = 1.5;
  const cellPadding = mmToPoints(3);
  const headerHeight = mmToPoints(10);
  const contentHeight = mmToPoints(40);

  let currentY = startY;

  // ヘッダー
  page.drawRectangle({
    x: margin,
    y: currentY - headerHeight,
    width: usableWidth,
    height: headerHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('職務要約', {
    x: margin + cellPadding,
    y: currentY - headerHeight / 2 - 3,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  currentY -= headerHeight;

  // コンテンツ
  page.drawRectangle({
    x: margin,
    y: currentY - contentHeight,
    width: usableWidth,
    height: contentHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
  });

  const lines = wrapText(data.summary, font, 10, usableWidth - cellPadding * 2);
  let textY = currentY - cellPadding - 10;
  for (const line of lines) {
    if (textY < currentY - contentHeight + cellPadding) break;
    page.drawText(line, {
      x: margin + cellPadding,
      y: textY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    textY -= 12;
  }

  currentY -= contentHeight;
  return currentY;
}

// 職務経歴を描画
async function drawCareerHistory(
  page: any,
  pdfDoc: any,
  font: any,
  data: CareerFormData,
  margin: number,
  startY: number,
  usableWidth: number,
  pageHeight: number
): Promise<number> {
  if (!data.careerHistory || data.careerHistory.length === 0) return startY;

  const borderWidth = 1.5;
  const cellPadding = mmToPoints(3);
  const headerHeight = mmToPoints(10);

  let currentY = startY;

  // ヘッダー
  page.drawRectangle({
    x: margin,
    y: currentY - headerHeight,
    width: usableWidth,
    height: headerHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('職務経歴', {
    x: margin + cellPadding,
    y: currentY - headerHeight / 2 - 3,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  currentY -= headerHeight;

  // 各職歴
  for (let i = 0; i < data.careerHistory.length; i++) {
    const career = data.careerHistory[i];
    const isLast = i === data.careerHistory.length - 1;

    const startEra = career.startYear && career.startMonth
      ? convertToEra(career.startYear, career.startMonth, 1)
      : null;
    const endEra = career.endYear && career.endMonth
      ? convertToEra(career.endYear, career.endMonth, 1)
      : null;

    const periodText = (() => {
      const startText = startEra
        ? `${startEra.displayName}${career.startMonth}月`
        : career.startYear && career.startMonth
        ? `${career.startYear}年${career.startMonth}月`
        : '';
      const endText =
        career.endYear && career.endMonth
          ? endEra
            ? `${endEra.displayName}${career.endMonth}月`
            : `${career.endYear}年${career.endMonth}月`
          : '在職中';

      return startText && endText ? `${startText} 〜 ${endText}` : startText || endText;
    })();

    const employmentTypeLabels: Record<string, string> = {
      fullTime: '正社員',
      contract: '契約社員',
      partTime: 'アルバイト・パート',
      dispatch: '派遣',
    };

    const employmentText = career.employmentType ? ` （${employmentTypeLabels[career.employmentType] || career.employmentType}）` : '';

    // 推定の高さを計算
    const estimatedHeight = mmToPoints(30); // 簡易実装

    // ページをまたぐ場合は新しいページを追加
    if (currentY - estimatedHeight < margin) {
      page = pdfDoc.addPage([mmToPoints(A4_WIDTH), mmToPoints(A4_HEIGHT)]);
      currentY = pageHeight - margin;
    }

    const sectionHeight = estimatedHeight;

    // セクションの背景
    page.drawRectangle({
      x: margin,
      y: currentY - sectionHeight,
      width: usableWidth,
      height: sectionHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: isLast ? borderWidth : 0.5,
    });

    // 会社名
    let textY = currentY - cellPadding - 12;
    page.drawText(career.companyName || '', {
      x: margin + cellPadding,
      y: textY,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    textY -= 14;

    // 期間と雇用形態
    page.drawText(periodText + employmentText, {
      x: margin + cellPadding,
      y: textY,
      size: 9,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    textY -= 14;

    // 部署・役職
    if (career.department || career.position) {
      const deptText = career.department ? `部署：${career.department}` : '';
      const posText = career.position ? `役職：${career.position}` : '';
      const separator = career.department && career.position ? ' | ' : '';
      page.drawText(deptText + separator + posText, {
        x: margin + cellPadding,
        y: textY,
        size: 9,
        font: font,
        color: rgb(0, 0, 0),
      });
      textY -= 12;
    }

    // 業務内容（簡易版）
    if (career.jobDescription) {
      page.drawText('【業務内容】', {
        x: margin + cellPadding,
        y: textY,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
      textY -= 10;
      const lines = wrapText(career.jobDescription, font, 9, usableWidth - cellPadding * 4);
      for (let j = 0; j < Math.min(lines.length, 2); j++) {
        page.drawText(lines[j], {
          x: margin + cellPadding * 2,
          y: textY,
          size: 9,
          font: font,
          color: rgb(0, 0, 0),
        });
        textY -= 11;
      }
    }

    currentY -= sectionHeight;
  }

  return currentY;
}

// 保有スキルを描画
async function drawCareerSkills(
  page: any,
  font: any,
  data: CareerFormData,
  margin: number,
  startY: number,
  usableWidth: number
): Promise<number> {
  if (!data.skills || data.skills.length === 0) return startY;

  const borderWidth = 1.5;
  const cellPadding = mmToPoints(2);
  const headerHeight = mmToPoints(10);
  const rowHeight = mmToPoints(9);
  const categoryWidth = mmToPoints(32);
  const experienceWidth = mmToPoints(32);
  const skillWidth = usableWidth - categoryWidth - experienceWidth;

  let currentY = startY;

  // ヘッダー
  page.drawRectangle({
    x: margin,
    y: currentY - headerHeight,
    width: usableWidth,
    height: headerHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: borderWidth,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText('保有スキル', {
    x: margin + cellPadding,
    y: currentY - headerHeight / 2 - 3,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  currentY -= headerHeight;

  // テーブルヘッダー
  page.drawRectangle({
    x: margin,
    y: currentY - rowHeight,
    width: categoryWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.95, 0.95, 0.95),
  });
  page.drawText('カテゴリ', {
    x: margin + cellPadding,
    y: currentY - rowHeight / 2,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });

  page.drawRectangle({
    x: margin + categoryWidth,
    y: currentY - rowHeight,
    width: skillWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.95, 0.95, 0.95),
  });
  page.drawText('スキル名', {
    x: margin + categoryWidth + cellPadding,
    y: currentY - rowHeight / 2,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });

  page.drawRectangle({
    x: margin + categoryWidth + skillWidth,
    y: currentY - rowHeight,
    width: experienceWidth,
    height: rowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
    color: rgb(0.95, 0.95, 0.95),
  });
  page.drawText('経験', {
    x: margin + categoryWidth + skillWidth + cellPadding,
    y: currentY - rowHeight / 2,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });
  currentY -= rowHeight;

  // スキル行
  for (const skill of data.skills) {
    page.drawRectangle({
      x: margin,
      y: currentY - rowHeight,
      width: categoryWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    page.drawText(skill.category || '-', {
      x: margin + cellPadding,
      y: currentY - rowHeight / 2,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + categoryWidth,
      y: currentY - rowHeight,
      width: skillWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    page.drawText(skill.skillName || '', {
      x: margin + categoryWidth + cellPadding,
      y: currentY - rowHeight / 2,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: margin + categoryWidth + skillWidth,
      y: currentY - rowHeight,
      width: experienceWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
    page.drawText(skill.experience || '-', {
      x: margin + categoryWidth + skillWidth + cellPadding,
      y: currentY - rowHeight / 2,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });

    currentY -= rowHeight;
  }

  return currentY;
}
