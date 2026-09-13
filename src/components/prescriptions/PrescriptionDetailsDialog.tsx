import { format } from "date-fns";

import type { Prescription } from "@/types/prescription";
import type { Patient } from "@/types/patients";
import type { Appointment, Doctor } from "@/types/appointment";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PrescriptionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
}

export default function PrescriptionDetailsDialog({
  open,
  onOpenChange,
  prescription,
  patients,
  doctors,
  appointments,
}: PrescriptionDetailsDialogProps) {
  if (!prescription) return null;

  const patient = patients.find(
    (item) => String(item.id) === String(prescription.patientId),
  );

  const doctor = doctors.find(
    (item) => String(item.id) === String(prescription.doctorId),
  );

  const appointment = appointments.find(
    (item) => String(item.id) === String(prescription.appointmentId),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Prescription Details</DialogTitle>

          <DialogDescription>
            View prescription, appointment and medication details.
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-6">
          {/* Patient / Doctor */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Patient" value={patient?.name ?? "Unknown"} />

            <DetailItem label="Doctor" value={doctor?.name ?? "Unknown"} />

            <DetailItem
              label="Appointment Date"
              value={appointment?.appointmentDate ?? "—"}
            />

            <DetailItem
              label="Time Slot"
              value={appointment?.timeSlot ?? "—"}
            />

            <DetailItem
              label="Created On"
              value={format(new Date(prescription.createdAt), "dd MMM yyyy")}
            />
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Diagnosis
            </p>

            <p className="text-sm text-slate-800">{prescription.diagnosis}</p>
          </div>

          {/* Medicines */}
          <div className="min-w-0 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Medicines
              </h3>

              <p className="text-xs text-slate-500">
                Medication and dosage instructions.
              </p>
            </div>

            <div className="w-full min-w-0 overflow-x-auto rounded-lg border">
              <Table className="min-w-175">
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Instructions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {prescription.medicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">
                        {medicine.medicineName}
                      </TableCell>

                      <TableCell>{medicine.dosage}</TableCell>

                      <TableCell>{medicine.frequency}</TableCell>

                      <TableCell>{medicine.duration}</TableCell>

                      <TableCell>{medicine.instructions || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Notes
            </p>

            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {prescription.notes || "No additional notes."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
