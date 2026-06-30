import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const exportToTXT = (subject, content) => {
  const text = `Subject: ${subject}\n\n${content}`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${subject.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "email"}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (subject, content) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const margin = 20;
  const width = doc.internal.pageSize.getWidth() - 2 * margin;

  // Add Logo Header
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229); // Brand primary purple
  doc.text("EmailAI - AI Writing Suite", margin, 15);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 17, margin + width, 17);

  // Subject Section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(`Subject: ${subject}`, margin, 27, { maxWidth: width });

  // Body content parsing
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);

  const lines = doc.splitTextToSize(content, width);
  doc.text(lines, margin, 40);

  // Footer note
  doc.setFont("Helvetica", "oblique");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.text("Generated with EmailAI Enterprise Suite", margin, pageHeight - 12);

  doc.save(`${subject.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "email"}.pdf`);
};

export const exportToDOCX = async (subject, content) => {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "EmailAI - AI Writing Suite",
                  bold: true,
                  color: "4F46E5",
                  size: 20, // 10pt
                }),
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Subject: ${subject}`,
                  bold: true,
                  color: "1E293B",
                  size: 28, // 14pt
                }),
              ],
              spacing: { after: 300 }
            }),
            ...content.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      color: "475569",
                      size: 22, // 11pt
                    }),
                  ],
                  spacing: { after: 150 }
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${subject.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "email"}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate DOCX file:", error);
    throw error;
  }
};
