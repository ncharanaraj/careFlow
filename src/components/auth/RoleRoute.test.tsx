import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import RoleRoute from "@/components/auth/RoleRoute";
import authReducer from "@/store/authSlice";

function renderWithRole(role: "Admin" | "Doctor" | "Staff") {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: "1",
          name: "Test User",
          email: "test@careflow.com",
          role,
        },
        loading: false,
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/admin-page"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin-page" element={<div>Admin Page</div>} />
          </Route>

          <Route path="/access-denied" element={<div>Access Denied</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("RoleRoute", () => {
  it("allows user with permitted role", () => {
    renderWithRole("Admin");

    expect(screen.getByText("Admin Page")).toBeInTheDocument();
  });

  it("redirects unauthorized user to access denied", () => {
    renderWithRole("Doctor");

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("redirects staff when role is not allowed", () => {
    renderWithRole("Staff");

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });
});
