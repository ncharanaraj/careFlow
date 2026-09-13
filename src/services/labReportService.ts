import type { LabReport } from "@/types/labReport";
import { API_URL } from "@/config/api";

export const getLabReports = async (): Promise<LabReport[]> => {
  const response = await fetch(`${API_URL}/labReports`);

  if (!response.ok) {
    throw new Error("Failed to fetch lab reports");
  }

  return response.json();
};

export const createLabReport = async (
  labReport: Omit<LabReport, "id">,
): Promise<LabReport> => {
  const response = await fetch(`${API_URL}/labReports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(labReport),
  });

  if (!response.ok) {
    throw new Error("Failed to create lab report");
  }

  return response.json();
};

export const updateLabReport = async (
  id: string,
  labReport: Omit<LabReport, "id">,
): Promise<LabReport> => {
  const response = await fetch(`${API_URL}/labReports/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      ...labReport,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update lab report");
  }

  return response.json();
};

export const deleteLabReport = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/labReports/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete lab report");
  }
};
