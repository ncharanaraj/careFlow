import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";

import Prescriptions from "@/pages/Prescriptions";

vi.mock("react-redux", async () => {
  const actual =
    await vi.importActual<typeof import("react-redux")>("react-redux");

  return {
    ...actual,
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
  };
});

// Keep these tests focused on the Prescriptions page.
// Add/Edit/View dialog behavior can be tested separately.
vi.mock("@/components/prescriptions/AddPrescriptionDialog", () => ({
  default: () => null,
}));

vi.mock("@/components/prescriptions/PrescriptionDetailsDialog", () => ({
  default: () => null,
}));

const mockedUseDispatch = vi.mocked(useDispatch);
const mockedUseSelector = vi.mocked(useSelector);

const mockDispatch = vi.fn();

const prescriptions = [
  {
    id: "prescription-1",
    patientId: "patient-1",
    doctorId: "doctor-1",
    appointmentId: "appointment-1",
    diagnosis: "Viral Fever",
    medicines: [
      {
        id: "medicine-1",
        medicineName: "Paracetamol",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "After food",
      },
    ],
    notes: "Drink plenty of water.",
    createdAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: "prescription-2",
    patientId: "patient-2",
    doctorId: "doctor-2",
    appointmentId: "appointment-2",
    diagnosis: "Migraine",
    medicines: [
      {
        id: "medicine-2",
        medicineName: "Medicine B",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "3 days",
        instructions: "After food",
      },
    ],
    notes: "",
    createdAt: "2026-09-11T10:00:00.000Z",
  },
];

const patients = [
  {
    id: "patient-1",
    name: "Rahul Sharma",
  },
  {
    id: "patient-2",
    name: "Priya Rao",
  },
];

const doctors = [
  {
    id: "doctor-1",
    name: "Dr. Arjun Rao",
  },
  {
    id: "doctor-2",
    name: "Dr. Meera Shah",
  },
];

const appointments = [
  {
    id: "appointment-1",
    patientId: "patient-1",
    doctorId: "doctor-1",
    status: "Completed",
  },
  {
    id: "appointment-2",
    patientId: "patient-2",
    doctorId: "doctor-2",
    status: "Completed",
  },
];

const createMockState = (
  user: {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Doctor" | "Staff";
    doctorId?: string;
  } | null,
) => ({
  prescriptions: {
    prescriptions,
    loading: false,
    error: null,
    saving: false,
    deleting: false,
    mutationError: null,
  },

  patients: {
    patients,
  },

  doctors: {
    doctors,
  },

  appointments: {
    appointments,
  },

  auth: {
    user,
  },
});

function renderWithState(state: ReturnType<typeof createMockState>) {
  mockedUseSelector.mockImplementation((selector) => selector(state));

  render(<Prescriptions />);
}

describe("Prescriptions page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseDispatch.mockReturnValue(
      mockDispatch as ReturnType<typeof useDispatch>,
    );
  });

  it("shows all prescriptions for Admin", () => {
    const state = createMockState({
      id: "user-1",
      name: "Admin",
      email: "admin@careflow.com",
      role: "Admin",
    });

    renderWithState(state);

    expect(screen.getByText("Rahul Sharma")).toBeInTheDocument();

    expect(screen.getByText("Priya Rao")).toBeInTheDocument();

    expect(screen.getByText("Dr. Arjun Rao")).toBeInTheDocument();

    expect(screen.getByText("Dr. Meera Shah")).toBeInTheDocument();
  });

  it("shows only prescriptions belonging to logged-in Doctor", () => {
    const state = createMockState({
      id: "user-2",
      name: "Dr. Arjun Rao",
      email: "doctor@careflow.com",
      role: "Doctor",
      doctorId: "doctor-1",
    });

    renderWithState(state);

    expect(screen.getByText("Rahul Sharma")).toBeInTheDocument();

    expect(screen.getByText("Dr. Arjun Rao")).toBeInTheDocument();

    expect(screen.queryByText("Priya Rao")).not.toBeInTheDocument();

    expect(screen.queryByText("Dr. Meera Shah")).not.toBeInTheDocument();
  });

  it("shows Add Prescription for Admin", () => {
    const state = createMockState({
      id: "user-1",
      name: "Admin",
      email: "admin@careflow.com",
      role: "Admin",
    });

    renderWithState(state);

    expect(
      screen.getByRole("button", {
        name: /add prescription/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows Add Prescription for Doctor", () => {
    const state = createMockState({
      id: "user-2",
      name: "Dr. Arjun Rao",
      email: "doctor@careflow.com",
      role: "Doctor",
      doctorId: "doctor-1",
    });

    renderWithState(state);

    expect(
      screen.getByRole("button", {
        name: /add prescription/i,
      }),
    ).toBeInTheDocument();
  });

  it("does not show Add Prescription for Staff", () => {
    const state = createMockState({
      id: "user-3",
      name: "Staff User",
      email: "staff@careflow.com",
      role: "Staff",
    });

    renderWithState(state);

    expect(
      screen.queryByRole("button", {
        name: /add prescription/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows patient and doctor names instead of IDs", () => {
    const state = createMockState({
      id: "user-1",
      name: "Admin",
      email: "admin@careflow.com",
      role: "Admin",
    });

    renderWithState(state);

    expect(screen.getByText("Rahul Sharma")).toBeInTheDocument();

    expect(screen.getByText("Dr. Arjun Rao")).toBeInTheDocument();

    expect(screen.queryByText("patient-1")).not.toBeInTheDocument();

    expect(screen.queryByText("doctor-1")).not.toBeInTheDocument();
  });
});
