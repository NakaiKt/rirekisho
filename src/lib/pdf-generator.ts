import jsPDF from "jspdf";

export async function generateResumePDF(element: HTMLElement): Promise<void> {
  try {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    await pdf.html(element, {
      callback: function (doc) {
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
      },
      x: 0,
      y: 0,
      width: 210, // A4 width in mm
      windowWidth: element.scrollWidth,
      html2canvas: {
        scale: 0.264583, // Convert px to mm (1mm = 3.7795px, so 1/3.7795 ≈ 0.264583)
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      autoPaging: "text",
    });
  } catch (error) {
    console.error("PDF生成に失敗しました:", error);
    throw new Error("PDF生成に失敗しました。もう一度お試しください。");
  }
}
