import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import {
  addStaff,
  editStaff,
  fetchStaffData,
  removeStaff,
  clearStaffMutationError,
} from "@/store/staffSlice";

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

import AddStaffDialog, {
  type StaffFormData,
} from "@/components/staff/AddStaffDialog";
import { format, parse } from "date-fns";

import StaffDetailsDialog from "@/components/staff/StaffDetailsDialog";
import type { Staff as StaffType } from "@/types/appointment";

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

export default function Staff() {
  const [addOpen, setAddOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const {
    staff,
    departments,
    loading,
    error,
    saving,
    deleting,
    mutationError,
  } = useSelector((state: RootState) => state.staff);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [staffToView, setStaffToView] = useState<StaffType | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffType | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffType | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchStaffData());
  }, [dispatch]);

  const getDepartmentName = (id: string) =>
    departments.find((department) => String(department.id) === String(id))
      ?.name ?? "Unknown";

  const filteredStaff = staff.filter((member) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm) ||
      member.role.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm);

    const matchesDepartment =
      departmentFilter === "all" ||
      String(member.departmentId) === departmentFilter;

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleStaffAdded = async (data: StaffFormData) => {
    await dispatch(
      addStaff({
        name: data.name,
        role: data.role,
        departmentId: data.departmentId,
        phone: data.phone,
        email: data.email,
        joiningDate: data.joiningDate,
        status: "Active",
        createdAt: new Date().toISOString(),
      }),
    ).unwrap();
  };

  const handleAddStaff = () => {
    dispatch(clearStaffMutationError());
    setAddOpen(true);
  };

  const handleViewStaff = (member: StaffType) => {
    setStaffToView(member);
    setViewOpen(true);
  };

  const handleEditStaff = (member: StaffType) => {
    dispatch(clearStaffMutationError());

    setStaffToEdit(member);
    setEditOpen(true);
  };

  const handleStaffUpdated = async (data: StaffFormData) => {
    if (!staffToEdit) return;

    await dispatch(
      editStaff({
        id: staffToEdit.id,
        staff: {
          name: data.name,
          role: data.role,
          departmentId: data.departmentId,
          phone: data.phone,
          email: data.email,
          joiningDate: data.joiningDate,

          // Preserve existing values
          status: staffToEdit.status,
          createdAt: staffToEdit.createdAt,
        },
      }),
    ).unwrap();

    // setStaffToEdit(null);
    // setEditOpen(false);
  };

  const handleDeleteClick = (member: StaffType) => {
    dispatch(clearStaffMutationError());

    setStaffToDelete(member);
    setDeleteOpen(true);
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      await dispatch(removeStaff(staffToDelete.id)).unwrap();
      setStaffToDelete(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete staff:", error);
    }
  };

  const staffPerPage = 3;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStaff.length / staffPerPage),
  );

  const startIndex = (currentPage - 1) * staffPerPage;

  const paginatedStaff = filteredStaff.slice(
    startIndex,
    startIndex + staffPerPage,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Staff"
        description="Manage hospital staff and department assignments."
        action={
          <Button onClick={handleAddStaff}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        }
      />

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search staff..."
                className="pl-9"
              />
            </div>

            {/* Department */}
            <div className="w-full lg:w-56">
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

            {/* Status */}
            <div className="w-full lg:w-44">
              <Select
                items={[
                  {
                    label: "All Status",
                    value: "all",
                  },
                  {
                    label: "Active",
                    value: "Active",
                  },
                  {
                    label: "Inactive",
                    value: "Inactive",
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

                  <SelectItem value="Active">Active</SelectItem>

                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && <LoadingState message="Loading staff..." />}

          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => dispatch(fetchStaffData())}
            />
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joining Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedStaff.length > 0 ? (
                      paginatedStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="py-4">
                            <div>
                              <p className="font-medium text-slate-800">
                                {member.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {member.email}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {member.role}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {getDepartmentName(member.departmentId)}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {member.phone}
                          </TableCell>

                          <TableCell className="py-4 text-slate-600">
                            {format(
                              parse(
                                member.joiningDate,
                                "yyyy-MM-dd",
                                new Date(),
                              ),
                              "dd MMM yyyy",
                            )}
                          </TableCell>

                          <TableCell className="py-4">
                            <Badge
                              variant={
                                member.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md">
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewStaff(member)}
                                >
                                  View
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleEditStaff(member)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteClick(member)}
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
                          colSpan={7}
                          className="h-32 text-center text-slate-500"
                        >
                          No staff found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {filteredStaff.length > 0 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + staffPerPage, filteredStaff.length)}{" "}
                    of {filteredStaff.length}
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
            </>
          )}
        </CardContent>
      </Card>
      <AddStaffDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        departments={departments}
        onStaffAdded={handleStaffAdded}
        saving={saving}
        mutationError={mutationError}
      />
      <StaffDetailsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        staff={staffToView}
        departments={departments}
      />
      <AddStaffDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        departments={departments}
        onStaffAdded={handleStaffUpdated}
        staff={staffToEdit}
        saving={saving}
        mutationError={mutationError}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete staff member?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium">{staffToDelete?.name}</span>. This
              action cannot be undone.
              {mutationError && (
                <p className="mt-3 text-sm text-red-600">{mutationError}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteStaff}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
