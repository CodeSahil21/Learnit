import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const generateCertificate = async (userName: string, courseTitle: string): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderWidth: 2, color: rgb(1, 1, 1), borderColor: rgb(0.2, 0.2, 0.2) });

  page.drawText('Certificate of Completion', { x: 180, y: 480, size: 32, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(`${userName}`, { x: 250, y: 380, size: 28, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(`has successfully completed`, { x: 250, y: 340, size: 16, font });
  page.drawText(`${courseTitle}`, { x: 250, y: 300, size: 22, font, color: rgb(0.1, 0.1, 0.1) });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
