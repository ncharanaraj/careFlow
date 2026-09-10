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

const mainMenu = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Patients", icon: Users },
  { label: "Appointments", icon: CalendarDays },
  { label: "Prescriptions", icon: Pill },
  { label: "Lab Reports", icon: FileText },
];

const managementMenu = [
  { label: "Doctors", icon: Stethoscope },
  { label: "Departments", icon: Building2 },
  { label: "Staff", icon: UserCog },
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
        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Main
          </p>

          <div className="space-y-1">
            {mainMenu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    item.label === "Dashboard"
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Management
          </p>

          <div className="space-y-1">
            {managementMenu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}