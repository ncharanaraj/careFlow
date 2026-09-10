import type { Patient } from "@/data/patients";

const API_URL = "http://localhost:3001";

export const getPatients = async (): Promise<Patient[]> => {
  const response = await fetch(`${API_URL}/patients`);

  if (!response.ok) {
    throw new Error("Failed to fetch patients");
  }

  return response.json();
};

export const createPatient = async (
  patient: Omit<Patient, "id">,
): Promise<Patient> => {
  const response = await fetch(`${API_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patient),
  });

  if (!response.ok) {
    throw new Error("Failed to create patient");
  }

  return response.json();
};
