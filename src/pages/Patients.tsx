import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import {
  fetchPatients,
  addPatient,
  editPatient,
  removePatient,
  clearPatientMutationError,
} from "@/store/patientsSlice";
import PatientDetailsDialog from "@/components/patients/PatientDetailsDialog";
import type { Patient } from "@/types/patients";
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
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
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
import { fetchAppointmentData } from "@/store/appointmentsSlice";
import { fetchPrescriptions } from "@/store/prescriptionsSlice";
import { fetchLabReports } from "@/store/labReportsSlice";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<
    string | null
  >(null);

  const { patients, loading, error, saving, deleting, mutationError } =
    useSelector((state: RootState) => state.patients);

  const { appointments } = useSelector(
    (state: RootState) => state.appointments,
  );

  const prescriptions = useSelector(
    (state: RootState) => state.prescriptions.prescriptions,
  );

  const labReports = useSelector(
    (state: RootState) => state.labReports.labReports,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointmentData());
    dispatch(fetchPrescriptions());
    dispatch(fetchLabReports());
  }, [dispatch]);

  const doctorPatientIds =
    user?.role === "Doctor"
      ? new Set(
          appointments
            .filter(
              (appointment) =>
                String(appointment.doctorId) === String(user.doctorId),
            )
            .map((appointment) => String(appointment.patientId)),
        )
      : null;

  const visiblePatients =
    user?.role === "Doctor"
      ? patients.filter((patient) => doctorPatientIds?.has(String(patient.id)))
      : patients;

  // Filter patients based on search term
  const filteredPatients = visiblePatients.filter((patient) => {
    const searchTerm = search.trim().toLowerCase();

    return (
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.phone.includes(searchTerm) ||
      patient.bloodGroup.toLowerCase().includes(searchTerm) ||
      patient.gender.toLowerCase() === searchTerm ||
      patient.status.toLowerCase() === searchTerm
    );
  });

  // Pagination logic
  const patientsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / patientsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * patientsPerPage;

  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + patientsPerPage,
  );

  const canAddPatient = hasPermission(user?.role, "patient:add");

  const canEditPatient = hasPermission(user?.role, "patient:edit");

  const canDeletePatient = hasPermission(user?.role, "patient:delete");

  // Handle adding a new patient
  const handlePatientAdded = async (data: {
    name: string;
    age: string;
    gender: string;
    phone: string;
    bloodGroup: string;
  }) => {
    if (!canAddPatient) {
      return;
    }

    await dispatch(
      addPatient({
        name: data.name,
        age: Number(data.age),
        gender: data.gender as "Male" | "Female",
        phone: data.phone,
        bloodGroup: data.bloodGroup,
        status: "Active",
        createdAt: new Date().toISOString(),
      }),
    ).unwrap();
  };

  const handleAddPatient = () => {
    dispatch(clearPatientMutationError());
    setAddPatientOpen(true);
  };

  // Handle viewing patient details
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailsOpen(true);
  };

  // Handle editing a patient
  const handleEditPatient = (patient: Patient) => {
    if (!canEditPatient) {
      return;
    }

    dispatch(clearPatientMutationError());

    setPatientToEdit(patient);
    setEditOpen(true);
  };

  // Handle updating a patient
  const handlePatientUpdated = async (data: {
    name: string;
    age: string;
    gender: string;
    phone: string;
    bloodGroup: string;
  }) => {
    if (!patientToEdit || !canEditPatient) {
      return;
    }

    await dispatch(
      editPatient({
        id: patientToEdit.id,
        patient: {
          name: data.name,
          age: Number(data.age),
          gender: data.gender as "Male" | "Female",
          phone: data.phone,
          bloodGroup: data.bloodGroup,
          status: patientToEdit.status,
          createdAt: patientToEdit.createdAt,
        },
      }),
    ).unwrap();
  };

  // Handle deleting a patient
  const handleDeletePatient = (patient: Patient) => {
    if (!canDeletePatient) {
      return;
    }

    dispatch(clearPatientMutationError());

    const linkedAppointments = appointments.filter(
      (appointment) => String(appointment.patientId) === String(patient.id),
    );

    const linkedPrescriptions = prescriptions.filter(
      (prescription) => String(prescription.patientId) === String(patient.id),
    );

    const linkedLabReports = labReports.filter(
      (report) => String(report.patientId) === String(patient.id),
    );

    const dependencies: string[] = [];

    if (linkedAppointments.length > 0) {
      dependencies.push(
        `${linkedAppointments.length} appointment${
          linkedAppointments.length !== 1 ? "s" : ""
        }`,
      );
    }

    if (linkedPrescriptions.length > 0) {
      dependencies.push(
        `${linkedPrescriptions.length} prescription${
          linkedPrescriptions.length !== 1 ? "s" : ""
        }`,
      );
    }

    if (linkedLabReports.length > 0) {
      dependencies.push(
        `${linkedLabReports.length} lab report${
          linkedLabReports.length !== 1 ? "s" : ""
        }`,
      );
    }

    if (dependencies.length > 0) {
      setPatientToDelete(patient);

      setDeleteBlockedMessage(
        `${patient.name} cannot be deleted because this patient is linked to ${dependencies.join(
          ", ",
        )}.`,
      );

      return;
    }

    setPatientToDelete(patient);
    setDeleteOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete || !canDeletePatient) {
      return;
    }

    try {
      await dispatch(removePatient(patientToDelete.id)).unwrap();

      setPatientToDelete(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete patient:", error);
    }
  };

  const handlePatientsRetry = () => {
    dispatch(fetchPatients());
    dispatch(fetchAppointmentData());
    dispatch(fetchPrescriptions());
    dispatch(fetchLabReports());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Patients"
        description="Manage patient records and information."
        action={
          canAddPatient && (
            <Button onClick={handleAddPatient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          )
        }
      />

      {/* Patient Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Patients</CardTitle>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder="Search patients..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading patients..." />
          ) : error ? (
            <ErrorState message={error} onRetry={handlePatientsRetry} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedPatients.length > 0 ? (
                      paginatedPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="py-4 font-medium">
                            {patient.name}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {patient.age}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {patient.gender}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {patient.phone}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {patient.bloodGroup}
                          </TableCell>

                          <TableCell className="py-4">
                            <Badge
                              variant={
                                patient.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {patient.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewPatient(patient)}
                                >
                                  View
                                </DropdownMenuItem>

                                {canEditPatient && (
                                  <DropdownMenuItem
                                    onClick={() => handleEditPatient(patient)}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                )}

                                {canDeletePatient && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeletePatient(patient)}
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
                          {search
                            ? "No patients match your search."
                            : "No patients available yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row items-center justify-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {filteredPatients.length === 0 ? 0 : startIndex + 1}–
                  {Math.min(
                    startIndex + patientsPerPage,
                    filteredPatients.length,
                  )}{" "}
                  of {filteredPatients.length}
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
            </>
          )}
        </CardContent>
      </Card>
      <AddPatientDialog
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        onPatientAdded={handlePatientAdded}
        saving={saving}
        mutationError={mutationError}
      />
      <PatientDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        patient={selectedPatient}
      />
      <AddPatientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onPatientAdded={handlePatientUpdated}
        patient={patientToEdit}
        saving={saving}
        mutationError={mutationError}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-900">
                {patientToDelete?.name}
              </span>
              ? This action cannot be undone.
              {mutationError && (
                <p className="mt-3 text-sm text-red-600">{mutationError}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDeletePatient}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteBlockedMessage)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteBlockedMessage(null);
            setPatientToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Patient Cannot Be Deleted</AlertDialogTitle>

            <AlertDialogDescription>
              {deleteBlockedMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setDeleteBlockedMessage(null);
                setPatientToDelete(null);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
