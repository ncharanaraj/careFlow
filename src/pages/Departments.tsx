import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import {
  editDepartment,
  fetchDepartments,
  removeDepartment,
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

import { addDepartment } from "@/store/departmentsSlice";
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

  const { departments, loading, error } = useSelector(
    (state: RootState) => state.departments,
  );

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

  const handleDepartmentAdded = async (data: DepartmentFormData) => {
    await dispatch(
      addDepartment({
        name: data.name,
        description: data.description,
        status: "Active",
        createdAt: new Date().toISOString(),
      }),
    );
  };

  const handleViewDepartment = (department: Department) => {
    setDepartmentToView(department);
    setViewOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
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
    );

    setDepartmentToEdit(null);
    setEditOpen(false);
  };

  const handleDeleteClick = (department: Department) => {
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

    await dispatch(removeDepartment(departmentToDelete.id));

    setDepartmentToDelete(null);
    setDeleteOpen(false);
  };

  const departmentsPerPage = 3;

  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

  const startIndex = (currentPage - 1) * departmentsPerPage;

  const paginatedDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + departmentsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Departments</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage hospital departments and services.
          </p>
        </div>

        <Button onClick={() => setAddDepartmentOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
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

        {/* Loading */}
        {loading && (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading departments...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-10 text-center text-sm text-red-500">{error}</div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
                    <TableRow
                      key={department.id}
                      className="hover:bg-transparent"
                    >
                      <TableCell className="py-4">
                        <p className="font-medium text-slate-800">
                          {department.name}
                        </p>
                      </TableCell>

                      <TableCell className="max-w-md py-4 text-slate-600">
                        <p className="line-clamp-2">{department.description}</p>
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
                              onClick={() => handleViewDepartment(department)}
                            >
                              View
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleEditDepartment(department)}
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
            {filteredDepartments.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    Previous
                  </Button>

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
      </div>
      <AddDepartmentDialog
        open={addDepartmentOpen}
        onOpenChange={setAddDepartmentOpen}
        onDepartmentAdded={handleDepartmentAdded}
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
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {departmentToDelete && isDepartmentInUse(departmentToDelete) ? (
              <AlertDialogCancel>Close</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDeleteDepartment}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
