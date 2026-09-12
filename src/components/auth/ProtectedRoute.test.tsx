import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/auth";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import authReducer from "@/store/authSlice";

function renderProtectedRoute(user: AuthUser | null) {
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
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login", () => {
    renderProtectedRoute(null);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("allows authenticated users to access protected routes", () => {
    renderProtectedRoute({
      id: "1",
      name: "Test User",
      email: "test@careflow.com",
      role: "Admin",
    });

    expect(screen.getByText("Protected Page")).toBeInTheDocument();
  });
});
