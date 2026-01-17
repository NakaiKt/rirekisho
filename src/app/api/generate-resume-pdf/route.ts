import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { ResumeFormData } from '@/lib/validation';

// Chromiumのパスを探す
function getChromePath(): string {
  const possiblePaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  // 環境変数から取得を試みる
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }

  // デフォルトパスを返す
  return possiblePaths[0];
}

export async function POST(request: NextRequest) {
  try {
    const data: ResumeFormData = await request.json();

    // HTMLテンプレートを生成
    const html = generateResumeHTML(data);

    // Puppeteerでブラウザを起動
    const browser = await puppeteer.launch({
      executablePath: getChromePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // PDFを生成
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
      },
    });

    await browser.close();

    // PDFをレスポンスとして返す
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rirekisho.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'PDF生成に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

function generateResumeHTML(data: ResumeFormData): string {
  // 簡易的なHTMLテンプレート
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #000;
    }
    .container {
      width: 100%;
      padding: 20px;
    }
    .title {
      text-align: center;
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 0.5em;
    }
    .date {
      text-align: right;
      font-size: 10pt;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
      width: 120px;
    }
    .section-title {
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
      padding: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">履 歴 書</h1>
    <div class="date">${new Date().toLocaleDateString('ja-JP')} 現在</div>

    <table>
      <tr>
        <th>ふりがな</th>
        <td>${data.furigana || ''}</td>
      </tr>
      <tr>
        <th>氏名</th>
        <td style="font-size: 14pt; font-weight: bold;">${data.name || ''}</td>
      </tr>
      <tr>
        <th>生年月日</th>
        <td>${data.birthDate || ''}</td>
      </tr>
      <tr>
        <th>性別</th>
        <td>${data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : ''}</td>
      </tr>
      <tr>
        <th>住所</th>
        <td>
          〒${data.postalCode || ''}<br>
          ${[data.prefecture, data.city, data.address, data.building].filter(Boolean).join(' ')}
        </td>
      </tr>
      <tr>
        <th>電話番号</th>
        <td>${data.phone || ''}</td>
      </tr>
      <tr>
        <th>メール</th>
        <td>${data.email || ''}</td>
      </tr>
    </table>

    ${data.education && data.education.length > 0 ? `
    <table>
      <tr>
        <td colspan="3" class="section-title">学歴</td>
      </tr>
      <tr>
        <th style="width: 80px;">年</th>
        <th style="width: 60px;">月</th>
        <th>学歴・職歴</th>
      </tr>
      ${data.education.map(edu => `
        <tr>
          <td>${edu.entryYear || ''}</td>
          <td>${edu.entryMonth || ''}</td>
          <td>${edu.schoolName || ''} 入学</td>
        </tr>
        <tr>
          <td>${edu.completionYear || ''}</td>
          <td>${edu.completionMonth || ''}</td>
          <td>${edu.schoolName || ''} ${edu.status === 'graduated' ? '卒業' : edu.status === 'withdrawn' ? '中退' : '修了'}</td>
        </tr>
      `).join('')}
    </table>
    ` : ''}

    ${data.workHistory && data.workHistory.length > 0 ? `
    <table>
      <tr>
        <td colspan="3" class="section-title">職歴</td>
      </tr>
      ${data.workHistory.map(work => `
        <tr>
          <td>${work.entryYear || ''}</td>
          <td>${work.entryMonth || ''}</td>
          <td>${work.companyName || ''} 入社</td>
        </tr>
        ${work.status === 'resigned' ? `
        <tr>
          <td>${work.exitYear || ''}</td>
          <td>${work.exitMonth || ''}</td>
          <td>${work.companyName || ''} 退社</td>
        </tr>
        ` : `
        <tr>
          <td></td>
          <td></td>
          <td>${work.companyName || ''} 在職中</td>
        </tr>
        `}
      `).join('')}
      <tr>
        <td colspan="2"></td>
        <td style="text-align: right;">以上</td>
      </tr>
    </table>
    ` : ''}

    ${data.qualifications && data.qualifications.length > 0 ? `
    <table>
      <tr>
        <td colspan="3" class="section-title">資格・免許</td>
      </tr>
      ${data.qualifications.map(qual => `
        <tr>
          <td>${qual.year || ''}</td>
          <td>${qual.month || ''}</td>
          <td>${qual.name || ''}</td>
        </tr>
      `).join('')}
    </table>
    ` : ''}

    ${data.motivation || data.selfPR ? `
    <table>
      ${data.motivation ? `
      <tr>
        <th>志望動機</th>
        <td style="min-height: 100px; vertical-align: top;">${data.motivation}</td>
      </tr>
      ` : ''}
      ${data.selfPR ? `
      <tr>
        <th>自己PR</th>
        <td style="min-height: 100px; vertical-align: top;">${data.selfPR}</td>
      </tr>
      ` : ''}
    </table>
    ` : ''}

    ${data.remarks ? `
    <table>
      <tr>
        <th>本人希望欄</th>
        <td style="min-height: 80px; vertical-align: top;">${data.remarks}</td>
      </tr>
    </table>
    ` : ''}
  </div>
</body>
</html>
  `;
}
