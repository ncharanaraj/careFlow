export interface Appointment {
  id: string;
  patientId: number | string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string;
  timeSlot: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  createdAt: string;
}

export interface Doctor {
  id: string | number;
  name: string;
  departmentId: string;
  specialization: string;
  phone: string;
  email: string;
  experience: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}
