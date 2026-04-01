import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Generates a professional certificate PDF and returns a buffer.
 */
export const generateCertificatePDF = async (userName, courseTitle, completionDate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 0
      });

      let chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // ─── Design Elements ───
      const width = doc.page.width;
      const height = doc.page.height;

      // 1. Background Gradient (Solid color for now for simplicity/compatibility)
      doc.rect(0, 0, width, height).fill("#f9fafb");

      // 2. Decorative Borders
      doc.rect(20, 20, width - 40, height - 40).lineWidth(2).stroke("#e5e7eb");
      doc.rect(30, 30, width - 60, height - 60).lineWidth(1).stroke("#3b81f6");

      // 3. Header
      doc
        .font("Helvetica-Bold")
        .fontSize(42)
        .fillColor("#1e3a8a")
        .text("CERTIFICATE OF COMPLETION", 0, 100, { align: "center" });

      doc
        .font("Helvetica")
        .fontSize(16)
        .fillColor("#6b7280")
        .text("This high-fidelity credential is proudly presented to", 0, 160, { align: "center" });

      // 4. Recipient Name
      doc
        .font("Helvetica-Bold")
        .fontSize(48)
        .fillColor("#111827")
        .text(userName.toUpperCase(), 0, 210, { align: "center" });

      // 5. Course Details
      doc
        .font("Helvetica")
        .fontSize(16)
        .fillColor("#6b7280")
        .text("for successfully navigating and mastering the curriculum of", 0, 280, { align: "center" });

      doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#2563eb")
        .text(courseTitle, 0, 320, { align: "center" });

      // 6. Security Seal Text
      doc
        .font("Helvetica-Oblique")
        .fontSize(12)
        .fillColor("#9ca3af")
        .text("Authorized by CyberShield Guard Enterprise Security Hub", 0, 380, { align: "center" });

      // 7. Footer Info
      const footerY = 460;
      
      // Date
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#374151")
        .text("DATE OF ISSUE", 150, footerY);
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#111827")
        .text(completionDate, 150, footerY + 20);

      // Certificate ID (Randomized for authenticity)
      const certId = "CSG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#374151")
        .text("VERIFICATION ID", width - 350, footerY);
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#111827")
        .text(certId, width - 350, footerY + 20);

      // 8. Signatures
      doc.lineWidth(1).moveTo(150, 520).lineTo(300, 520).stroke("#d1d5db");
      doc.fontSize(10).text("Admin Signature", 150, 530);

      doc.lineWidth(1).moveTo(width - 350, 520).lineTo(width - 150, 520).stroke("#d1d5db");
      doc.fontSize(10).text("System Hash", width - 350, 530);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
