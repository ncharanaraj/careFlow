import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Patient } from "@/types/patients";
import type { Doctor, Department, Appointment } from "@/types/appointment";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  departmentId: z.string().min(1, "Department is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  onAppointmentAdded: (data: AppointmentFormData) => void;
  appointment?: Appointment | null;
  saving?: boolean;
  mutationError?: string | null;
}

export default function AddAppointmentDialog({
  open,
  onOpenChange,
  patients,
  doctors,
  departments,
  onAppointmentAdded,
  appointment,
  saving = false,
  mutationError,
}: AddAppointmentDialogProps) {
  const {
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      departmentId: "",
      doctorId: "",
      appointmentDate: "",
      timeSlot: "",
    },
  });

  const patientId = useWatch({
    control,
    name: "patientId",
  });

  const departmentId = useWatch({
    control,
    name: "departmentId",
  });

  const doctorId = useWatch({
    control,
    name: "doctorId",
  });

  const timeSlot = useWatch({
    control,
    name: "timeSlot",
  });

  const appointmentDate = useWatch({
    control,
    name: "appointmentDate",
  });

  useEffect(() => {
    if (open && appointment) {
      reset({
        patientId: String(appointment.patientId),
        departmentId: String(appointment.departmentId),
        doctorId: String(appointment.doctorId),
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
      });
    }

    if (open && !appointment) {
      reset({
        patientId: "",
        departmentId: "",
        doctorId: "",
        appointmentDate: "",
        timeSlot: "",
      });
    }
  }, [open, appointment, reset]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (doctor) => String(doctor.departmentId) === String(departmentId),
    );
  }, [doctors, departmentId]);

  const departmentItems = departments.map((department) => ({
    label: department.name,
    value: String(department.id),
  }));

  const patientItems = patients.map((patient) => ({
    label: patient.name,
    value: String(patient.id),
  }));

  const selectableDoctors = filteredDoctors.filter(
    (doctor) =>
      doctor.status === "Active" ||
      (appointment && String(doctor.id) === String(appointment.doctorId)),
  );

  const doctorItems = selectableDoctors.map((doctor) => ({
    label:
      doctor.status === "Inactive" ? `${doctor.name} (Inactive)` : doctor.name,
    value: String(doctor.id),
  }));

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);

    if (!isOpen) {
      reset({
        patientId: "",
        departmentId: "",
        doctorId: "",
        appointmentDate: "",
        timeSlot: "",
      });
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await onAppointmentAdded(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add appointment", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Add Appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? "Update the appointment information."
              : "Schedule a new patient appointment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Patient</Label>

            <Select
              items={patientItems}
              value={patientId}
              onValueChange={(value) =>
                setValue("patientId", (value ?? "") as string, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>

              <SelectContent>
                {patientItems.map((patient) => (
                  <SelectItem key={patient.value} value={patient.value}>
                    {patient.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.patientId && (
              <p className="text-sm text-red-500">{errors.patientId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Department</Label>

            <Select
              items={departmentItems}
              value={departmentId}
              onValueChange={(value) => {
                setValue("departmentId", value as string, {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                setValue("doctorId", "");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>

              <SelectContent>
                {departmentItems.map((department) => (
                  <SelectItem key={department.value} value={department.value}>
                    {department.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.departmentId && (
              <p className="text-sm text-red-500">
                {errors.departmentId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Doctor</Label>

            <Select
              items={doctorItems}
              value={doctorId || ""}
              disabled={!departmentId}
              onValueChange={(value) =>
                setValue("doctorId", (value ?? "") as string, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    departmentId ? "Select doctor" : "Select department first"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {doctorItems.map((doctor) => (
                  <SelectItem key={doctor.value} value={doctor.value}>
                    {doctor.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.doctorId && (
              <p className="text-sm text-red-500">{errors.doctorId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Appointment Date</Label>

              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {appointmentDate ? (
                    format(new Date(`${appointmentDate}T00:00:00`), "PPP")
                  ) : (
                    <span>Select appointment date</span>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      appointmentDate
                        ? new Date(`${appointmentDate}T00:00:00`)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;

                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const day = String(date.getDate()).padStart(2, "0");

                      setValue("appointmentDate", `${year}-${month}-${day}`, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>

              {errors.appointmentDate && (
                <p className="text-sm text-red-500">
                  {errors.appointmentDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Time Slot</Label>

              <Select
                value={timeSlot}
                onValueChange={(value) =>
                  setValue("timeSlot", value as string, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                  <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                  <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                  <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                  <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                  <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                </SelectContent>
              </Select>

              {errors.timeSlot && (
                <p className="text-sm text-red-500">
                  {errors.timeSlot.message}
                </p>
              )}
            </div>
          </div>

          {mutationError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{mutationError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
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
                : appointment
                  ? "Save Changes"
                  : "Add Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
