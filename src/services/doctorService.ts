import type { Doctor, Department } from "@/types/appointment";

const API_URL = "http://localhost:3001";

export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await fetch(`${API_URL}/doctors`);

  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }

  return response.json();
};

export const getDepartments = async (): Promise<Department[]> => {
  const response = await fetch(`${API_URL}/departments`);

  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }

  return response.json();
};

export const createDoctor = async (
  doctor: Omit<Doctor, "id">,
): Promise<Doctor> => {
  const response = await fetch(`${API_URL}/doctors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doctor),
  });

  if (!response.ok) {
    throw new Error("Failed to create doctor");
  }

  return response.json();
};
