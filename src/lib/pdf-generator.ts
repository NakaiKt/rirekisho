import jsPDF from "jspdf";

export async function generateResumePDF(element: HTMLElement): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    await pdf.html(element, {
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      callback: () => {
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
      },
    });
  } catch (error) {
    console.error("PDF生成に失敗しました:", error);
    throw new Error("PDF生成に失敗しました。もう一度お試しください。");
  }
}
