import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generateResumePDF(element: HTMLElement): Promise<void> {
  try {
    // HTML要素をキャンバスに変換
    const canvas = await html2canvas(element, {
      scale: 2, // 高解像度
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // キャンバスの寸法を取得
    const imgWidth = 210; // A4幅 (mm)
    const pageHeight = 297; // A4高さ (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // PDFを作成
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let heightLeft = imgHeight;
    let position = 0;

    // キャンバスを画像として取得
    const imgData = canvas.toDataURL("image/png");

    // 最初のページに画像を追加
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 複数ページの場合
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // PDFを新しいタブで開く
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.error("PDF生成に失敗しました:", error);
    throw new Error("PDF生成に失敗しました。もう一度お試しください。");
  }
}
