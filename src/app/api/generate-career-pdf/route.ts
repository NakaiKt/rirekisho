import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { CareerFormData } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const data: CareerFormData = await request.json();

    const html = generateCareerHTML(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

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

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="shokumu-keirekisho.pdf"',
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

function generateCareerHTML(data: CareerFormData): string {
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
      line-height: 1.6;
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
      letter-spacing: 0.3em;
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
    .section-header {
      background-color: #e0e0e0;
      font-weight: bold;
      font-size: 12pt;
      padding: 10px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .career-item {
      margin-bottom: 15px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .career-company {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .career-period {
      font-size: 9pt;
      color: #666;
      margin-bottom: 5px;
    }
    .career-detail {
      font-size: 9pt;
      margin-left: 10px;
    }
    .skill-table {
      width: 100%;
      margin-top: 10px;
    }
    .skill-table th {
      background-color: #f5f5f5;
      width: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">職務経歴書</h1>
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
    </table>

    ${data.summary ? `
    <div class="section-header">職務要約</div>
    <div style="padding: 15px; border: 1px solid #ddd; background: #fafafa; margin-bottom: 20px;">
      ${data.summary.split('\n').map(line => `<p>${line}</p>`).join('')}
    </div>
    ` : ''}

    ${data.careerHistory && data.careerHistory.length > 0 ? `
    <div class="section-header">職務経歴</div>
    ${data.careerHistory.map(career => {
      const employmentTypes: Record<string, string> = {
        fullTime: '正社員',
        contract: '契約社員',
        partTime: 'アルバイト・パート',
        dispatch: '派遣',
      };
      const periodText = (() => {
        const start = career.startYear && career.startMonth ? `${career.startYear}年${career.startMonth}月` : '';
        const end = career.endYear && career.endMonth ? `${career.endYear}年${career.endMonth}月` : '在職中';
        return start && end ? `${start} 〜 ${end}` : start || end;
      })();
      const employmentText = career.employmentType ? ` （${employmentTypes[career.employmentType] || career.employmentType}）` : '';

      return `
        <div class="career-item">
          <div class="career-company">${career.companyName || ''}</div>
          <div class="career-period">${periodText}${employmentText}</div>
          ${career.department || career.position ? `
            <div class="career-detail">
              <strong>部署・役職：</strong>
              ${[career.department, career.position].filter(Boolean).join(' / ')}
            </div>
          ` : ''}
          ${career.jobDescription ? `
            <div class="career-detail">
              <strong>【業務内容】</strong><br>
              ${career.jobDescription.split('\n').map(line => `${line}<br>`).join('')}
            </div>
          ` : ''}
          ${career.achievements ? `
            <div class="career-detail">
              <strong>【実績・成果】</strong><br>
              ${career.achievements.split('\n').map(line => `${line}<br>`).join('')}
            </div>
          ` : ''}
          ${career.technologies ? `
            <div class="career-detail">
              <strong>【使用技術】</strong> ${career.technologies}
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}
    ` : ''}

    ${data.skills && data.skills.length > 0 ? `
    <div class="section-header">保有スキル</div>
    <table class="skill-table">
      <tr>
        <th style="width: 150px;">カテゴリ</th>
        <th>スキル名</th>
        <th style="width: 120px;">経験</th>
      </tr>
      ${data.skills.map(skill => `
        <tr>
          <td>${skill.category || '-'}</td>
          <td>${skill.skillName || ''}</td>
          <td>${skill.experience || '-'}</td>
        </tr>
      `).join('')}
    </table>
    ` : ''}
  </div>
</body>
</html>
  `;
}
