import type { Patient } from "@/types/patients";
import { API_URL } from "@/config/api";

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

export const updatePatient = async (
  id: number | string,
  patient: Omit<Patient, "id">,
): Promise<Patient> => {
  const response = await fetch(`${API_URL}/patients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patient),
  });

  if (!response.ok) {
    throw new Error("Failed to update patient");
  }

  return response.json();
};

export const deletePatient = async (
  id: number | string,
): Promise<number | string> => {
  const response = await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete patient");
  }

  return id;
};
