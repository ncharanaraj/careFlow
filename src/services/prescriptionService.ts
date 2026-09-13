import type { Prescription } from "@/types/prescription";
import { API_URL } from "@/config/api";

export const getPrescriptions = async (): Promise<Prescription[]> => {
  const response = await fetch(`${API_URL}/prescriptions`);

  if (!response.ok) {
    throw new Error("Failed to fetch prescriptions");
  }

  return response.json();
};

export const createPrescription = async (
  prescription: Omit<Prescription, "id">,
): Promise<Prescription> => {
  const response = await fetch(`${API_URL}/prescriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prescription),
  });

  if (!response.ok) {
    throw new Error("Failed to create prescription");
  }

  return response.json();
};

export const updatePrescription = async (
  id: string,
  prescription: Omit<Prescription, "id">,
): Promise<Prescription> => {
  const response = await fetch(`${API_URL}/prescriptions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prescription),
  });

  if (!response.ok) {
    throw new Error("Failed to update prescription");
  }

  return response.json();
};

export const deletePrescription = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/prescriptions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete prescription");
  }
};
