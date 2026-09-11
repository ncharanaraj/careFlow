import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, CalendarDays, Stethoscope, UserCog } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";

import { fetchPatients } from "@/store/patientsSlice";
import { fetchAppointmentData } from "@/store/appointmentsSlice";
import { fetchDoctorData } from "@/store/doctorsSlice";
import { fetchStaffData } from "@/store/staffSlice";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const patients = useSelector((state: RootState) => state.patients.patients);

  const appointments = useSelector(
    (state: RootState) => state.appointments.appointments,
  );

  const doctors = useSelector((state: RootState) => state.doctors.doctors);

  const staff = useSelector((state: RootState) => state.staff.staff);

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointmentData());
    dispatch(fetchDoctorData());
    dispatch(fetchStaffData());
  }, [dispatch]);

  const activeDoctors = doctors.filter(
    (doctor) => doctor.status === "Active",
  ).length;

  const activeStaff = staff.filter(
    (member) => member.status === "Active",
  ).length;

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
    },
    {
      title: "Appointments",
      value: appointments.length,
      icon: CalendarDays,
    },
    {
      title: "Active Doctors",
      value: activeDoctors,
      icon: Stethoscope,
    },
    {
      title: "Active Staff",
      value: activeStaff,
      icon: UserCog,
    },
  ];

  const today = format(new Date(), "yyyy-MM-dd");

  const todaysAppointments = appointments.filter(
    (appointment) => appointment.appointmentDate === today,
  );

  const getPatientName = (patientId: string | number) => {
    return (
      patients.find((patient) => String(patient.id) === String(patientId))
        ?.name ?? "Unknown Patient"
    );
  };

  const getDoctorName = (doctorId: string | number) => {
    return (
      doctors.find((doctor) => String(doctor.id) === String(doctorId))?.name ??
      "Unknown Doctor"
    );
  };

  const recentPatients = [...patients]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const scheduledCount = appointments.filter(
    (appointment) => appointment.status === "Scheduled",
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed",
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "Cancelled",
  ).length;

  const patientsLoading = useSelector(
    (state: RootState) => state.patients.loading,
  );

  const appointmentsLoading = useSelector(
    (state: RootState) => state.appointments.loading,
  );

  const doctorsLoading = useSelector(
    (state: RootState) => state.doctors.loading,
  );

  const staffLoading = useSelector((state: RootState) => state.staff.loading);

  const dashboardLoading =
    patientsLoading || appointmentsLoading || doctorsLoading || staffLoading;

  const patientsError = useSelector((state: RootState) => state.patients.error);

  const appointmentsError = useSelector(
    (state: RootState) => state.appointments.error,
  );

  const doctorsError = useSelector((state: RootState) => state.doctors.error);

  const staffError = useSelector((state: RootState) => state.staff.error);

  const dashboardError =
    patientsError || appointmentsError || doctorsError || staffError;

  const handleDashboardRetry = () => {
    dispatch(fetchPatients());
    dispatch(fetchAppointmentData());
    dispatch(fetchDoctorData());
    dispatch(fetchStaffData());
  };

  if (dashboardLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (dashboardError) {
    return (
      <ErrorState message={dashboardError} onRetry={handleDashboardRetry} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of hospital operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>

                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardContent className="p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Today's Appointments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Appointments scheduled for today.
            </p>
          </div>

          {todaysAppointments.length > 0 ? (
            <div className="space-y-3">
              {todaysAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {getPatientName(appointment.patientId)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {getDoctorName(appointment.doctorId)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">
                      {appointment.timeSlot}
                    </span>

                    <Badge
                      variant={
                        appointment.status === "Completed"
                          ? "secondary"
                          : appointment.status === "Cancelled"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center">
              <p className="text-sm text-slate-500">
                No appointments scheduled for today.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Patients
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently registered patients.
              </p>
            </div>

            {recentPatients.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {patient.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {patient.age} years • {patient.gender}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={
                          patient.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {patient.status}
                      </Badge>

                      <p className="mt-1 text-xs text-slate-400">
                        {format(new Date(patient.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500">No patients available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Summary */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Appointment Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current appointment status overview.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm text-slate-500">Scheduled</p>

                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {scheduledCount}
                  </p>
                </div>

                <Badge>Scheduled</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm text-slate-500">Completed</p>

                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {completedCount}
                  </p>
                </div>

                <Badge variant="secondary">Completed</Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm text-slate-500">Cancelled</p>

                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {cancelledCount}
                  </p>
                </div>

                <Badge variant="destructive">Cancelled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
