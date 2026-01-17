import { ResumeFormData, CareerFormData } from './validation';

export async function generateResumePDFWithPuppeteer(data: ResumeFormData): Promise<void> {
  try {
    const response = await fetch('/api/generate-resume-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'PDF生成に失敗しました');
    }

    // PDFをダウンロード
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    // メモリ解放
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('PDF生成に失敗しました:', error);
    throw new Error('PDF生成に失敗しました。もう一度お試しください。');
  }
}

export async function generateCareerPDFWithPuppeteer(data: CareerFormData): Promise<void> {
  try {
    const response = await fetch('/api/generate-career-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'PDF生成に失敗しました');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('PDF生成に失敗しました:', error);
    throw new Error('PDF生成に失敗しました。もう一度お試しください。');
  }
}
