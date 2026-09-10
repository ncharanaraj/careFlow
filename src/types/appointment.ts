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
  id: string;
  name: string;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
}
