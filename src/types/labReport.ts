export type LabReportStatus = "Ordered" | "Sample Collected" | "Completed";

export interface LabTestResult {
  id: string;
  testName: string;
  category: string;
  result: string;
  normalRange: string;
  unit: string;
}

export interface LabReport {
  id: string;
  patientId: string | number;
  appointmentId: string | number;
  doctorId: string | number;
  status: LabReportStatus;
  tests: LabTestResult[];
  notes: string;
  orderedAt: string;
  collectedAt?: string;
  completedAt?: string;
}
