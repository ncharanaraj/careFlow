import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import PlaceholderPage from "@/pages/PlaceholderPage";
import Patients from "@/pages/Patients";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import Departments from "./pages/Departments";
import Staff from "./pages/Staff";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/patients" element={<Patients />} />

          <Route path="/appointments" element={<Appointments />} />

          <Route
            path="/prescriptions"
            element={
              <PlaceholderPage
                title="Prescriptions"
                description="Manage patient prescriptions."
              />
            }
          />

          <Route
            path="/lab-reports"
            element={
              <PlaceholderPage
                title="Lab Reports"
                description="View and manage laboratory reports."
              />
            }
          />

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

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
