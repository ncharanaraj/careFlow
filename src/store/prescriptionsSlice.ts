import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Prescription } from "@/types/prescription";
import {
  createPrescription,
  deletePrescription,
  getPrescriptions,
  updatePrescription,
} from "@/services/prescriptionService";

interface PrescriptionsState {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  deleting: boolean;
  mutationError: string | null;
}

const initialState: PrescriptionsState = {
  prescriptions: [],
  loading: false,
  error: null,
  saving: false,
  deleting: false,
  mutationError: null,
};

export const fetchPrescriptions = createAsyncThunk(
  "prescriptions/fetchPrescriptions",
  async (_, { rejectWithValue }) => {
    try {
      return await getPrescriptions();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch prescriptions",
      );
    }
  },
);

export const addPrescription = createAsyncThunk(
  "prescriptions/addPrescription",
  async (prescription: Omit<Prescription, "id">, { rejectWithValue }) => {
    try {
      return await createPrescription(prescription);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to create prescription",
      );
    }
  },
);

export const editPrescription = createAsyncThunk(
  "prescriptions/editPrescription",
  async (
    {
      id,
      prescription,
    }: {
      id: string;
      prescription: Omit<Prescription, "id">;
    },
    { rejectWithValue },
  ) => {
    try {
      return await updatePrescription(id, prescription);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to update prescription",
      );
    }
  },
);

export const removePrescription = createAsyncThunk(
  "prescriptions/removePrescription",
  async (id: string, { rejectWithValue }) => {
    try {
      await deletePrescription(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to delete prescription",
      );
    }
  },
);

const prescriptionsSlice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {
    clearPrescriptionMutationError: (state) => {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Failed to fetch prescriptions";
      })

      // Add
      .addCase(addPrescription.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        state.saving = false;
        state.prescriptions.unshift(action.payload);
      })
      .addCase(addPrescription.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          (action.payload as string) ?? "Failed to create prescription";
      })

      // Edit
      .addCase(editPrescription.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(editPrescription.fulfilled, (state, action) => {
        state.saving = false;

        const index = state.prescriptions.findIndex(
          (prescription) => prescription.id === action.payload.id,
        );

        if (index !== -1) {
          state.prescriptions[index] = action.payload;
        }
      })
      .addCase(editPrescription.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          (action.payload as string) ?? "Failed to update prescription";
      })

      // Delete
      .addCase(removePrescription.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })
      .addCase(removePrescription.fulfilled, (state, action) => {
        state.deleting = false;

        state.prescriptions = state.prescriptions.filter(
          (prescription) => prescription.id !== action.payload,
        );
      })
      .addCase(removePrescription.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError =
          (action.payload as string) ?? "Failed to delete prescription";
      });
  },
});

export const { clearPrescriptionMutationError } = prescriptionsSlice.actions;

export default prescriptionsSlice.reducer;
