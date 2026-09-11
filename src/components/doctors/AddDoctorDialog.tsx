import { useWatch, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Department, Doctor } from "@/types/appointment";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

const doctorSchema = z.object({
  name: z.string().min(2, "Doctor name is required"),

  departmentId: z.string().min(1, "Department is required"),

  specialization: z.string().min(2, "Specialization is required"),

  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10 digit phone number"),

  email: z.email("Enter a valid email address"),

  experience: z
    .string()
    .min(1, "Experience is required")
    .refine((value) => Number(value) >= 0, "Experience cannot be negative"),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;

interface AddDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  onDoctorAdded: (data: DoctorFormData) => void;
  doctor?: Doctor | null;
  saving?: boolean;
  mutationError?: string | null;
}

export default function AddDoctorDialog({
  open,
  onOpenChange,
  departments,
  onDoctorAdded,
  doctor,
  saving = false,
  mutationError,
}: AddDoctorDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      departmentId: "",
      specialization: "",
      phone: "",
      email: "",
      experience: "",
    },
  });

  const departmentId = useWatch({
    control,
    name: "departmentId",
  });

  useEffect(() => {
    if (open && doctor) {
      reset({
        name: doctor.name,
        departmentId: String(doctor.departmentId),
        specialization: doctor.specialization,
        phone: doctor.phone,
        email: doctor.email,
        experience: String(doctor.experience),
      });
    }

    if (open && !doctor) {
      reset({
        name: "",
        departmentId: "",
        specialization: "",
        phone: "",
        email: "",
        experience: "",
      });
    }
  }, [open, doctor, reset]);

  const departmentItems = departments.map((department) => ({
    label: department.name,
    value: String(department.id),
  }));

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);

    if (!isOpen) {
      reset();
    }
  };

  const onSubmit = async (data: DoctorFormData) => {
    try {
      await onDoctorAdded(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{doctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>

          <DialogDescription>
            {doctor
              ? "Update the doctor's information."
              : "Add a new doctor to the hospital."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label>Doctor Name</Label>

              <Input {...register("name")} placeholder="Dr. Arjun Rao" />

              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label>Specialization</Label>

              <Input
                {...register("specialization")}
                placeholder="Cardiologist"
              />

              {errors.specialization && (
                <p className="text-xs text-red-500">
                  {errors.specialization.message}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>

              <Select
                items={departmentItems}
                value={departmentId || ""}
                onValueChange={(value) =>
                  setValue("departmentId", (value ?? "") as string, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
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
                <p className="text-xs text-red-500">
                  {errors.departmentId.message}
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label>Experience</Label>

              <Input
                type="number"
                min="0"
                {...register("experience")}
                placeholder="5"
              />

              {errors.experience && (
                <p className="text-xs text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Phone</Label>

              <Input {...register("phone")} placeholder="9876543210" />

              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                type="email"
                {...register("email")}
                placeholder="doctor@careflow.com"
              />

              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {mutationError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{mutationError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : doctor ? "Save Changes" : "Add Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
