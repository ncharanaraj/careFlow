export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  bloodGroup: string;
  status: "Active" | "Inactive";
}

export const patients: Patient[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    age: 32,
    gender: "Male",
    phone: "9876543210",
    bloodGroup: "O+",
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Nair",
    age: 28,
    gender: "Female",
    phone: "9876543211",
    bloodGroup: "A+",
    status: "Active",
  },
  {
    id: 3,
    name: "Arun Kumar",
    age: 45,
    gender: "Male",
    phone: "9876543212",
    bloodGroup: "B+",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Sneha Rao",
    age: 36,
    gender: "Female",
    phone: "9876543213",
    bloodGroup: "AB+",
    status: "Active",
  },
  {
    id: 5,
    name: "Vikram Singh",
    age: 51,
    gender: "Male",
    phone: "9876543214",
    bloodGroup: "O-",
    status: "Active",
  },
  {
    id: 6,
    name: "Ananya Das",
    age: 24,
    gender: "Female",
    phone: "9876543215",
    bloodGroup: "B+",
    status: "Inactive",
  },
];