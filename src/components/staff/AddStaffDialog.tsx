import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Department, Staff } from "@/types/appointment";

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
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { Calendar } from "../ui/calendar";

const staffSchema = z.object({
  name: z.string().min(2, "Staff name is required"),

  role: z.string().min(1, "Role is required"),

  departmentId: z.string().min(1, "Department is required"),

  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10 digit phone number"),

  email: z.email("Enter a valid email address"),

  joiningDate: z.string().min(1, "Joining date is required"),
});

export type StaffFormData = z.infer<typeof staffSchema>;

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  onStaffAdded: (data: StaffFormData) => void;
  staff?: Staff | null;
}

export default function AddStaffDialog({
  open,
  onOpenChange,
  departments,
  onStaffAdded,
  staff,
}: AddStaffDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),

    defaultValues: {
      name: "",
      role: "",
      departmentId: "",
      phone: "",
      email: "",
      joiningDate: "",
    },
  });

  useEffect(() => {
    if (open && staff) {
      reset({
        name: staff.name,
        role: staff.role,
        departmentId: String(staff.departmentId),
        phone: staff.phone,
        email: staff.email,
        joiningDate: staff.joiningDate,
      });
    }

    if (open && !staff) {
      reset({
        name: "",
        role: "",
        departmentId: "",
        phone: "",
        email: "",
        joiningDate: "",
      });
    }
  }, [open, staff, reset]);

  const role = useWatch({
    control,
    name: "role",
  });

  const departmentId = useWatch({
    control,
    name: "departmentId",
  });

  const joiningDate = useWatch({
    control,
    name: "joiningDate",
  });

  const onSubmit = async (data: StaffFormData) => {
    await onStaffAdded(data);

    reset();
    onOpenChange(false);
  };

  const selectedJoiningDate = joiningDate
    ? parse(joiningDate, "yyyy-MM-dd", new Date())
    : undefined;

  const roleItems = [
    { label: "Nurse", value: "Nurse" },
    { label: "Receptionist", value: "Receptionist" },
    { label: "Lab Technician", value: "Lab Technician" },
    { label: "Pharmacist", value: "Pharmacist" },
    { label: "Administrator", value: "Administrator" },
  ];

  const departmentItems = departments.map((department) => ({
    label: department.name,
    value: String(department.id),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{staff ? "Edit Staff" : "Add Staff"}</DialogTitle>

          <DialogDescription>
            {staff
              ? "Update the staff member information."
              : "Add a new staff member to the hospital."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Staff Name</Label>

              <Input
                id="name"
                placeholder="Enter staff name"
                {...register("name")}
              />

              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>

              <Select
                items={roleItems}
                value={role}
                onValueChange={(value) =>
                  setValue("role", (value ?? "") as string, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  {roleItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>

              <Select
                items={departmentItems}
                value={departmentId}
                onValueChange={(value) =>
                  setValue("departmentId", (value ?? "") as string, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>

                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem
                      key={department.id}
                      value={String(department.id)}
                    >
                      {department.name}
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

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>

              <Input
                id="phone"
                placeholder="9876543210"
                {...register("phone")}
              />

              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="staff@careflow.com"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Joining Date */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Joining Date</Label>

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

                  {selectedJoiningDate ? (
                    format(selectedJoiningDate, "dd MMM yyyy")
                  ) : (
                    <span className="text-muted-foreground">
                      Select joining date
                    </span>
                  )}
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedJoiningDate}
                    onSelect={(date) => {
                      if (!date) return;

                      setValue("joiningDate", format(date, "yyyy-MM-dd"), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>

              {errors.joiningDate && (
                <p className="text-xs text-red-500">
                  {errors.joiningDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              {staff ? "Save Changes" : "Add Staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
