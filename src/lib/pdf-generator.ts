import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateResumePDFWithText } from './pdf-lib-generator';
import { ResumeFormData } from './validation';

// 古いhtml2canvas版のPDF生成（バックアップ）
export async function generatePDFLegacy(element: HTMLElement, filename: string = "document"): Promise<void> {
  try {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margins on all sides
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const sectionSpacing = 8; // PDFのみでセクション間に余白を追加

    // Find all sections marked with data-pdf-section
    const sections = Array.from(element.querySelectorAll("[data-pdf-section]"));

    if (sections.length === 0) {
      // Fallback to original behavior if no sections found
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.92);
      const imageWidth = usableWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let position = margin;
      let heightLeft = imageHeight;

      pdf.addImage(imageData, "JPEG", margin, position, imageWidth, imageHeight);
      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        position -= usableHeight;
        pdf.addPage();
        pdf.addImage(imageData, "JPEG", margin, position + margin, imageWidth, imageHeight);
        heightLeft -= usableHeight;
      }
    } else {
      // Process each section individually
      let currentY = margin;
      let isFirstPage = true;

      for (let index = 0; index < sections.length; index++) {
        const sectionElement = sections[index] as HTMLElement;

        const canvas = await html2canvas(sectionElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: element.scrollWidth,
        });

        const imageData = canvas.toDataURL("image/jpeg", 0.92);
        const imageWidth = usableWidth;
        const imageHeight = (canvas.height * imageWidth) / canvas.width;

        // Check if section fits on current page
        if (currentY + imageHeight > pageHeight - margin && !isFirstPage) {
          // Section doesn't fit, start new page
          pdf.addPage();
          currentY = margin;
        }

        // If section is taller than a page, we need to split it
        if (imageHeight > usableHeight) {
          let remainingHeight = imageHeight;
          let sourceY = 0;

          while (remainingHeight > 0) {
            const sliceHeight = Math.min(usableHeight - (currentY - margin), remainingHeight);
            const ratio = canvas.height / imageHeight;

            // Create a temporary canvas for the slice
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width;
            tempCanvas.height = sliceHeight * ratio;
            const ctx = tempCanvas.getContext("2d");

            if (ctx) {
              ctx.drawImage(
                canvas,
                0, sourceY * ratio,
                canvas.width, sliceHeight * ratio,
                0, 0,
                canvas.width, sliceHeight * ratio
              );

              const sliceImageData = tempCanvas.toDataURL("image/jpeg", 0.92);
              pdf.addImage(sliceImageData, "JPEG", margin, currentY, imageWidth, sliceHeight);
            }

            remainingHeight -= sliceHeight;
            sourceY += sliceHeight;

            if (remainingHeight > 0) {
              pdf.addPage();
              currentY = margin;
            } else {
              currentY += sliceHeight;
            }
          }
        } else {
          pdf.addImage(imageData, "JPEG", margin, currentY, imageWidth, imageHeight);
          currentY += imageHeight;
        }

        isFirstPage = false;
        // セクション間の余白をPDFにのみ追加
        const isLastSection = index === sections.length - 1;
        if (!isLastSection) {
          // 余白がページに収まらない場合は改ページ
          if (currentY + sectionSpacing > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          } else {
            currentY += sectionSpacing;
          }
        }
      }
    }

    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.error("PDF生成に失敗しました:", error);
    throw new Error("PDF生成に失敗しました。もう一度お試しください。");
  }
}

// 履歴書用のPDF生成関数（後方互換性のため）
export async function generateResumePDF(element: HTMLElement): Promise<void> {
  return generatePDFLegacy(element, "rirekisho");
}

// 職務経歴書用のPDF生成関数
export async function generateCareerPDF(element: HTMLElement): Promise<void> {
  return generatePDFLegacy(element, "shokumu-keirekisho");
}
