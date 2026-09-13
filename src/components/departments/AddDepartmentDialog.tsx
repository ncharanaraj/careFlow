import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import type { Department } from "@/types/appointment";
import { useEffect } from "react";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  description: z.string().min(5, "Description is required"),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepartmentAdded: (data: DepartmentFormData) => void;
  department?: Department | null;
  saving?: boolean;
  mutationError?: string | null;
}

export default function AddDepartmentDialog({
  open,
  onOpenChange,
  onDepartmentAdded,
  department,
  saving = false,
  mutationError,
}: AddDepartmentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);

    if (!isOpen) {
      reset();
    }
  };

  useEffect(() => {
    if (open && department) {
      reset({
        name: department.name,
        description: department.description,
      });
    }

    if (open && !department) {
      reset({
        name: "",
        description: "",
      });
    }
  }, [open, department, reset]);

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      await onDepartmentAdded(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Add Department"}
          </DialogTitle>

          <DialogDescription>
            {department
              ? "Update the department information."
              : "Add a new hospital department."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Department Name</Label>

            <Input {...register("name")} placeholder="Cardiology" />

            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>

            <textarea
              {...register("description")}
              placeholder="Enter department description"
              className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />

            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {mutationError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{mutationError}</p>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                : department
                  ? "Save Changes"
                  : "Add Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
