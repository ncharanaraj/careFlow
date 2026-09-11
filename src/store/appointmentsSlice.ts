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
  saving: boolean;
  deleting: boolean;
  mutationError: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  patients: [],
  doctors: [],
  departments: [],
  loading: false,
  error: null,
  saving: false,
  deleting: false,
  mutationError: null,
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
  reducers: {
    clearAppointmentMutationError(state) {
      state.mutationError = null;
    },
  },
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

      .addCase(addAppointment.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(addAppointment.fulfilled, (state, action) => {
        state.saving = false;
        state.appointments.unshift(action.payload);
      })

      .addCase(addAppointment.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          action.error.message ?? "Failed to add appointment";
      })

      .addCase(editAppointment.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(editAppointment.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.appointments.findIndex(
          (appointment) => appointment.id === action.payload.id,
        );

        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })

      .addCase(editAppointment.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          action.error.message ?? "Failed to update appointment";
      })

      .addCase(removeAppointment.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })

      .addCase(removeAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(
          (appointment) => String(appointment.id) !== String(action.payload),
        );
      })

      .addCase(removeAppointment.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError =
          action.error.message ?? "Failed to delete appointment";
      });
  },
});

export const { clearAppointmentMutationError } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
