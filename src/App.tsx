import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Redirect "/" to dashboard */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;