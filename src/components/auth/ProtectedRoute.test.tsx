import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

import RoleRoute from "@/components/auth/RoleRoute";
import authReducer from "@/store/authSlice";
import type { UserRole } from "@/types/auth";

function renderWithRole(role: UserRole | null) {
  const user = role
    ? {
        id: "user-1",
        name: "Test User",
        email: "test@careflow.com",
        role,
      }
    : null;

  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user,
        loading: false,
        error: null,
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/doctors"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
            <Route path="/doctors" element={<div>Doctors Page</div>} />
          </Route>

          <Route path="/dashboard" element={<div>Dashboard Page</div>} />

          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("RoleRoute", () => {
  it("allows admin to access admin routes", () => {
    renderWithRole("Admin");

    expect(screen.getByText("Doctors Page")).toBeInTheDocument();
  });

  it("redirects doctor from admin routes", () => {
    renderWithRole("Doctor");

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("redirects staff from admin routes", () => {
    renderWithRole("Staff");

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    renderWithRole(null);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
