import type { LabReport } from "@/types/labReport";

const API_URL = "http://localhost:3001/labReports";

export const getLabReports = async (): Promise<LabReport[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch lab reports");
  }

  return response.json();
};

export const createLabReport = async (
  labReport: Omit<LabReport, "id">,
): Promise<LabReport> => {
  const response = await fetch(API_URL, {
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
  const response = await fetch(`${API_URL}/${id}`, {
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
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete lab report");
  }
};
