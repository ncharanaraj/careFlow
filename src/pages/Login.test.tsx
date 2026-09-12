import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

import Login from "@/pages/Login";
import authReducer from "@/store/authSlice";
import * as authService from "@/services/authService";

vi.mock("@/services/authService", () => ({
  loginUser: vi.fn(),
}));

function renderLogin() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        loading: false,
        error: null,
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
}

describe("Login", () => {
  it("shows validation errors for empty form", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    );

    expect(
      await screen.findByText("Enter a valid email address"),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Password must be at least 6 characters"),
    ).toBeInTheDocument();
  });

  it("shows an error for invalid credentials", async () => {
    const user = userEvent.setup();

    vi.mocked(authService.loginUser).mockRejectedValue(
      new Error("Invalid email or password"),
    );

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "wrong@careflow.com");

    await user.type(screen.getByLabelText(/password/i), "wrong123");

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    );

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });

  it("redirects to dashboard after successful login", async () => {
    const user = userEvent.setup();

    vi.mocked(authService.loginUser).mockResolvedValue({
      id: "user-1",
      name: "Charan",
      email: "admin@careflow.com",
      role: "Admin",
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "admin@careflow.com");

    await user.type(screen.getByLabelText(/password/i), "admin123");

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    );

    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
  });
});
