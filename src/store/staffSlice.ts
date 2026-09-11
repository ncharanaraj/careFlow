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
}

const initialState: StaffState = {
  staff: [],
  departments: [],
  loading: false,
  error: null,
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
  reducers: {},
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

      .addCase(addStaff.fulfilled, (state, action) => {
        state.staff.unshift(action.payload);
      })

      .addCase(editStaff.fulfilled, (state, action) => {
        const index = state.staff.findIndex(
          (member) => String(member.id) === String(action.payload.id),
        );

        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })

      .addCase(removeStaff.fulfilled, (state, action) => {
        state.staff = state.staff.filter(
          (member) => String(member.id) !== String(action.payload),
        );
      });
  },
});

export default staffSlice.reducer;
