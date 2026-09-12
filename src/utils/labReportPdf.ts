import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { LabReport } from "@/types/labReport";

interface GenerateLabReportPdfParams {
  report: LabReport;
  patientName: string;
  doctorName: string;
}

export const generateLabReportPdf = ({
  report,
  patientName,
  doctorName,
}: GenerateLabReportPdfParams) => {
  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.text("CareFlow", 14, 20);

  pdf.setFontSize(14);
  pdf.text("Lab Report", 14, 30);

  pdf.setFontSize(10);

  pdf.text(`Patient: ${patientName}`, 14, 42);

  pdf.text(`Doctor: ${doctorName}`, 14, 49);

  pdf.text(`Status: ${report.status}`, 14, 56);

  pdf.text(
    `Ordered: ${new Date(report.orderedAt).toLocaleDateString("en-IN")}`,
    14,
    63,
  );

  if (report.collectedAt) {
    pdf.text(
      `Sample Collected: ${new Date(report.collectedAt).toLocaleDateString(
        "en-IN",
      )}`,
      14,
      70,
    );
  }

  if (report.completedAt) {
    pdf.text(
      `Completed: ${new Date(report.completedAt).toLocaleDateString("en-IN")}`,
      14,
      77,
    );
  }

  autoTable(pdf, {
    startY: report.completedAt ? 87 : report.collectedAt ? 80 : 73,

    head: [["Test", "Category", "Result", "Normal Range", "Unit"]],

    body: report.tests.map((test) => [
      test.testName,
      test.category,
      test.result || "Pending",
      test.normalRange || "-",
      test.unit || "-",
    ]),
  });

  const finalY =
    (
      pdf as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable?.finalY ?? 100;

  if (report.notes) {
    pdf.setFontSize(11);

    pdf.text("Notes", 14, finalY + 12);

    pdf.setFontSize(10);

    const noteLines = pdf.splitTextToSize(report.notes, 180);

    pdf.text(noteLines, 14, finalY + 20);
  }

  const fileName = `${patientName
    .replace(/\s+/g, "-")
    .toLowerCase()}-lab-report.pdf`;

  pdf.save(fileName);
};
