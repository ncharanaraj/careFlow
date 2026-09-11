import type { Appointment, Doctor, Department } from "@/types/appointment";

const API_URL = "http://localhost:3001";

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await fetch(`${API_URL}/appointments`);

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return response.json();
};

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

export const createAppointment = async (
  appointment: Omit<Appointment, "id">,
): Promise<Appointment> => {
  const response = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointment),
  });

  if (!response.ok) {
    throw new Error("Failed to create appointment");
  }

  return response.json();
};

export const updateAppointment = async (
  id: string,
  appointment: Omit<Appointment, "id">,
): Promise<Appointment> => {
  const response = await fetch(`${API_URL}/appointments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointment),
  });

  if (!response.ok) {
    throw new Error("Failed to update appointment");
  }

  return response.json();
};

export const deleteAppointment = async (id: string): Promise<string> => {
  const response = await fetch(`${API_URL}/appointments/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete appointment");
  }

  return id;
};
