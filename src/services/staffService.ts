import type { Staff } from "@/types/appointment";

const API_URL = "http://localhost:3001";

export const getStaff = async (): Promise<Staff[]> => {
  const response = await fetch(`${API_URL}/staff`);

  if (!response.ok) {
    throw new Error("Failed to fetch staff");
  }

  return response.json();
};

export const createStaff = async (staff: Omit<Staff, "id">): Promise<Staff> => {
  const response = await fetch(`${API_URL}/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staff),
  });

  if (!response.ok) {
    throw new Error("Failed to create staff");
  }

  return response.json();
};

export const updateStaff = async (
  id: string | number,
  staff: Omit<Staff, "id">,
): Promise<Staff> => {
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(staff),
  });

  if (!response.ok) {
    throw new Error("Failed to update staff");
  }

  return response.json();
};

export const deleteStaff = async (
  id: string | number,
): Promise<string | number> => {
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete staff");
  }

  return id;
};
