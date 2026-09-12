import type { LabReport } from "@/types/labReport";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateLabReportPdf } from "@/utils/labReportPdf";
import { Button } from "../ui/button";
import { Download, Printer } from "lucide-react";

interface LabReportDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labReport: LabReport | null;
  patients: {
    id: string | number;
    name: string;
  }[];
  doctors: {
    id: string | number;
    name: string;
  }[];
}

export default function LabReportDetailsDialog({
  open,
  onOpenChange,
  labReport,
  patients,
  doctors,
}: LabReportDetailsDialogProps) {
  if (!labReport) {
    return null;
  }

  const patient = patients.find(
    (item) => String(item.id) === String(labReport.patientId),
  );

  const doctor = doctors.find(
    (item) => String(item.id) === String(labReport.doctorId),
  );

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = () => {
    generateLabReportPdf({
      report: labReport,
      patientName: patient?.name ?? "Unknown Patient",
      doctorName: doctor?.name ?? "Unknown Doctor",
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById("lab-report-print");

    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>Lab Report</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #111827;
          }

          h1 {
            margin-bottom: 4px;
          }

          h2 {
            margin-top: 0;
            color: #475569;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f1f5f9;
          }

          .details {
            display: grid;
            grid-template-columns:
              repeat(2, 1fr);
            gap: 12px;
            margin-top: 20px;
          }

          .notes {
            margin-top: 24px;
          }

          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Lab Report Details</DialogTitle>

          <DialogDescription>
            View patient test details and report status.
          </DialogDescription>
        </DialogHeader>

        <div id="lab-report-print" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Patient</p>

              <p className="mt-1 font-medium">{patient?.name ?? "Unknown"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Doctor</p>

              <p className="mt-1 font-medium">{doctor?.name ?? "Unknown"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Status</p>

              <div className="mt-1">
                <Badge
                  variant={
                    labReport.status === "Completed"
                      ? "default"
                      : labReport.status === "Sample Collected"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {labReport.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500">Ordered At</p>

              <p className="mt-1 font-medium">
                {formatDate(labReport.orderedAt)}
              </p>
            </div>

            {labReport.collectedAt && (
              <div>
                <p className="text-xs text-slate-500">Sample Collected At</p>

                <p className="mt-1 font-medium">
                  {formatDate(labReport.collectedAt)}
                </p>
              </div>
            )}

            {labReport.completedAt && (
              <div>
                <p className="text-xs text-slate-500">Completed At</p>

                <p className="mt-1 font-medium">
                  {formatDate(labReport.completedAt)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">Test Results</h3>

              <p className="text-sm text-slate-500">
                Diagnostic tests included in this lab report.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>

                    <TableHead>Category</TableHead>

                    <TableHead>Result</TableHead>

                    <TableHead>Normal Range</TableHead>

                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {labReport.tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        {test.testName}
                      </TableCell>

                      <TableCell>{test.category}</TableCell>

                      <TableCell>{test.result || "Pending"}</TableCell>

                      <TableCell>{test.normalRange || "—"}</TableCell>

                      <TableCell>{test.unit || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {labReport.notes && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Notes</p>

              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {labReport.notes}
              </p>
            </div>
          )}
        </div>

        {labReport.status === "Completed" && (
          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>

            <Button type="button" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
