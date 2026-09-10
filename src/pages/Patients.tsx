import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { patients } from "@/data/patients";

import { useState } from "react";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) => {
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
  const patientsPerPage = 3;
  const totalPages = Math.ceil(
    filteredPatients.length / patientsPerPage
  );

  const startIndex = (currentPage - 1) * patientsPerPage;

  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + patientsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Patients
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patient records and information.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Patient Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base">
              All Patients
            </CardTitle>

            <div className="relative w-72">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-slate-500">
                    Patient
                  </th>

                  <th className="pb-3 font-medium text-slate-500">
                    Age
                  </th>

                  <th className="pb-3 font-medium text-slate-500">
                    Gender
                  </th>

                  <th className="pb-3 font-medium text-slate-500">
                    Phone
                  </th>

                  <th className="pb-3 font-medium text-slate-500">
                    Blood Group
                  </th>

                  <th className="pb-3 font-medium text-slate-500">
                    Status
                  </th>

                  <th className="pb-3 text-right font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((patient) => (
                    <tr key={patient.id} className="border-b last:border-0">
                      <td className="py-4 font-medium text-slate-900">
                        {patient.name}
                      </td>
                      <td className="py-4 text-slate-600">{patient.age}</td>
                      <td className="py-4 text-slate-600">{patient.gender}</td>
                      <td className="py-4 text-slate-600">{patient.phone}</td>
                      <td className="py-4 text-slate-600">{patient.bloodGroup}</td>
                      <td className="py-4">
                        <Badge
                          variant={
                            patient.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {patient.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            View patient
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            Edit patient
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-red-600">
                            Delete patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-slate-500">
              Showing {startIndex + 1}–{Math.min(
                startIndex + patientsPerPage,
                filteredPatients.length
              )} of {filteredPatients.length}
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
        </CardContent>
      </Card>
    </div>
  );
}