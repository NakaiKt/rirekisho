import jsPDF from "jspdf";

type HtmlOptionsWithPageBreak = jsPDF.HTMLOptions & {
  pagebreak?: {
    mode?: Array<"avoid-all" | "css" | "legacy">;
  };
};

export async function generateResumePDF(element: HTMLElement): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const options: HtmlOptionsWithPageBreak = {
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
    };

    await pdf.html(element, options);
  } catch (error) {
    console.error("PDF生成に失敗しました:", error);
    throw new Error("PDF生成に失敗しました。もう一度お試しください。");
  }
}
