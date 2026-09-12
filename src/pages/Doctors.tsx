import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import {
  clearDoctorMutationError,
  editDoctor,
  fetchDoctorData,
  removeDoctor,
  addDoctor,
} from "@/store/doctorsSlice";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AddDoctorDialog, {
  type DoctorFormData,
} from "@/components/doctors/AddDoctorDialog";

import DoctorDetailsDialog from "@/components/doctors/DoctorDetailsDialog";
import type { Doctor } from "@/types/appointment";
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

export default function Doctors() {
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [doctorToView, setDoctorToView] = useState<Doctor | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch<AppDispatch>();

  const {
    doctors,
    departments,
    loading,
    error,
    saving,
    deleting,
    mutationError,
  } = useSelector((state: RootState) => state.doctors);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchDoctorData());
  }, [dispatch]);

  const getDepartmentName = (id: string) =>
    departments.find((department) => String(department.id) === String(id))
      ?.name ?? "Unknown";

  const filteredDoctors = doctors.filter((doctor) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm) ||
      doctor.specialization.toLowerCase().includes(searchTerm) ||
      doctor.email.toLowerCase().includes(searchTerm);

    const matchesDepartment =
      departmentFilter === "all" ||
      String(doctor.departmentId) === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const handleDoctorAdded = async (data: DoctorFormData) => {
    await dispatch(
      addDoctor({
        name: data.name,
        departmentId: data.departmentId,
        specialization: data.specialization,
        phone: data.phone,
        email: data.email,
        experience: Number(data.experience),
        status: "Active",
        createdAt: new Date().toISOString(),
      }),
    ).unwrap();
  };

  const handleAddDoctor = () => {
    dispatch(clearDoctorMutationError());
    setAddDoctorOpen(true);
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setDoctorToView(doctor);
    setViewOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    dispatch(clearDoctorMutationError());
    setDoctorToEdit(doctor);
    setEditOpen(true);
  };

  const handleDeleteClick = (doctor: Doctor) => {
    dispatch(clearDoctorMutationError());
    setDoctorToDelete(doctor);
    setDeleteOpen(true);
  };

  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    await dispatch(removeDoctor(doctorToDelete.id)).unwrap();

    setDoctorToDelete(null);
    setDeleteOpen(false);
  };

  const handleDoctorUpdated = async (data: DoctorFormData) => {
    if (!doctorToEdit) return;

    await dispatch(
      editDoctor({
        id: doctorToEdit.id,
        doctor: {
          name: data.name,
          departmentId: data.departmentId,
          specialization: data.specialization,
          phone: data.phone,
          email: data.email,
          experience: Number(data.experience),
          status: doctorToEdit.status,
          createdAt: doctorToEdit.createdAt,
        },
      }),
    ).unwrap();

    // setDoctorToEdit(null);
    // setEditOpen(false);
  };

  const doctorsPerPage = 5;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDoctors.length / doctorsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * doctorsPerPage;

  const paginatedDoctors = filteredDoctors.slice(
    startIndex,
    startIndex + doctorsPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Doctors"
        description="Manage hospital doctors and department assignments."
        action={
          <Button onClick={handleAddDoctor}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        }
      />

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Doctors</CardTitle>
        </CardHeader>
        {/* Search & Filters */}
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search doctors..."
                className="pl-9"
              />
            </div>

            {/* Department Filter */}
            <div className="w-full sm:w-56">
              <Select
                items={[
                  {
                    label: "All Departments",
                    value: "all",
                  },
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

          {loading && <LoadingState message="Loading doctors..." />}

          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => dispatch(fetchDoctorData())}
            />
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedDoctors.length > 0 ? (
                      paginatedDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          {/* Doctor */}
                          <TableCell className="py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {doctor.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {doctor.email}
                              </p>
                            </div>
                          </TableCell>

                          {/* Specialization */}
                          <TableCell className="py-4 text-slate-600">
                            {doctor.specialization}
                          </TableCell>

                          {/* Department */}
                          <TableCell className="py-4 text-slate-600">
                            {getDepartmentName(doctor.departmentId)}
                          </TableCell>

                          {/* Experience */}
                          <TableCell className="py-4 text-slate-600">
                            {doctor.experience}{" "}
                            {doctor.experience === 1 ? "year" : "years"}
                          </TableCell>

                          {/* Phone */}
                          <TableCell className="py-4 text-slate-600">
                            {doctor.phone}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-4">
                            <Badge
                              variant={
                                doctor.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {doctor.status}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewDoctor(doctor)}
                                >
                                  View
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleEditDoctor(doctor)}
                                >
                                  Edit
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteClick(doctor)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-32 text-center text-slate-500"
                        >
                          No doctors found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredDoctors.length > 0 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(
                      startIndex + doctorsPerPage,
                      filteredDoctors.length,
                    )}{" "}
                    of {filteredDoctors.length}
                  </p>

                  <div className="flex items-center gap-2">
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
      <AddDoctorDialog
        open={addDoctorOpen}
        onOpenChange={setAddDoctorOpen}
        departments={departments}
        onDoctorAdded={handleDoctorAdded}
        saving={saving}
        mutationError={mutationError}
      />
      <DoctorDetailsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        doctor={doctorToView}
        departments={departments}
      />
      <AddDoctorDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        departments={departments}
        onDoctorAdded={handleDoctorUpdated}
        doctor={doctorToEdit}
        saving={saving}
        mutationError={mutationError}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete doctor?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium">{doctorToDelete?.name}</span>. This
              action cannot be undone.
              {mutationError && (
                <p className="mt-3 text-sm text-red-600">{mutationError}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteDoctor}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
