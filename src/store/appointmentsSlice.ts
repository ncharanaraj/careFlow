import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Appointment, Doctor, Department } from "@/types/appointment";

import type { Patient } from "@/types/patients";

import {
  getAppointments,
  getDoctors,
  getDepartments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/services/appointmentService";

import { getPatients } from "@/services/patientService";

interface AppointmentsState {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  patients: [],
  doctors: [],
  departments: [],
  loading: false,
  error: null,
};

export const fetchAppointmentData = createAsyncThunk(
  "appointments/fetchAppointmentData",
  async () => {
    const [appointments, patients, doctors, departments] = await Promise.all([
      getAppointments(),
      getPatients(),
      getDoctors(),
      getDepartments(),
    ]);

    return {
      appointments,
      patients,
      doctors,
      departments,
    };
  },
);

export const addAppointment = createAsyncThunk(
  "appointments/addAppointment",
  async (appointment: Omit<Appointment, "id">) => {
    return await createAppointment(appointment);
  },
);

export const editAppointment = createAsyncThunk(
  "appointments/editAppointment",
  async ({
    id,
    appointment,
  }: {
    id: string;
    appointment: Omit<Appointment, "id">;
  }) => {
    return await updateAppointment(id, appointment);
  },
);

export const removeAppointment = createAsyncThunk(
  "appointments/removeAppointment",
  async (id: string) => {
    return await deleteAppointment(id);
  },
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointmentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAppointmentData.fulfilled, (state, action) => {
        state.loading = false;

        state.appointments = [...action.payload.appointments].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        state.patients = action.payload.patients;
        state.doctors = action.payload.doctors;
        state.departments = action.payload.departments;
      })

      .addCase(fetchAppointmentData.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load appointments";
      })

      .addCase(addAppointment.fulfilled, (state, action) => {
        state.appointments.unshift(action.payload);
      })

      .addCase(editAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === action.payload.id,
        );

        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })

      .addCase(removeAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (appointment) => String(appointment.id) !== String(action.payload),
        );
      });
  },
});

export default appointmentsSlice.reducer;
