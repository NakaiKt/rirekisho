import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generateResumePDF(element: HTMLElement): Promise<void> {
  try {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0;
    const usableHeight = pageHeight - margin * 2;

    // Find all sections marked with data-pdf-section
    const sections = element.querySelectorAll("[data-pdf-section]");

    if (sections.length === 0) {
      // Fallback to original behavior if no sections found
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imageData = canvas.toDataURL("image/png");
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let position = 0;
      let heightLeft = imageHeight;

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
        heightLeft -= pageHeight;
      }
    } else {
      // Process each section individually
      let currentY = margin;
      let isFirstPage = true;

      for (const section of Array.from(sections)) {
        const sectionElement = section as HTMLElement;

        const canvas = await html2canvas(sectionElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: element.scrollWidth,
        });

        const imageData = canvas.toDataURL("image/png");
        const imageWidth = pageWidth - margin * 2;
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

              const sliceImageData = tempCanvas.toDataURL("image/png");
              pdf.addImage(sliceImageData, "PNG", margin, currentY, imageWidth, sliceHeight);
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
          pdf.addImage(imageData, "PNG", margin, currentY, imageWidth, imageHeight);
          currentY += imageHeight;
        }

        isFirstPage = false;
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
