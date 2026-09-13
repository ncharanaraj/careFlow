import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import type { LabReport, LabReportStatus } from "@/types/labReport";

import {
  clearLabReportMutationError,
  editLabReport,
  fetchLabReports,
  removeLabReport,
} from "@/store/labReportsSlice";

import { fetchPatients } from "@/store/patientsSlice";
import { fetchDoctorData } from "@/store/doctorsSlice";
import { fetchAppointmentData } from "@/store/appointmentsSlice";

import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import AddLabReportDialog from "@/components/lab-reports/AddLabReportDialog";
import LabReportDetailsDialog from "@/components/lab-reports/LabReportDetailsDialog";
import CompleteLabReportDialog from "@/components/lab-reports/CompleteLabReportDialog";
import { hasPermission } from "@/config/permissions";
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

export default function LabReports() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [selectedLabReport, setSelectedLabReport] = useState<LabReport | null>(
    null,
  );
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const [reportToComplete, setReportToComplete] = useState<LabReport | null>(
    null,
  );
  const [reportToEdit, setReportToEdit] = useState<LabReport | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [reportToDelete, setReportToDelete] = useState<LabReport | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { labReports, loading, error, deleting } = useSelector(
    (state: RootState) => state.labReports,
  );

  const patients = useSelector((state: RootState) => state.patients.patients);

  const doctors = useSelector((state: RootState) => state.doctors.doctors);

  const user = useSelector((state: RootState) => state.auth.user);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LabReportStatus | "All">(
    "All",
  );

  const [currentPage, setCurrentPage] = useState(1);

  const reportsPerPage = 5;

  useEffect(() => {
    dispatch(fetchLabReports());
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

  const visibleLabReports = (
    user?.role === "Doctor"
      ? labReports.filter(
          (report) => String(report.doctorId) === String(user.doctorId),
        )
      : labReports
  )
    .slice()
    .sort(
      (a, b) =>
        new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime(),
    );

  const filteredLabReports = visibleLabReports.filter((report) => {
    const searchTerm = search.trim().toLowerCase();

    const patientName = getPatientName(report.patientId).toLowerCase();

    const doctorName = getDoctorName(report.doctorId).toLowerCase();

    const matchesSearch =
      patientName.includes(searchTerm) ||
      doctorName.includes(searchTerm) ||
      report.tests.some(
        (test) =>
          test.testName.toLowerCase().includes(searchTerm) ||
          test.category.toLowerCase().includes(searchTerm),
      );

    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLabReports.length / reportsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * reportsPerPage;

  const paginatedLabReports = filteredLabReports.slice(
    startIndex,
    startIndex + reportsPerPage,
  );

  const getStatusVariant = (status: LabReportStatus) => {
    switch (status) {
      case "Completed":
        return "default";

      case "Sample Collected":
        return "secondary";

      case "Ordered":
        return "outline";

      default:
        return "outline";
    }
  };

  const handleAddLabReport = () => {
    dispatch(clearLabReportMutationError());

    setAddDialogOpen(true);
  };

  const handleViewLabReport = (report: LabReport) => {
    setSelectedLabReport(report);
    setViewDialogOpen(true);
  };

  const handleSampleCollected = async (report: LabReport) => {
    if (!canCollectSample || report.status !== "Ordered") {
      return;
    }

    dispatch(clearLabReportMutationError());

    try {
      await dispatch(
        editLabReport({
          id: report.id,
          labReport: {
            patientId: report.patientId,
            appointmentId: report.appointmentId,
            doctorId: report.doctorId,
            status: "Sample Collected",
            tests: report.tests,
            notes: report.notes,
            orderedAt: report.orderedAt,
            collectedAt: new Date().toISOString(),
            completedAt: report.completedAt,
          },
        }),
      ).unwrap();
    } catch {
      // Redux handles mutationError
    }
  };

  const handleCompleteLabReport = (report: LabReport) => {
    if (!canCompleteLabReport || report.status !== "Sample Collected") {
      return;
    }

    setReportToComplete(report);
    setCompleteDialogOpen(true);
  };

  const canAddLabReport = hasPermission(user?.role, "lab-report:add");

  const canEditLabReport = hasPermission(user?.role, "lab-report:edit");

  const canCollectSample = hasPermission(user?.role, "lab-report:collect");

  const canCompleteLabReport = hasPermission(user?.role, "lab-report:complete");

  const canDeleteLabReport = hasPermission(user?.role, "lab-report:delete");

  const canAccessLabReport = (report: LabReport) => {
    if (user?.role !== "Doctor") {
      return true;
    }

    return String(report.doctorId) === String(user.doctorId);
  };

  const handleEditLabReport = (report: LabReport) => {
    if (
      !canEditLabReport ||
      !canAccessLabReport(report) ||
      report.status !== "Ordered"
    ) {
      return;
    }

    dispatch(clearLabReportMutationError());

    setReportToEdit(report);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (report: LabReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleLabReportsRetry = () => {
    dispatch(fetchLabReports());
    dispatch(fetchPatients());
    dispatch(fetchDoctorData());
    dispatch(fetchAppointmentData());
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Reports"
        description="Manage patient lab tests and diagnostic reports."
        action={
          canAddLabReport ? (
            <Button onClick={handleAddLabReport}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lab Report
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Lab Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search reports..."
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter((value ?? "All") as LabReportStatus | "All");

                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>

                  <SelectItem value="Ordered">Ordered</SelectItem>

                  <SelectItem value="Sample Collected">
                    Sample Collected
                  </SelectItem>

                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && <LoadingState message="Loading lab reports..." />}

          {!loading && error && (
            <ErrorState message={error} onRetry={handleLabReportsRetry} />
          )}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>

                      <TableHead>Doctor</TableHead>

                      <TableHead>Tests</TableHead>

                      <TableHead>Status</TableHead>

                      <TableHead>Ordered On</TableHead>

                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedLabReports.length > 0 ? (
                      paginatedLabReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="py-4 font-medium text-slate-800">
                            {getPatientName(report.patientId)}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {getDoctorName(report.doctorId)}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {report.tests.length} test
                            {report.tests.length !== 1 ? "s" : ""}
                          </TableCell>

                          <TableCell className="py-4">
                            <Badge variant={getStatusVariant(report.status)}>
                              {report.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {new Date(report.orderedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </TableCell>

                          <TableCell className="py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewLabReport(report)}
                                >
                                  View
                                </DropdownMenuItem>

                                {canCollectSample &&
                                  report.status === "Ordered" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleSampleCollected(report)
                                      }
                                    >
                                      Mark Sample Collected
                                    </DropdownMenuItem>
                                  )}

                                {canCompleteLabReport &&
                                  report.status === "Sample Collected" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleCompleteLabReport(report)
                                      }
                                    >
                                      Enter Results
                                    </DropdownMenuItem>
                                  )}

                                {canEditLabReport &&
                                  report.status === "Ordered" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditLabReport(report)
                                      }
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                  )}

                                {canDeleteLabReport && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteClick(report)}
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
                          {search || statusFilter !== "All"
                            ? "No lab reports match your search or filters."
                            : "No lab reports available yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredLabReports.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row items-center justify-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + reportsPerPage,
                      filteredLabReports.length,
                    )}{" "}
                    of {filteredLabReports.length}
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
      <AddLabReportDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
      <LabReportDetailsDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);

          if (!open) {
            setSelectedLabReport(null);
          }
        }}
        labReport={selectedLabReport}
        patients={patients}
        doctors={doctors}
      />
      <CompleteLabReportDialog
        open={completeDialogOpen}
        onOpenChange={(open) => {
          setCompleteDialogOpen(open);

          if (!open) {
            setReportToComplete(null);
          }
        }}
        labReport={reportToComplete}
      />
      <AddLabReportDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);

          if (!open) {
            setReportToEdit(null);
          }
        }}
        labReport={reportToEdit}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lab Report?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The lab report and its test data
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!reportToDelete) return;

                try {
                  await dispatch(removeLabReport(reportToDelete.id)).unwrap();

                  setReportToDelete(null);
                  setDeleteDialogOpen(false);
                } catch {
                  // Redux handles error
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
