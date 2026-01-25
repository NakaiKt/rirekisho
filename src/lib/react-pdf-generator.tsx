import { pdf } from '@react-pdf/renderer';
import { ResumeFormData, CareerFormData } from './validation';
import { ResumePDFDocument } from '@/components/pdf/ResumePDFDocument';
import { CareerPDFDocument } from '@/components/pdf/CareerPDFDocument';

/**
 * 履歴書PDFを生成して新しいタブで開く
 */
export async function generateResumePDF(data: ResumeFormData): Promise<void> {
  try {
    const blob = await pdf(<ResumePDFDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('PDF生成に失敗しました:', error);
    throw new Error('PDF生成に失敗しました。もう一度お試しください。');
  }
}

/**
 * 職務経歴書PDFを生成して新しいタブで開く
 */
export async function generateCareerPDF(data: CareerFormData): Promise<void> {
  try {
    const blob = await pdf(<CareerPDFDocument data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('PDF生成に失敗しました:', error);
    throw new Error('PDF生成に失敗しました。もう一度お試しください。');
  }
}
