import type { Department } from "@/types/appointment";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

interface DepartmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export default function DepartmentDetailsDialog({
  open,
  onOpenChange,
  department,
}: DepartmentDetailsDialogProps) {
  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Department Details</DialogTitle>

          <DialogDescription>
            View complete department information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Department</p>

            <p className="font-medium text-slate-900">{department.name}</p>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Status</p>

            <Badge
              variant={department.status === "Active" ? "default" : "secondary"}
            >
              {department.status}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs text-slate-500">Description</p>

            <p className="text-sm leading-6 text-slate-700">
              {department.description}
            </p>
          </div>

          {/* Created */}
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs text-slate-500">Created On</p>

            <p className="font-medium text-slate-900">
              {new Date(department.createdAt).toLocaleDateString("en-IN", {
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
