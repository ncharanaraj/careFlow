import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, within } from "@testing-library/react";

import LabReports from "@/pages/LabReports";
import type { RootState } from "@/store/store";
import type { LabReport } from "@/types/labReport";
import type { Patient } from "@/types/patients";
import type { Doctor } from "@/types/appointment";

const mockDispatch = vi.fn();

type MockState = {
  auth: RootState["auth"];
  labReports: RootState["labReports"];
  patients: RootState["patients"];
  doctors: RootState["doctors"];
  appointments: RootState["appointments"];
};

let mockState: MockState;

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,

  useSelector: (selector: (state: RootState) => unknown) =>
    selector(mockState as RootState),
}));

// We don't need to test the dialog internals here.
// They should have their own tests later.
vi.mock("@/components/lab-reports/AddLabReportDialog", () => ({
  default: () => null,
}));

vi.mock("@/components/lab-reports/LabReportDetailsDialog", () => ({
  default: () => null,
}));

vi.mock("@/components/lab-reports/CompleteLabReportDialog", () => ({
  default: () => null,
}));

// Keep dropdown content visible during tests.
// This makes RBAC/action assertions much simpler.
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: PropsWithChildren) => <div>{children}</div>,

  DropdownMenuTrigger: ({ children }: PropsWithChildren) => (
    <button type="button">{children}</button>
  ),

  DropdownMenuContent: ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  ),

  DropdownMenuItem: ({
    children,
    onClick,
  }: PropsWithChildren<{
    onClick?: () => void;
  }>) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock Select because this test is about LabReports
// behavior, not the shadcn/Base UI Select implementation.
vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: PropsWithChildren) => <div>{children}</div>,

  SelectTrigger: ({ children }: PropsWithChildren) => <div>{children}</div>,

  SelectValue: () => null,

  SelectContent: ({ children }: PropsWithChildren) => <div>{children}</div>,

  SelectItem: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

// Delete confirmation is closed initially,
// so we can ignore its internals in these tests.
vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    open,
    children,
  }: PropsWithChildren<{
    open?: boolean;
  }>) => (open ? <div>{children}</div> : null),

  AlertDialogAction: ({ children }: PropsWithChildren) => (
    <button>{children}</button>
  ),

  AlertDialogCancel: ({ children }: PropsWithChildren) => (
    <button>{children}</button>
  ),

  AlertDialogContent: ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  ),

  AlertDialogDescription: ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  ),

  AlertDialogFooter: ({ children }: PropsWithChildren) => <div>{children}</div>,

  AlertDialogHeader: ({ children }: PropsWithChildren) => <div>{children}</div>,

  AlertDialogTitle: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

const labReports: LabReport[] = [
  {
    id: "report-1",
    patientId: "patient-1",
    appointmentId: "appointment-1",
    doctorId: "doctor-1",

    status: "Ordered",

    tests: [
      {
        id: "test-1",
        testName: "Hemoglobin",
        category: "Blood Test",
        result: "",
        normalRange: "",
        unit: "",
      },
    ],

    notes: "",

    orderedAt: "2026-09-13T10:00:00.000Z",
  },

  {
    id: "report-2",
    patientId: "patient-2",
    appointmentId: "appointment-2",
    doctorId: "doctor-2",

    status: "Sample Collected",

    tests: [
      {
        id: "test-2",
        testName: "Blood Sugar",
        category: "Blood Test",
        result: "",
        normalRange: "",
        unit: "",
      },
    ],

    notes: "",

    orderedAt: "2026-09-12T10:00:00.000Z",

    collectedAt: "2026-09-12T12:00:00.000Z",
  },

  {
    id: "report-3",
    patientId: "patient-3",
    appointmentId: "appointment-3",
    doctorId: "doctor-1",

    status: "Completed",

    tests: [
      {
        id: "test-3",
        testName: "WBC Count",
        category: "Blood Test",
        result: "7200",
        normalRange: "4000 - 11000",
        unit: "cells/µL",
      },
    ],

    notes: "Normal result.",

    orderedAt: "2026-09-11T10:00:00.000Z",

    collectedAt: "2026-09-11T11:00:00.000Z",

    completedAt: "2026-09-11T14:00:00.000Z",
  },
];

const patients: Patient[] = [
  {
    id: "patient-1",
    name: "Newest Patient",
    age: 28,
    gender: "Male",
    phone: "9876543210",
    bloodGroup: "O+",
    status: "Active",
    createdAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: "patient-2",
    name: "Second Patient",
    age: 34,
    gender: "Female",
    phone: "9876543211",
    bloodGroup: "A+",
    status: "Active",
    createdAt: "2026-09-09T10:00:00.000Z",
  },
  {
    id: "patient-3",
    name: "Oldest Patient",
    age: 45,
    gender: "Male",
    phone: "9876543212",
    bloodGroup: "B+",
    status: "Active",
    createdAt: "2026-09-08T10:00:00.000Z",
  },
];

const doctors: Doctor[] = [
  {
    id: "doctor-1",
    name: "Dr. Arjun Rao",
    departmentId: "department-1",
    specialization: "Cardiology",
    phone: "9876543201",
    email: "arjun.rao@careflow.com",
    experience: 8,
    status: "Active",
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "doctor-2",
    name: "Dr. Meera Shah",
    departmentId: "department-2",
    specialization: "Neurology",
    phone: "9876543202",
    email: "meera.shah@careflow.com",
    experience: 6,
    status: "Active",
    createdAt: "2026-02-15T10:00:00.000Z",
  },
];

const setRole = (role: "Admin" | "Doctor" | "Staff") => {
  mockState = {
    auth: {
      user: {
        id:
          role === "Doctor" ? "user-2" : role === "Staff" ? "user-3" : "user-1",

        name:
          role === "Doctor"
            ? "Dr. Arjun Rao"
            : role === "Staff"
              ? "Anita Kulkarni"
              : "Charan Admin",

        email:
          role === "Doctor"
            ? "doctor@careflow.com"
            : role === "Staff"
              ? "staff@careflow.com"
              : "admin@careflow.com",

        role,

        ...(role === "Doctor" ? { doctorId: "doctor-1" } : {}),
      },

      loading: false,
      error: null,
    },

    labReports: {
      labReports,
      loading: false,
      error: null,
      saving: false,
      deleting: false,
      mutationError: null,
    },

    patients: {
      patients,
      loading: false,
      error: null,
      saving: false,
      deleting: false,
      mutationError: null,
    },

    doctors: {
      doctors,
      departments: [],
      loading: false,
      error: null,
      saving: false,
      deleting: false,
      mutationError: null,
    },

    appointments: {
      appointments: [],
      patients,
      doctors,
      departments: [],
      loading: false,
      error: null,
      saving: false,
      deleting: false,
      mutationError: null,
    },
  };
};

describe("LabReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDispatch.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("shows all lab reports for Admin", () => {
    setRole("Admin");

    render(<LabReports />);

    expect(screen.getByText("Newest Patient")).toBeInTheDocument();

    expect(screen.getByText("Second Patient")).toBeInTheDocument();

    expect(screen.getByText("Oldest Patient")).toBeInTheDocument();
  });

  it("shows only the doctor's own lab reports", () => {
    setRole("Doctor");

    render(<LabReports />);

    // doctor-1 owns report-1
    expect(screen.getByText("Newest Patient")).toBeInTheDocument();

    // doctor-1 owns report-3
    expect(screen.getByText("Oldest Patient")).toBeInTheDocument();

    // doctor-2 owns report-2
    expect(screen.queryByText("Second Patient")).not.toBeInTheDocument();
  });

  it("shows all reports for Staff", () => {
    setRole("Staff");

    render(<LabReports />);

    expect(screen.getByText("Newest Patient")).toBeInTheDocument();

    expect(screen.getByText("Second Patient")).toBeInTheDocument();

    expect(screen.getByText("Oldest Patient")).toBeInTheDocument();
  });

  it("shows Add Lab Report for Admin", () => {
    setRole("Admin");

    render(<LabReports />);

    expect(
      screen.getByRole("button", {
        name: /add lab report/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows Add Lab Report for Doctor", () => {
    setRole("Doctor");

    render(<LabReports />);

    expect(
      screen.getByRole("button", {
        name: /add lab report/i,
      }),
    ).toBeInTheDocument();
  });

  it("does not show Add Lab Report for Staff", () => {
    setRole("Staff");

    render(<LabReports />);

    expect(
      screen.queryByRole("button", {
        name: /add lab report/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("allows Staff to mark an Ordered report as sample collected", () => {
    setRole("Staff");

    render(<LabReports />);

    const row = screen.getByText("Newest Patient").closest("tr");

    expect(row).not.toBeNull();

    expect(within(row!).getByText("Mark Sample Collected")).toBeInTheDocument();
  });

  it("allows Staff to enter results for a Sample Collected report", () => {
    setRole("Staff");

    render(<LabReports />);

    const row = screen.getByText("Second Patient").closest("tr");

    expect(row).not.toBeNull();

    expect(within(row!).getByText("Enter Results")).toBeInTheDocument();
  });

  it("does not allow Doctor to collect samples or enter results", () => {
    setRole("Doctor");

    render(<LabReports />);

    expect(screen.queryByText("Mark Sample Collected")).not.toBeInTheDocument();

    expect(screen.queryByText("Enter Results")).not.toBeInTheDocument();
  });

  it("allows Doctor to edit their own Ordered report", () => {
    setRole("Doctor");

    render(<LabReports />);

    const row = screen.getByText("Newest Patient").closest("tr");

    expect(row).not.toBeNull();

    expect(within(row!).getByText("Edit")).toBeInTheDocument();
  });

  it("does not show workflow actions for a Completed report", () => {
    setRole("Admin");

    render(<LabReports />);

    const row = screen.getByText("Oldest Patient").closest("tr");

    expect(row).not.toBeNull();

    expect(
      within(row!).queryByText("Mark Sample Collected"),
    ).not.toBeInTheDocument();

    expect(within(row!).queryByText("Enter Results")).not.toBeInTheDocument();

    expect(within(row!).queryByText("Edit")).not.toBeInTheDocument();

    // Admin can still delete a completed report.
    expect(within(row!).getByText("Delete")).toBeInTheDocument();
  });

  it("shows newest reports first based on orderedAt", () => {
    setRole("Admin");

    render(<LabReports />);

    const rows = screen.getAllByRole("row");

    // index 0 is the table header.
    expect(rows[1]).toHaveTextContent("Newest Patient");

    expect(rows[2]).toHaveTextContent("Second Patient");

    expect(rows[3]).toHaveTextContent("Oldest Patient");
  });
});
