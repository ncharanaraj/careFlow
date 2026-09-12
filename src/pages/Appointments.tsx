import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "@/store/store";
import {
  fetchAppointmentData,
  addAppointment,
  editAppointment,
  removeAppointment,
  clearAppointmentMutationError,
} from "@/store/appointmentsSlice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Search } from "lucide-react";

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
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { hasPermission } from "@/config/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";

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
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] =
    useState<Appointment | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);

  const {
    appointments,
    patients,
    doctors,
    departments,
    loading,
    error,
    saving,
    deleting,
    mutationError,
  } = useSelector((state: RootState) => state.appointments);

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
    ).unwrap();
  };

  const handleAddAppointment = () => {
    dispatch(clearAppointmentMutationError());
    setAddAppointmentOpen(true);
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
    dispatch(clearAppointmentMutationError());
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
    ).unwrap();

    // setAppointmentToEdit(null);
    // setEditOpen(false);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      await dispatch(
        editAppointment({
          id: appointmentToCancel.id,
          appointment: {
            ...appointmentToCancel,
            status: "Cancelled",
          },
        }),
      ).unwrap();

      setAppointmentToCancel(null);
      setCancelOpen(false);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const handleDeleteClick = (appointment: Appointment) => {
    dispatch(clearAppointmentMutationError());
    setAppointmentToDelete(appointment);
    setDeleteOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    await dispatch(removeAppointment(appointmentToDelete.id)).unwrap();

    setAppointmentToDelete(null);
    setDeleteOpen(false);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setAppointmentToView(appointment);
    setViewOpen(true);
  };

  const handleCompleteClick = (appointment: Appointment) => {
    dispatch(clearAppointmentMutationError());

    setAppointmentToComplete(appointment);
    setCompleteOpen(true);
  };

  const confirmCompleteAppointment = async () => {
    if (!appointmentToComplete) return;

    try {
      await dispatch(
        editAppointment({
          id: appointmentToComplete.id,
          appointment: {
            ...appointmentToComplete,
            status: "Completed",
          },
        }),
      ).unwrap();

      setAppointmentToComplete(null);
      setCompleteOpen(false);
    } catch (error) {
      console.error("Failed to complete appointment:", error);
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    dispatch(clearAppointmentMutationError());

    setAppointmentToCancel(appointment);
    setCancelOpen(true);
  };

  const appointmentsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAppointments.length / appointmentsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * appointmentsPerPage;

  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + appointmentsPerPage,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const canAddAppointment = hasPermission(user?.role, "appointment:add");

  const canEditAppointment = hasPermission(user?.role, "appointment:edit");

  const canCompleteAppointment = hasPermission(
    user?.role,
    "appointment:complete",
  );

  const canCancelAppointment = hasPermission(user?.role, "appointment:cancel");

  const canDeleteAppointment = hasPermission(user?.role, "appointment:delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage hospital appointments."
        action={
          canAddAppointment && (
            <Button onClick={handleAddAppointment}>
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          )
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Appointments</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <LoadingState message="Loading appointments..." />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => dispatch(fetchAppointmentData())}
            />
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search patient or doctor..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>

                <div className="w-full lg:w-56">
                  <Select
                    items={[
                      {
                        label: "All Status",
                        value: "all",
                      },
                      {
                        label: "Scheduled",
                        value: "Scheduled",
                      },
                      {
                        label: "Completed",
                        value: "Completed",
                      },
                      {
                        label: "Cancelled",
                        value: "Cancelled",
                      },
                    ]}
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter((value ?? "all") as string);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full lg:w-44">
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
                    <SelectTrigger className="w-full">
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
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedAppointments.length > 0 ? (
                      paginatedAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="py-4 font-medium">
                            {getPatientName(appointment.patientId)}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {getDoctorName(appointment.doctorId)}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {getDepartmentName(appointment.departmentId)}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {appointment.appointmentDate}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {appointment.timeSlot}
                          </TableCell>

                          <TableCell className="py-4">
                            <Badge
                              variant={
                                appointment.status === "Cancelled"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 text-right">
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

                                {canEditAppointment && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditAppointment(appointment)
                                    }
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                )}

                                {canCompleteAppointment &&
                                  appointment.status === "Scheduled" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleCompleteClick(appointment)
                                      }
                                    >
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  )}

                                {canCancelAppointment &&
                                  appointment.status === "Scheduled" && (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() =>
                                        handleCancelClick(appointment)
                                      }
                                    >
                                      Cancel Appointment
                                    </DropdownMenuItem>
                                  )}

                                {canDeleteAppointment && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleDeleteClick(appointment)
                                    }
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-slate-500"
                        >
                          No appointments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredAppointments.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + appointmentsPerPage,
                      filteredAppointments.length,
                    )}{" "}
                    of {filteredAppointments.length}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage(safeCurrentPage - 1)}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-slate-600">
                      Page {safeCurrentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage(safeCurrentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
        saving={saving}
        mutationError={mutationError}
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
        saving={saving}
        mutationError={mutationError}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete appointment?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete this appointment. This action cannot
              be undone.
            </AlertDialogDescription>
            {mutationError && (
              <p className="mt-3 text-sm text-red-600">{mutationError}</p>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteAppointment}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This will change
              the appointment status to Cancelled.
            </AlertDialogDescription>

            {mutationError && (
              <p className="mt-3 text-sm text-red-600">{mutationError}</p>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              Keep Appointment
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmCancelAppointment}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? "Cancelling..." : "Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete appointment?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to mark this appointment as completed? The
              appointment status will be changed to Completed.
            </AlertDialogDescription>

            {mutationError && (
              <p className="mt-3 text-sm text-red-600">{mutationError}</p>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmCompleteAppointment}
              disabled={saving}
            >
              {saving ? "Completing..." : "Mark as Completed"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
