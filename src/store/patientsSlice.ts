import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Patient } from "@/data/patients";
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
}

const initialState: PatientsState = {
  patients: [],
  loading: false,
  error: null,
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
  reducers: {},
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

      .addCase(addPatient.fulfilled, (state, action) => {
        state.patients.unshift(action.payload);
      })

      .addCase(editPatient.fulfilled, (state, action) => {
        const index = state.patients.findIndex(
          (patient) => patient.id === action.payload.id,
        );

        if (index !== -1) {
          state.patients[index] = action.payload;
        }
      })

      .addCase(removePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter(
          (patient) => patient.id !== action.payload,
        );
      });
  },
});

export default patientsSlice.reducer;
