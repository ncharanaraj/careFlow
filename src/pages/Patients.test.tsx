import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

import Patients from "@/pages/Patients";
import patientsReducer from "@/store/patientsSlice";
import appointmentsReducer from "@/store/appointmentsSlice";
import prescriptionsReducer from "@/store/prescriptionsSlice";
import labReportsReducer from "@/store/labReportsSlice";
import * as patientService from "@/services/patientService";
import * as appointmentService from "@/services/appointmentService";

vi.mock("@/services/patientService", () => ({
  getPatients: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  deletePatient: vi.fn(),
}));

vi.mock("@/services/appointmentService", () => ({
  getAppointments: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  deleteAppointment: vi.fn(),
}));

function renderPatients() {
  const store = configureStore({
    reducer: {
      patients: patientsReducer,
      appointments: appointmentsReducer,
      prescriptions: prescriptionsReducer,
      labReports: labReportsReducer,

      auth: (
        state = {
          user: {
            id: "user-1",
            name: "Charan Admin",
            email: "admin@careflow.com",
            role: "Admin" as const,
          },
          loading: false,
          error: null,
        },
      ) => state,
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <Patients />
      </MemoryRouter>
    </Provider>,
  );

  return store;
}

describe("Patients", () => {
  it("allows an admin to add a patient", async () => {
    const user = userEvent.setup();

    vi.mocked(patientService.getPatients).mockResolvedValue([]);

    vi.mocked(appointmentService.getAppointments).mockResolvedValue([]);

    vi.mocked(patientService.createPatient).mockResolvedValue({
      id: "patient-test-1",
      name: "Rahul Kumar",
      age: 30,
      gender: "Male",
      phone: "9876543210",
      bloodGroup: "O+",
      status: "Active",
      createdAt: "2026-09-12T10:00:00.000Z",
    });

    renderPatients();

    expect(
      await screen.findByRole("heading", {
        name: /patients/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /add patient/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: /add patient/i,
      }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/patient name/i), "Rahul Kumar");

    await user.type(screen.getByLabelText(/age/i), "30");

    await user.type(screen.getByLabelText(/phone/i), "9876543210");

    const selects = screen.getAllByRole("combobox");

    // Gender
    await user.click(selects[0]);

    await user.click(
      await screen.findByRole("option", {
        name: "Male",
      }),
    );

    // Blood Group
    await user.click(selects[1]);

    await user.click(
      await screen.findByRole("option", {
        name: "O+",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /^add patient$/i,
      }),
    );

    expect(patientService.createPatient).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Rahul Kumar",
        age: 30,
        gender: "Male",
        phone: "9876543210",
        bloodGroup: "O+",
        status: "Active",
      }),
    );

    expect(await screen.findByText("Rahul Kumar")).toBeInTheDocument();
  });
});
