export interface Patient {
  id: number | string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  bloodGroup: string;
  status: "Active" | "Inactive";
  createdAt: string;
}
