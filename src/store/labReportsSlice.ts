import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { LabReport } from "@/types/labReport";

import {
  createLabReport,
  deleteLabReport,
  getLabReports,
  updateLabReport,
} from "@/services/labReportService";

interface LabReportsState {
  labReports: LabReport[];
  loading: boolean;
  error: string | null;

  saving: boolean;
  deleting: boolean;
  mutationError: string | null;
}

const initialState: LabReportsState = {
  labReports: [],
  loading: false,
  error: null,

  saving: false,
  deleting: false,
  mutationError: null,
};

export const fetchLabReports = createAsyncThunk(
  "labReports/fetchLabReports",
  async (_, { rejectWithValue }) => {
    try {
      return await getLabReports();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch lab reports",
      );
    }
  },
);

export const addLabReport = createAsyncThunk(
  "labReports/addLabReport",
  async (labReport: Omit<LabReport, "id">, { rejectWithValue }) => {
    try {
      return await createLabReport(labReport);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create lab report",
      );
    }
  },
);

export const editLabReport = createAsyncThunk(
  "labReports/editLabReport",
  async (
    {
      id,
      labReport,
    }: {
      id: string;
      labReport: Omit<LabReport, "id">;
    },
    { rejectWithValue },
  ) => {
    try {
      return await updateLabReport(id, labReport);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update lab report",
      );
    }
  },
);

export const removeLabReport = createAsyncThunk(
  "labReports/removeLabReport",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteLabReport(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete lab report",
      );
    }
  },
);

const labReportsSlice = createSlice({
  name: "labReports",

  initialState,

  reducers: {
    clearLabReportMutationError(state) {
      state.mutationError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchLabReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLabReports.fulfilled, (state, action) => {
        state.loading = false;
        state.labReports = action.payload;
      })

      .addCase(fetchLabReports.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? "Failed to fetch lab reports";
      })

      // ADD
      .addCase(addLabReport.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(addLabReport.fulfilled, (state, action) => {
        state.saving = false;
        state.labReports.unshift(action.payload);
      })

      .addCase(addLabReport.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          (action.payload as string) ?? "Failed to create lab report";
      })

      // EDIT
      .addCase(editLabReport.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(editLabReport.fulfilled, (state, action) => {
        state.saving = false;

        const index = state.labReports.findIndex(
          (report) => report.id === action.payload.id,
        );

        if (index !== -1) {
          state.labReports[index] = action.payload;
        }
      })

      .addCase(editLabReport.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          (action.payload as string) ?? "Failed to update lab report";
      })

      // DELETE
      .addCase(removeLabReport.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })

      .addCase(removeLabReport.fulfilled, (state, action) => {
        state.deleting = false;

        state.labReports = state.labReports.filter(
          (report) => report.id !== action.payload,
        );
      })

      .addCase(removeLabReport.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError =
          (action.payload as string) ?? "Failed to delete lab report";
      });
  },
});

export const { clearLabReportMutationError } = labReportsSlice.actions;

export default labReportsSlice.reducer;
