import type { Department, Staff } from "@/types/appointment";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { format, parse } from "date-fns";

interface StaffDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
  departments: Department[];
}

export default function StaffDetailsDialog({
  open,
  onOpenChange,
  staff,
  departments,
}: StaffDetailsDialogProps) {
  if (!staff) return null;

  const departmentName =
    departments.find(
      (department) => String(department.id) === String(staff.departmentId),
    )?.name ?? "Unknown";

  const joiningDate = format(
    parse(staff.joiningDate, "yyyy-MM-dd", new Date()),
    "dd MMM yyyy",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>

          <DialogDescription>View staff member information.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Name</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {staff.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Status</p>

            <div className="mt-1">
              <Badge
                variant={staff.status === "Active" ? "default" : "secondary"}
              >
                {staff.status}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500">Role</p>
            <p className="mt-1 text-sm text-slate-900">{staff.role}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Department</p>
            <p className="mt-1 text-sm text-slate-900">{departmentName}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="mt-1 text-sm text-slate-900">{staff.phone}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="mt-1 break-all text-sm text-slate-900">
              {staff.email}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500">Joining Date</p>
            <p className="mt-1 text-sm text-slate-900">{joiningDate}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
