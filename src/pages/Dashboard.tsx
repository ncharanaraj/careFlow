import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening in your hospital today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Total Patients</p>
            <p className="mt-2 text-3xl font-semibold">1,248</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Appointments</p>
            <p className="mt-2 text-3xl font-semibold">24</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Doctors</p>
            <p className="mt-2 text-3xl font-semibold">18</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">Pending Reports</p>
            <p className="mt-2 text-3xl font-semibold">12</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}