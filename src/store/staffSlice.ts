import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Staff, Department } from "@/types/appointment";

import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "@/services/staffService";

import { getDepartments } from "@/services/departmentService";

interface StaffState {
  staff: Staff[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  deleting: boolean;
  mutationError: string | null;
}

const initialState: StaffState = {
  staff: [],
  departments: [],
  loading: false,
  error: null,
  saving: false,
  deleting: false,
  mutationError: null,
};

export const fetchStaffData = createAsyncThunk(
  "staff/fetchStaffData",
  async () => {
    const [staff, departments] = await Promise.all([
      getStaff(),
      getDepartments(),
    ]);

    return {
      staff,
      departments,
    };
  },
);

export const addStaff = createAsyncThunk(
  "staff/addStaff",
  async (staff: Omit<Staff, "id">) => {
    return await createStaff(staff);
  },
);

export const editStaff = createAsyncThunk(
  "staff/editStaff",
  async ({ id, staff }: { id: string | number; staff: Omit<Staff, "id"> }) => {
    return await updateStaff(id, staff);
  },
);

export const removeStaff = createAsyncThunk(
  "staff/removeStaff",
  async (id: string | number) => {
    return await deleteStaff(id);
  },
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearStaffMutationError: (state) => {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchStaffData.fulfilled, (state, action) => {
        state.loading = false;

        state.staff = [...action.payload.staff].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        state.departments = action.payload.departments;
      })

      .addCase(fetchStaffData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch staff";
      })

      .addCase(addStaff.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(addStaff.fulfilled, (state, action) => {
        state.saving = false;
        state.staff.unshift(action.payload);
      })

      .addCase(addStaff.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.error.message ?? "Failed to add staff";
      })

      .addCase(editStaff.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(editStaff.fulfilled, (state, action) => {
        state.saving = false;

        const index = state.staff.findIndex(
          (member) => String(member.id) === String(action.payload.id),
        );

        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })

      .addCase(editStaff.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.error.message ?? "Failed to update staff";
      })

      .addCase(removeStaff.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })

      .addCase(removeStaff.fulfilled, (state, action) => {
        state.deleting = false;

        state.staff = state.staff.filter(
          (member) => String(member.id) !== String(action.payload),
        );
      })

      .addCase(removeStaff.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError = action.error.message ?? "Failed to delete staff";
      });
  },
});

export const { clearStaffMutationError } = staffSlice.actions;

export default staffSlice.reducer;
