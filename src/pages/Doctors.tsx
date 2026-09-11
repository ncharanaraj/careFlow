import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import { fetchDoctorData } from "@/store/doctorsSlice";

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

import { addDoctor } from "@/store/doctorsSlice";

export default function Doctors() {
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const { doctors, departments, loading, error } = useSelector(
    (state: RootState) => state.doctors,
  );

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
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage hospital doctors and department assignments.
          </p>
        </div>

        <Button onClick={() => setAddDoctorOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      {/* Main Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {/* Search & Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
              onValueChange={(value) =>
                setDepartmentFilter((value ?? "all") as string)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Department" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>

                {departments.map((department) => (
                  <SelectItem key={department.id} value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading doctors...
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
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      {/* Doctor */}
                      <TableCell>
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
                      <TableCell className="text-slate-600">
                        {doctor.specialization}
                      </TableCell>

                      {/* Department */}
                      <TableCell className="text-slate-600">
                        {getDepartmentName(doctor.departmentId)}
                      </TableCell>

                      {/* Experience */}
                      <TableCell className="text-slate-600">
                        {doctor.experience}{" "}
                        {doctor.experience === 1 ? "year" : "years"}
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="text-slate-600">
                        {doctor.phone}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={
                            doctor.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {doctor.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View</DropdownMenuItem>

                            <DropdownMenuItem>Edit</DropdownMenuItem>

                            <DropdownMenuItem className="text-red-600">
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
        )}
      </div>
      <AddDoctorDialog
        open={addDoctorOpen}
        onOpenChange={setAddDoctorOpen}
        departments={departments}
        onDoctorAdded={handleDoctorAdded}
      />
    </div>
  );
}
