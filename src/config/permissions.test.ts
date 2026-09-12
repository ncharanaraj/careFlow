import { describe, expect, it } from "vitest";

import { hasPermission } from "@/config/permissions";

describe("hasPermission", () => {
  it("allows admin to delete patients", () => {
    expect(hasPermission("Admin", "patient:delete")).toBe(true);
  });

  it("does not allow doctor to delete patients", () => {
    expect(hasPermission("Doctor", "patient:delete")).toBe(false);
  });

  it("allows doctor to complete appointments", () => {
    expect(hasPermission("Doctor", "appointment:complete")).toBe(true);
  });

  it("allows staff to add patients", () => {
    expect(hasPermission("Staff", "patient:add")).toBe(true);
  });

  it("does not allow staff to delete appointments", () => {
    expect(hasPermission("Staff", "appointment:delete")).toBe(false);
  });

  it("returns false when role is undefined", () => {
    expect(hasPermission(undefined, "patient:add")).toBe(false);
  });
});
