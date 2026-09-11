import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store/store";
import {
  fetchAppointmentData,
  addAppointment,
  editAppointment,
  removeAppointment,
} from "@/store/appointmentsSlice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal } from "lucide-react";

import AddAppointmentDialog from "@/components/appointments/AddAppointmentDialog";
import type { AppointmentFormData } from "@/components/appointments/AddAppointmentDialog";
import AppointmentDetailsDialog from "@/components/appointments/AppointmentDetailsDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Appointment } from "@/types/appointment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Appointments() {
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentToEdit, setAppointmentToEdit] =
    useState<Appointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [appointmentToView, setAppointmentToView] =
    useState<Appointment | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const { appointments, patients, doctors, departments, loading, error } =
    useSelector((state: RootState) => state.appointments);

  useEffect(() => {
    dispatch(fetchAppointmentData());
  }, [dispatch]);

  const getPatientName = (id: number | string) =>
    patients.find((patient) => String(patient.id) === String(id))?.name ??
    "Unknown";

  const getDoctorName = (id: string) =>
    doctors.find((doctor) => String(doctor.id) === String(id))?.name ??
    "Unknown";

  const getDepartmentName = (id: string) =>
    departments.find((department) => String(department.id) === String(id))
      ?.name ?? "Unknown";

  const handleAppointmentAdded = async (data: AppointmentFormData) => {
    await dispatch(
      addAppointment({
        patientId: data.patientId,
        doctorId: data.doctorId,
        departmentId: data.departmentId,
        appointmentDate: data.appointmentDate,
        timeSlot: data.timeSlot,
        status: "Scheduled",
        createdAt: new Date().toISOString(),
      }),
    );
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const searchTerm = search.trim().toLowerCase();

    const patientName = getPatientName(appointment.patientId).toLowerCase();
    const doctorName = getDoctorName(appointment.doctorId).toLowerCase();

    const matchesSearch =
      patientName.includes(searchTerm) || doctorName.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "all" ||
      String(appointment.departmentId) === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleEditAppointment = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setEditOpen(true);
  };

  const handleAppointmentUpdated = async (data: AppointmentFormData) => {
    if (!appointmentToEdit) return;

    await dispatch(
      editAppointment({
        id: appointmentToEdit.id,
        appointment: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          appointmentDate: data.appointmentDate,
          timeSlot: data.timeSlot,
          status: appointmentToEdit.status,
          createdAt: appointmentToEdit.createdAt,
        },
      }),
    );

    setAppointmentToEdit(null);
    setEditOpen(false);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    await dispatch(
      editAppointment({
        id: appointment.id,
        appointment: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          departmentId: appointment.departmentId,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          status: "Cancelled",
          createdAt: appointment.createdAt,
        },
      }),
    );
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    await dispatch(removeAppointment(appointmentToDelete.id));

    setAppointmentToDelete(null);
    setDeleteOpen(false);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setAppointmentToView(appointment);
    setViewOpen(true);
  };

  const appointmentsPerPage = 3;

  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage,
  );

  const startIndex = (currentPage - 1) * appointmentsPerPage;

  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage hospital appointments.
          </p>
        </div>

        <Button onClick={() => setAddAppointmentOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Appointments</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading appointments...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  placeholder="Search patient or doctor..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="md:max-w-sm"
                />

                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter((value ?? "all") as string);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  items={[
                    { label: "All Departments", value: "all" },
                    ...departments.map((department) => ({
                      label: department.name,
                      value: String(department.id),
                    })),
                  ]}
                  value={departmentFilter}
                  onValueChange={(value) => {
                    setDepartmentFilter((value ?? "all") as string);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-56">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>

                    {departments.map((department) => (
                      <SelectItem
                        key={department.id}
                        value={String(department.id)}
                      >
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-slate-500">Patient</th>

                    <th className="pb-3 font-medium text-slate-500">Doctor</th>

                    <th className="pb-3 font-medium text-slate-500">
                      Department
                    </th>

                    <th className="pb-3 font-medium text-slate-500">Date</th>

                    <th className="pb-3 font-medium text-slate-500">Time</th>

                    <th className="pb-3 font-medium text-slate-500">Status</th>

                    <th className="pb-3 text-right font-medium text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAppointments.length > 0 ? (
                    paginatedAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 font-medium text-slate-900">
                          {getPatientName(appointment.patientId)}
                        </td>

                        <td className="py-4 text-slate-600">
                          {getDoctorName(appointment.doctorId)}
                        </td>

                        <td className="py-4 text-slate-600">
                          {getDepartmentName(appointment.departmentId)}
                        </td>

                        <td className="py-4 text-slate-600">
                          {appointment.appointmentDate}
                        </td>

                        <td className="py-4 text-slate-600">
                          {appointment.timeSlot}
                        </td>

                        <td className="py-4">
                          <Badge
                            variant={
                              appointment.status === "Cancelled"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </td>

                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewAppointment(appointment)
                                }
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditAppointment(appointment)
                                }
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCancelAppointment(appointment)
                                }
                                disabled={appointment.status === "Cancelled"}
                              >
                                Cancel Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(appointment)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filteredAppointments.length > 0 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + appointmentsPerPage,
                      filteredAppointments.length,
                    )}{" "}
                    of {filteredAppointments.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <AddAppointmentDialog
        open={addAppointmentOpen}
        onOpenChange={setAddAppointmentOpen}
        patients={patients}
        doctors={doctors}
        departments={departments}
        onAppointmentAdded={handleAppointmentAdded}
      />
      <AppointmentDetailsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        appointment={appointmentToView}
        patients={patients}
        doctors={doctors}
        departments={departments}
      />
      <AddAppointmentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patients={patients}
        doctors={doctors}
        departments={departments}
        onAppointmentAdded={handleAppointmentUpdated}
        appointment={appointmentToEdit}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appointment?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete this appointment. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteAppointment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
