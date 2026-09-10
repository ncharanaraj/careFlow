import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          placeholder="Search..."
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-5 w-5" />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-medium">
            CN
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              Charan
            </p>

            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}