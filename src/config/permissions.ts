import type { UserRole } from "@/types/auth";

type Permission =
  | "patient:add"
  | "patient:edit"
  | "patient:delete"
  | "appointment:add"
  | "appointment:edit"
  | "appointment:complete"
  | "appointment:cancel"
  | "appointment:delete"
  | "prescription:add"
  | "prescription:edit"
  | "prescription:delete"
  | "lab-report:add"
  | "lab-report:edit"
  | "lab-report:collect"
  | "lab-report:complete"
  | "lab-report:delete";

const permissions: Record<UserRole, Permission[]> = {
  Admin: [
    "patient:add",
    "patient:edit",
    "patient:delete",

    "appointment:add",
    "appointment:edit",
    "appointment:complete",
    "appointment:cancel",
    "appointment:delete",

    "prescription:add",
    "prescription:edit",
    "prescription:delete",

    "lab-report:add",
    "lab-report:edit",
    "lab-report:collect",
    "lab-report:complete",
    "lab-report:delete",
  ],

  Doctor: [
    "appointment:complete",

    "prescription:add",
    "prescription:edit",

    "lab-report:add",
    "lab-report:edit",
  ],

  Staff: [
    "patient:add",
    "patient:edit",

    "appointment:add",
    "appointment:edit",
    "appointment:cancel",

    "lab-report:collect",
    "lab-report:complete",
  ],
};

export const hasPermission = (
  role: UserRole | undefined,
  permission: Permission,
) => {
  if (!role) return false;

  return permissions[role].includes(permission);
};

export const routePermissions: Record<string, UserRole[]> = {
  "/dashboard": ["Admin", "Doctor", "Staff"],
  "/patients": ["Admin", "Doctor", "Staff"],
  "/appointments": ["Admin", "Doctor", "Staff"],

  "/prescriptions": ["Admin", "Doctor"],
  "/lab-reports": ["Admin", "Doctor", "Staff"],

  "/doctors": ["Admin"],
  "/departments": ["Admin"],
  "/staff": ["Admin"],
  "/settings": ["Admin"],
};
