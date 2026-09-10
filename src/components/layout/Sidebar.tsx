import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Pill,
  FileText,
  Stethoscope,
  Building2,
  UserCog,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const mainMenu = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Patients", icon: Users, path: "/patients" },
  { label: "Appointments", icon: CalendarDays, path: "/appointments" },
  { label: "Prescriptions", icon: Pill, path: "/prescriptions" },
  { label: "Lab Reports", icon: FileText, path: "/lab-reports" },
];

const managementMenu = [
  { label: "Doctors", icon: Stethoscope, path: "/doctors" },
  { label: "Departments", icon: Building2, path: "/departments" },
  { label: "Staff", icon: UserCog, path: "/staff" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            C
          </div>

          <span className="text-lg font-semibold text-slate-900">
            CareFlow
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Main */}
        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Main
          </p>

          <div className="space-y-1">
            {mainMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-slate-100 font-medium text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Management */}
        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Management
          </p>

          <div className="space-y-1">
            {managementMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-slate-100 font-medium text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Settings */}
      <div className="border-t p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? "bg-slate-100 font-medium text-slate-900"
                : "text-slate-600 hover:bg-slate-50"
            }`
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}