import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Appointments from "@/pages/Appointments";
import Doctors from "@/pages/Doctors";
import Departments from "@/pages/Departments";
import Staff from "@/pages/Staff";
import PlaceholderPage from "@/pages/PlaceholderPage";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
              <Route path="/doctors" element={<Doctors />} />

              <Route path="/departments" element={<Departments />} />

              <Route path="/staff" element={<Staff />} />

              <Route
                path="/settings"
                element={
                  <PlaceholderPage
                    title="Settings"
                    description="Manage your CareFlow settings."
                  />
                }
              />
            </Route>

            <Route element={<RoleRoute allowedRoles={["Admin", "Doctor"]} />}>
              <Route
                path="/prescriptions"
                element={
                  <PlaceholderPage
                    title="Prescriptions"
                    description="Manage patient prescriptions."
                  />
                }
              />
            </Route>

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/patients" element={<Patients />} />

            <Route path="/appointments" element={<Appointments />} />

            <Route
              path="/lab-reports"
              element={
                <PlaceholderPage
                  title="Lab Reports"
                  description="View and manage laboratory reports."
                />
              }
            />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
