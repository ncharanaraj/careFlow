import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Patient } from "@/types/patients";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "@/services/patientService";

interface PatientsState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  deleting: boolean;
  mutationError: string | null;
}

const initialState: PatientsState = {
  patients: [],
  loading: false,
  error: null,
  saving: false,
  deleting: false,
  mutationError: null,
};

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async () => {
    return await getPatients();
  },
);

export const addPatient = createAsyncThunk(
  "patients/addPatient",
  async (patient: Omit<Patient, "id">) => {
    return await createPatient(patient);
  },
);

export const editPatient = createAsyncThunk(
  "patients/editPatient",
  async ({
    id,
    patient,
  }: {
    id: number | string;
    patient: Omit<Patient, "id">;
  }) => {
    return await updatePatient(id, patient);
  },
);

export const removePatient = createAsyncThunk(
  "patients/removePatient",
  async (id: number | string) => {
    return await deletePatient(id);
  },
);

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearPatientMutationError(state) {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;

        state.patients = [...action.payload].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })

      .addCase(fetchPatients.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load patients";
      })

      .addCase(addPatient.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(addPatient.fulfilled, (state, action) => {
        state.saving = false;
        state.patients.unshift(action.payload);
      })

      .addCase(addPatient.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.error.message ?? "Failed to add patient";
      })

      .addCase(editPatient.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(editPatient.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.patients.findIndex(
          (patient) => patient.id === action.payload.id,
        );

        if (index !== -1) {
          state.patients[index] = action.payload;
        }
      })

      .addCase(editPatient.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          action.error.message ?? "Failed to update patient";
      })

      .addCase(removePatient.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })

      .addCase(removePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(
          (patient) => patient.id !== action.payload,
        );
      })

      .addCase(removePatient.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError =
          action.error.message ?? "Failed to delete patient";
      });
  },
});

export const { clearPatientMutationError } = patientsSlice.actions;

export default patientsSlice.reducer;
