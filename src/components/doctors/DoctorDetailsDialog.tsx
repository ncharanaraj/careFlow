import type { Doctor, Department } from "@/types/appointment";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

interface DoctorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
  departments: Department[];
}

export default function DoctorDetailsDialog({
  open,
  onOpenChange,
  doctor,
  departments,
}: DoctorDetailsDialogProps) {
  if (!doctor) return null;

  const departmentName =
    departments.find(
      (department) => String(department.id) === String(doctor.departmentId),
    )?.name ?? "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Doctor Details</DialogTitle>

          <DialogDescription>
            View complete doctor information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Doctor</p>
            <p className="font-medium text-slate-900">{doctor.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Specialization</p>
            <p className="font-medium text-slate-900">
              {doctor.specialization}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Department</p>
            <p className="font-medium text-slate-900">{departmentName}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Experience</p>
            <p className="font-medium text-slate-900">
              {doctor.experience} {doctor.experience === 1 ? "year" : "years"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Phone</p>
            <p className="font-medium text-slate-900">{doctor.phone}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Email</p>
            <p className="break-all font-medium text-slate-900">
              {doctor.email}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Status</p>

            <Badge
              variant={doctor.status === "Active" ? "default" : "secondary"}
            >
              {doctor.status}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Created On</p>
            <p className="font-medium text-slate-900">
              {new Date(doctor.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
