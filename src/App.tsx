import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleRoute from "@/components/auth/RoleRoute";
import LoadingState from "@/components/shared/LoadingState";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Patients = lazy(() => import("@/pages/Patients"));
const Appointments = lazy(() => import("@/pages/Appointments"));
const Prescriptions = lazy(() => import("@/pages/Prescriptions"));
const LabReports = lazy(() => import("@/pages/LabReports"));
const Doctors = lazy(() => import("@/pages/Doctors"));
const Departments = lazy(() => import("@/pages/Departments"));
const Staff = lazy(() => import("@/pages/Staff"));
const PlaceholderPage = lazy(() => import("@/pages/PlaceholderPage"));
const AccessDenied = lazy(() => import("@/pages/AccessDenied"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <LoadingState />
          </div>
        }
      >
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/access-denied" element={<AccessDenied />} />

            <Route element={<DashboardLayout />}>
              {/* Admin only */}
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

              {/* Admin + Doctor */}
              <Route element={<RoleRoute allowedRoles={["Admin", "Doctor"]} />}>
                <Route path="/prescriptions" element={<Prescriptions />} />
              </Route>

              {/* All authenticated users */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />

              <Route path="/lab-reports" element={<LabReports />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
