import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import PlaceholderPage from "@/pages/PlaceholderPage";
import Patients from "@/pages/Patients";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";

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

          <Route
            path="/departments"
            element={
              <PlaceholderPage
                title="Departments"
                description="Manage hospital departments."
              />
            }
          />

          <Route
            path="/staff"
            element={
              <PlaceholderPage
                title="Staff"
                description="Manage hospital staff."
              />
            }
          />

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
