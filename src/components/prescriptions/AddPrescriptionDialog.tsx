import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Patient } from "@/types/patients";
import type { Appointment, Doctor } from "@/types/appointment";
import type { Prescription } from "@/types/prescription";
import type { AuthUser } from "@/types/auth";

const medicineSchema = z.object({
  id: z.string().optional(),
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string(),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().min(1, "Appointment is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  diagnosis: z.string().min(2, "Diagnosis is required"),
  medicines: z
    .array(medicineSchema)
    .min(1, "At least one medicine is required"),
  notes: z.string(),
});

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface AddPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  patients: Patient[];
  appointments: Appointment[];
  doctors: Doctor[];
  prescriptions: Prescription[];
  currentUser: AuthUser | null;

  saving: boolean;
  mutationError: string | null;

  prescription?: Prescription | null;

  onPrescriptionAdded: (data: PrescriptionFormData) => Promise<void>;
}

const defaultValues: PrescriptionFormData = {
  patientId: "",
  appointmentId: "",
  doctorId: "",
  diagnosis: "",
  medicines: [
    {
      medicineName: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ],
  notes: "",
};

export default function AddPrescriptionDialog({
  open,
  onOpenChange,
  patients,
  appointments,
  doctors,
  prescriptions,
  currentUser,
  saving,
  mutationError,
  prescription,
  onPrescriptionAdded,
}: AddPrescriptionDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines",
  });

  const patientId = useWatch({
    control,
    name: "patientId",
  });

  const appointmentId = useWatch({
    control,
    name: "appointmentId",
  });

  const doctorId = useWatch({
    control,
    name: "doctorId",
  });

  const prescribedAppointmentIds = new Set(
    prescriptions
      .filter((item) => String(item.id) !== String(prescription?.id))
      .map((item) => String(item.appointmentId)),
  );

  const eligibleAppointments = appointments.filter((appointment) => {
    const isCompleted = appointment.status === "Completed";

    const isAlreadyPrescribed = prescribedAppointmentIds.has(
      String(appointment.id),
    );

    const belongsToCurrentDoctor =
      currentUser?.role !== "Doctor" ||
      String(appointment.doctorId) === String(currentUser.doctorId);

    return isCompleted && !isAlreadyPrescribed && belongsToCurrentDoctor;
  });

  const eligiblePatientIds = new Set(
    eligibleAppointments.map((appointment) => String(appointment.patientId)),
  );

  const eligiblePatients = patients.filter((patient) =>
    eligiblePatientIds.has(String(patient.id)),
  );

  const filteredAppointments = eligibleAppointments.filter(
    (appointment) => String(appointment.patientId) === String(patientId),
  );

  const selectedDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(doctorId),
  );

  useEffect(() => {
    if (!appointmentId) {
      setValue("doctorId", "");
      return;
    }

    const appointment = appointments.find(
      (item) => String(item.id) === String(appointmentId),
    );

    if (appointment) {
      setValue("doctorId", String(appointment.doctorId), {
        shouldValidate: true,
      });
    }
  }, [appointmentId, appointments, setValue]);

  useEffect(() => {
    if (!open) return;

    if (prescription) {
      reset({
        patientId: String(prescription.patientId),
        appointmentId: String(prescription.appointmentId),
        doctorId: String(prescription.doctorId),
        diagnosis: prescription.diagnosis,
        medicines: prescription.medicines.map((medicine) => ({
          id: medicine.id,
          medicineName: medicine.medicineName,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
          instructions: medicine.instructions,
        })),
        notes: prescription.notes,
      });

      return;
    }

    reset(defaultValues);
  }, [open, prescription, reset]);

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      await onPrescriptionAdded(data);

      reset(defaultValues);
      onOpenChange(false);
    } catch {
      // Parent handles mutation error.
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value && !saving) {
      reset(defaultValues);
    }

    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {prescription ? "Edit Prescription" : "Add Prescription"}
          </DialogTitle>

          <DialogDescription>
            {prescription
              ? "Update prescription and medication details."
              : "Create a prescription for a patient's appointment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Patient */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>

              <Select
                items={eligiblePatients.map((patient) => ({
                  label: patient.name,
                  value: String(patient.id),
                }))}
                value={patientId}
                disabled={Boolean(prescription)}
                onValueChange={(value) => {
                  const nextPatientId = (value ?? "") as string;

                  setValue("patientId", nextPatientId, {
                    shouldValidate: true,
                  });

                  setValue("appointmentId", "", {
                    shouldValidate: true,
                  });

                  setValue("doctorId", "", {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>

                <SelectContent>
                  {eligiblePatients.map((patient) => (
                    <SelectItem key={patient.id} value={String(patient.id)}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.patientId && (
                <p className="text-xs text-red-600">
                  {errors.patientId.message}
                </p>
              )}
            </div>

            {/* Appointment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Appointment</label>

              <Select
                items={filteredAppointments.map((appointment) => ({
                  label: `${appointment.appointmentDate} - ${appointment.timeSlot}`,
                  value: String(appointment.id),
                }))}
                value={appointmentId}
                disabled={Boolean(prescription) || !patientId}
                onValueChange={(value) => {
                  setValue("appointmentId", (value ?? "") as string, {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      patientId ? "Select appointment" : "Select patient first"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {filteredAppointments.map((appointment) => (
                    <SelectItem
                      key={appointment.id}
                      value={String(appointment.id)}
                    >
                      {appointment.appointmentDate} - {appointment.timeSlot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.appointmentId && (
                <p className="text-xs text-red-600">
                  {errors.appointmentId.message}
                </p>
              )}
            </div>

            {/* Doctor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Doctor</label>

              <Input
                value={selectedDoctor?.name ?? ""}
                disabled
                placeholder="Doctor selected from appointment"
              />

              {errors.doctorId && (
                <p className="text-xs text-red-600">
                  {errors.doctorId.message}
                </p>
              )}
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnosis</label>

              <Input {...register("diagnosis")} placeholder="Enter diagnosis" />

              {errors.diagnosis && (
                <p className="text-xs text-red-600">
                  {errors.diagnosis.message}
                </p>
              )}
            </div>
          </div>

          {/* Medicines */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">Medicines</h3>

                <p className="text-xs text-slate-500">
                  Add medication and dosage instructions.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() =>
                  append({
                    medicineName: "",
                    dosage: "",
                    frequency: "",
                    duration: "",
                    instructions: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium">Medicine {index + 1}</p>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Medicine Name
                      </label>

                      <Input
                        {...register(`medicines.${index}.medicineName`)}
                        placeholder="e.g. Paracetamol"
                      />

                      {errors.medicines?.[index]?.medicineName && (
                        <p className="text-xs text-red-600">
                          {errors.medicines?.[index]?.medicineName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Dosage</label>

                      <Input
                        {...register(`medicines.${index}.dosage`)}
                        placeholder="e.g. 500 mg"
                      />

                      {errors.medicines?.[index]?.dosage && (
                        <p className="text-xs text-red-600">
                          {errors.medicines?.[index]?.dosage?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Frequency</label>

                      <Input
                        {...register(`medicines.${index}.frequency`)}
                        placeholder="e.g. Twice daily"
                      />

                      {errors.medicines?.[index]?.frequency && (
                        <p className="text-xs text-red-600">
                          {errors.medicines?.[index]?.frequency?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration</label>

                      <Input
                        {...register(`medicines.${index}.duration`)}
                        placeholder="e.g. 5 days"
                      />

                      {errors.medicines?.[index]?.duration && (
                        <p className="text-xs text-red-600">
                          {errors.medicines?.[index]?.duration?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">
                        Instructions
                      </label>

                      <Input
                        {...register(`medicines.${index}.instructions`)}
                        placeholder="e.g. Take after food"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>

            <Textarea
              {...register("notes")}
              placeholder="Additional notes..."
              rows={4}
            />
          </div>

          {mutationError && (
            <p className="text-sm text-red-600">{mutationError}</p>
          )}

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving
                ? "Saving..."
                : prescription
                  ? "Update Prescription"
                  : "Save Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
