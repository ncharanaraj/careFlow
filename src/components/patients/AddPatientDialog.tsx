import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Patient } from "@/types/patients";

const patientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),

  age: z
    .string()
    .min(1, "Age is required")
    .refine((value) => {
      const age = Number(value);
      return age >= 1 && age <= 120;
    }, "Age must be between 1 and 120"),

  gender: z.string().min(1, "Gender is required"),

  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),

  bloodGroup: z.string().min(1, "Blood group is required"),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientAdded: (patient: PatientFormData) => void;
  patient?: Patient | null;
  saving?: boolean;
  mutationError?: string | null;
}

export default function AddPatientDialog({
  open,
  onOpenChange,
  onPatientAdded,
  patient,
  saving = false,
  mutationError,
}: AddPatientDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      phone: "",
      bloodGroup: "",
    },
  });

  const gender = useWatch({
    control,
    name: "gender",
  });

  const bloodGroup = useWatch({
    control,
    name: "bloodGroup",
  });

  useEffect(() => {
    if (open && patient) {
      reset({
        name: patient.name,
        age: String(patient.age),
        gender: patient.gender,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
      });
    }

    if (open && !patient) {
      reset({
        name: "",
        age: "",
        gender: "",
        phone: "",
        bloodGroup: "",
      });
    }
  }, [open, patient, reset]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      await onPatientAdded(data);

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{patient ? "Edit Patient" : "Add Patient"}</DialogTitle>
          <DialogDescription>
            {patient
              ? "Update the patient's information below."
              : "Enter the patient's information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Patient Name</Label>
            <Input
              id="name"
              placeholder="Enter patient name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                {...register("age")}
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>

              <Select
                value={gender}
                onValueChange={(value) =>
                  setValue("gender", (value ?? "") as string, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Blood Group</Label>

            <Select
              value={bloodGroup}
              onValueChange={(value) =>
                setValue("bloodGroup", (value ?? "") as string, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
            {errors.bloodGroup && (
              <p className="text-sm text-red-500">
                {errors.bloodGroup.message}
              </p>
            )}
          </div>

          {mutationError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{mutationError}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
              {saving ? "Saving..." : patient ? "Save Changes" : "Add Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
