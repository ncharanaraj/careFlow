import type { Doctor, Department } from "@/types/appointment";
import { API_URL } from "@/config/api";

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

export const updateDoctor = async (
  id: string | number,
  doctor: Omit<Doctor, "id">,
): Promise<Doctor> => {
  const response = await fetch(`${API_URL}/doctors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doctor),
  });

  if (!response.ok) {
    throw new Error("Failed to update doctor");
  }

  return response.json();
};

export const deleteDoctor = async (
  id: string | number,
): Promise<string | number> => {
  const response = await fetch(`${API_URL}/doctors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete doctor");
  }

  return id;
};
