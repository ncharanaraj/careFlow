import type { Department } from "@/types/appointment";

const API_URL = "http://localhost:3001";

export const getDepartments = async (): Promise<Department[]> => {
  const response = await fetch(`${API_URL}/departments`);

  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }

  return response.json();
};

export const createDepartment = async (
  department: Omit<Department, "id">,
): Promise<Department> => {
  const response = await fetch(`${API_URL}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(department),
  });

  if (!response.ok) {
    throw new Error("Failed to create department");
  }

  return response.json();
};

export const updateDepartment = async (
  id: string | number,
  department: Omit<Department, "id">,
): Promise<Department> => {
  const response = await fetch(`${API_URL}/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(department),
  });

  if (!response.ok) {
    throw new Error("Failed to update department");
  }

  return response.json();
};

export const deleteDepartment = async (
  id: string | number,
): Promise<string | number> => {
  const response = await fetch(`${API_URL}/departments/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete department");
  }

  return id;
};
