import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import type { Prescription } from "@/types/prescription";

import {
  addPrescription,
  clearPrescriptionMutationError,
  editPrescription,
  fetchPrescriptions,
  removePrescription,
} from "@/store/prescriptionsSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { fetchPatients } from "@/store/patientsSlice";
import { fetchDoctorData } from "@/store/doctorsSlice";
import type { PrescriptionFormData } from "@/components/prescriptions/AddPrescriptionDialog";
import AddPrescriptionDialog from "@/components/prescriptions/AddPrescriptionDialog";
import { fetchAppointmentData } from "@/store/appointmentsSlice";
import PrescriptionDetailsDialog from "@/components/prescriptions/PrescriptionDetailsDialog";
import { hasPermission } from "@/config/permissions";

export default function Prescriptions() {
  const dispatch = useDispatch<AppDispatch>();

  const { prescriptions, loading, error, deleting, mutationError, saving } =
    useSelector((state: RootState) => state.prescriptions);

  const patients = useSelector((state: RootState) => state.patients.patients);

  const doctors = useSelector((state: RootState) => state.doctors.doctors);

  const appointments = useSelector(
    (state: RootState) => state.appointments.appointments,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [prescriptionToDelete, setPrescriptionToDelete] =
    useState<Prescription | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [prescriptionToView, setPrescriptionToView] =
    useState<Prescription | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [prescriptionToEdit, setPrescriptionToEdit] =
    useState<Prescription | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPrescriptions());
    dispatch(fetchPatients());
    dispatch(fetchDoctorData());
    dispatch(fetchAppointmentData());
  }, [dispatch]);

  const getPatientName = (patientId: string | number) =>
    patients.find((patient) => String(patient.id) === String(patientId))
      ?.name ?? "Unknown";

  const getDoctorName = (doctorId: string | number) =>
    doctors.find((doctor) => String(doctor.id) === String(doctorId))?.name ??
    "Unknown";

  const visiblePrescriptions =
    user?.role === "Doctor"
      ? prescriptions.filter(
          (prescription) =>
            String(prescription.doctorId) === String(user.doctorId),
        )
      : prescriptions;

  const isDoctorOwnedAppointment = (
    appointmentId: string | number,
    patientId: string | number,
  ) => {
    if (user?.role !== "Doctor") {
      return true;
    }

    const appointment = appointments.find(
      (appointment) => String(appointment.id) === String(appointmentId),
    );

    if (!appointment) {
      return false;
    }

    return (
      String(appointment.doctorId) === String(user.doctorId) &&
      String(appointment.patientId) === String(patientId)
    );
  };

  const filteredPrescriptions = visiblePrescriptions.filter((prescription) => {
    const searchTerm = search.trim().toLowerCase();

    const patientName = getPatientName(prescription.patientId).toLowerCase();

    const doctorName = getDoctorName(prescription.doctorId).toLowerCase();

    return (
      patientName.includes(searchTerm) ||
      doctorName.includes(searchTerm) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm)
    );
  });

  const prescriptionsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPrescriptions.length / prescriptionsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * prescriptionsPerPage;

  const paginatedPrescriptions = filteredPrescriptions.slice(
    startIndex,
    startIndex + prescriptionsPerPage,
  );

  const handleDeleteClick = (prescription: Prescription) => {
    dispatch(clearPrescriptionMutationError());

    setPrescriptionToDelete(prescription);
    setDeleteOpen(true);
  };

  const handleDeletePrescription = async () => {
    if (!prescriptionToDelete) return;

    try {
      await dispatch(removePrescription(prescriptionToDelete.id)).unwrap();

      setPrescriptionToDelete(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete prescription:", error);
    }
  };

  const handleAddPrescription = () => {
    dispatch(clearPrescriptionMutationError());
    setAddOpen(true);
  };

  const handlePrescriptionAdded = async (data: PrescriptionFormData) => {
    if (
      user?.role === "Doctor" &&
      (!isDoctorOwnedAppointment(data.appointmentId, data.patientId) ||
        String(data.doctorId) !== String(user.doctorId))
    ) {
      throw new Error(
        "You can only create prescriptions for your own appointments.",
      );
    }

    const alreadyExists = prescriptions.some(
      (prescription) =>
        String(prescription.appointmentId) === String(data.appointmentId),
    );

    if (alreadyExists) {
      throw new Error("A prescription already exists for this appointment.");
    }

    await dispatch(
      addPrescription({
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis,
        medicines: data.medicines.map((medicine) => ({
          id: crypto.randomUUID(),
          ...medicine,
        })),
        notes: data.notes,
        createdAt: new Date().toISOString(),
      }),
    ).unwrap();
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setPrescriptionToView(prescription);
    setViewOpen(true);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    if (
      user?.role === "Doctor" &&
      String(prescription.doctorId) !== String(user.doctorId)
    ) {
      return;
    }

    dispatch(clearPrescriptionMutationError());

    setPrescriptionToEdit(prescription);
    setEditOpen(true);
  };

  const handlePrescriptionUpdated = async (data: PrescriptionFormData) => {
    if (!prescriptionToEdit) return;

    if (
      user?.role === "Doctor" &&
      (String(prescriptionToEdit.doctorId) !== String(user.doctorId) ||
        !isDoctorOwnedAppointment(data.appointmentId, data.patientId) ||
        String(data.doctorId) !== String(user.doctorId))
    ) {
      throw new Error(
        "You can only edit prescriptions for your own appointments.",
      );
    }

    const duplicateAppointment = prescriptions.some(
      (prescription) =>
        String(prescription.id) !== String(prescriptionToEdit.id) &&
        String(prescription.appointmentId) === String(data.appointmentId),
    );

    if (duplicateAppointment) {
      throw new Error("A prescription already exists for this appointment.");
    }

    await dispatch(
      editPrescription({
        id: prescriptionToEdit.id,
        prescription: {
          patientId: prescriptionToEdit.patientId,
          appointmentId: prescriptionToEdit.appointmentId,
          doctorId: prescriptionToEdit.doctorId,
          diagnosis: data.diagnosis,

          medicines: data.medicines.map((medicine) => ({
            id: medicine.id ?? crypto.randomUUID(),
            medicineName: medicine.medicineName,
            dosage: medicine.dosage,
            frequency: medicine.frequency,
            duration: medicine.duration,
            instructions: medicine.instructions,
          })),

          notes: data.notes,

          // Preserve original creation date
          createdAt: prescriptionToEdit.createdAt,
        },
      }),
    ).unwrap();
  };

  const canAddPrescription = hasPermission(user?.role, "prescription:add");

  const canEditPrescription = hasPermission(user?.role, "prescription:edit");

  const canDeletePrescription = hasPermission(
    user?.role,
    "prescription:delete",
  );

  const handlePrescriptionsRetry = () => {
    dispatch(fetchPrescriptions());
    dispatch(fetchPatients());
    dispatch(fetchDoctorData());
    dispatch(fetchAppointmentData());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        description="Manage patient prescriptions and medication instructions."
        action={
          canAddPrescription ? (
            <Button onClick={handleAddPrescription}>
              <Plus className="mr-2 h-4 w-4" />
              Add Prescription
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Prescriptions</CardTitle>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search prescriptions..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && <LoadingState message="Loading prescriptions..." />}

          {!loading && error && (
            <ErrorState message={error} onRetry={handlePrescriptionsRetry} />
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Medicines</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedPrescriptions.length > 0 ? (
                      paginatedPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="py-4 font-medium text-slate-800">
                            {getPatientName(prescription.patientId)}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {getDoctorName(prescription.doctorId)}
                          </TableCell>

                          <TableCell className="max-w-64 py-4 text-slate-600">
                            {prescription.diagnosis}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {prescription.medicines.length} medicine
                            {prescription.medicines.length !== 1 ? "s" : ""}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {new Date(
                              prescription.createdAt,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>

                          <TableCell className="py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewPrescription(prescription)
                                  }
                                >
                                  View
                                </DropdownMenuItem>

                                {canEditPrescription && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditPrescription(prescription)
                                    }
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                )}

                                {canDeletePrescription && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleDeleteClick(prescription)
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
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={6}
                          className="h-32 text-center text-slate-500"
                        >
                          {search
                            ? "No prescriptions match your search."
                            : "No prescriptions available yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredPrescriptions.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row items-center justify-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + prescriptionsPerPage,
                      filteredPrescriptions.length,
                    )}{" "}
                    of {filteredPrescriptions.length}
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prescription?</AlertDialogTitle>

            <AlertDialogDescription>
              This prescription will be permanently deleted. This action cannot
              be undone.
              {mutationError && (
                <p className="mt-3 text-sm text-red-600">{mutationError}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeletePrescription}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddPrescriptionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        patients={patients}
        appointments={appointments}
        doctors={doctors}
        prescriptions={prescriptions}
        prescription={null}
        currentUser={user}
        onPrescriptionAdded={handlePrescriptionAdded}
        saving={saving}
        mutationError={mutationError}
      />

      <PrescriptionDetailsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        prescription={prescriptionToView}
        patients={patients}
        doctors={doctors}
        appointments={appointments}
      />

      <AddPrescriptionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patients={patients}
        appointments={appointments}
        doctors={doctors}
        prescriptions={prescriptions}
        prescription={prescriptionToEdit}
        currentUser={user}
        onPrescriptionAdded={handlePrescriptionUpdated}
        saving={saving}
        mutationError={mutationError}
      />
    </div>
  );
}
