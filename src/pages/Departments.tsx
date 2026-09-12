import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import {
  editDepartment,
  fetchDepartments,
  removeDepartment,
  clearDepartmentMutationError,
  addDepartment,
} from "@/store/departmentsSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

import AddDepartmentDialog, {
  type DepartmentFormData,
} from "@/components/departments/AddDepartmentDialog";

import type { Department } from "@/types/appointment";
import DepartmentDetailsDialog from "@/components/departments/DepartmentDetailsDialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";

export default function Departments() {
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [departmentToView, setDepartmentToView] = useState<Department | null>(
    null,
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { departments, loading, error, saving, deleting, mutationError } =
    useSelector((state: RootState) => state.departments);

  const doctors = useSelector((state: RootState) => state.doctors.doctors);

  const appointments = useSelector(
    (state: RootState) => state.appointments.appointments,
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const filteredDepartments = departments.filter((department) => {
    const searchTerm = search.trim().toLowerCase();

    return (
      department.name.toLowerCase().includes(searchTerm) ||
      department.description.toLowerCase().includes(searchTerm)
    );
  });

  const handleAddDepartment = () => {
    dispatch(clearDepartmentMutationError());
    setAddDepartmentOpen(true);
  };

  const handleDepartmentAdded = async (data: DepartmentFormData) => {
    await dispatch(
      addDepartment({
        name: data.name,
        description: data.description,
        status: "Active",
        createdAt: new Date().toISOString(),
      }),
    ).unwrap();
  };

  const handleViewDepartment = (department: Department) => {
    setDepartmentToView(department);
    setViewOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    dispatch(clearDepartmentMutationError());
    setDepartmentToEdit(department);
    setEditOpen(true);
  };

  const handleDepartmentUpdated = async (data: DepartmentFormData) => {
    if (!departmentToEdit) return;

    await dispatch(
      editDepartment({
        id: departmentToEdit.id,
        department: {
          name: data.name,
          description: data.description,
          status: departmentToEdit.status,
          createdAt: departmentToEdit.createdAt,
        },
      }),
    ).unwrap();

    // setDepartmentToEdit(null);
    // setEditOpen(false);
  };

  const handleDeleteClick = (department: Department) => {
    dispatch(clearDepartmentMutationError());
    setDepartmentToDelete(department);
    setDeleteOpen(true);
  };

  const isDepartmentInUse = (department: Department) => {
    const usedByDoctor = doctors.some(
      (doctor) => String(doctor.departmentId) === String(department.id),
    );

    const usedByAppointment = appointments.some(
      (appointment) =>
        String(appointment.departmentId) === String(department.id),
    );

    return usedByDoctor || usedByAppointment;
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    if (isDepartmentInUse(departmentToDelete)) {
      return;
    }

    await dispatch(removeDepartment(departmentToDelete.id)).unwrap();

    setDepartmentToDelete(null);
    setDeleteOpen(false);
  };

  const departmentsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / departmentsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * departmentsPerPage;

  const paginatedDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + departmentsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Departments"
        description="Manage hospital departments and services."
        action={
          <Button onClick={handleAddDepartment}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        }
      />

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All Departments</CardTitle>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search departments..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <LoadingState message="Loading departments..." />}

          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => dispatch(fetchDepartments())}
            />
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedDepartments.length > 0 ? (
                      paginatedDepartments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="py-4">
                            <p className="font-medium text-slate-800">
                              {department.name}
                            </p>
                          </TableCell>

                          <TableCell className="max-w-md py-4 text-slate-600">
                            <p className="line-clamp-2">
                              {department.description}
                            </p>
                          </TableCell>

                          <TableCell className="py-4">
                            <Badge
                              variant={
                                department.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {department.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {new Date(department.createdAt).toLocaleDateString(
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
                                  onClick={() =>
                                    handleViewDepartment(department)
                                  }
                                >
                                  View
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditDepartment(department)
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteClick(department)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-slate-500"
                        >
                          No departments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredDepartments.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + departmentsPerPage,
                      filteredDepartments.length,
                    )}{" "}
                    of {filteredDepartments.length}
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
      <AddDepartmentDialog
        open={addDepartmentOpen}
        onOpenChange={setAddDepartmentOpen}
        onDepartmentAdded={handleDepartmentAdded}
        saving={saving}
        mutationError={mutationError}
      />
      <DepartmentDetailsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        department={departmentToView}
      />
      <AddDepartmentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onDepartmentAdded={handleDepartmentUpdated}
        department={departmentToEdit}
        saving={saving}
        mutationError={mutationError}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {departmentToDelete && isDepartmentInUse(departmentToDelete)
                ? "Department cannot be deleted"
                : "Delete department?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {departmentToDelete && isDepartmentInUse(departmentToDelete)
                ? `${departmentToDelete.name} is currently being used by doctors or appointments. Remove those relationships before deleting this department.`
                : `This will permanently delete ${departmentToDelete?.name ?? "this department"}. This action cannot be undone.`}
              {mutationError && (
                <p className="mt-3 text-sm text-red-600">{mutationError}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {departmentToDelete && isDepartmentInUse(departmentToDelete) ? (
              <AlertDialogCancel>Close</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel disabled={deleting}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDeleteDepartment}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
