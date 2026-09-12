export interface PrescriptionMedicine {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string | number;
  doctorId: string | number;
  appointmentId: string | number;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  notes: string;
  createdAt: string;
}
