import type { UserRole } from "@/types/auth";

type Permission =
  | "patient:add"
  | "patient:edit"
  | "patient:delete"
  | "appointment:add"
  | "appointment:edit"
  | "appointment:complete"
  | "appointment:cancel"
  | "appointment:delete";

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
  ],

  Doctor: ["appointment:complete"],

  Staff: [
    "patient:add",
    "patient:edit",

    "appointment:add",
    "appointment:edit",
    "appointment:cancel",
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
