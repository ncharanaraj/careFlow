import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Department } from "@/types/appointment";

import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/services/departmentService";

interface DepartmentsState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  deleting: boolean;
  mutationError: string | null;
}

const initialState: DepartmentsState = {
  departments: [],
  loading: false,
  error: null,
  saving: false,
  deleting: false,
  mutationError: null,
};

export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async () => {
    return await getDepartments();
  },
);

export const addDepartment = createAsyncThunk(
  "departments/addDepartment",
  async (department: Omit<Department, "id">) => {
    return await createDepartment(department);
  },
);

export const editDepartment = createAsyncThunk(
  "departments/editDepartment",
  async ({
    id,
    department,
  }: {
    id: string | number;
    department: Omit<Department, "id">;
  }) => {
    return await updateDepartment(id, department);
  },
);

export const removeDepartment = createAsyncThunk(
  "departments/removeDepartment",
  async (id: string | number) => {
    return await deleteDepartment(id);
  },
);

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearDepartmentMutationError(state) {
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;

        state.departments = [...action.payload].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      })

      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch departments";
      })

      .addCase(addDepartment.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(addDepartment.fulfilled, (state, action) => {
        state.saving = false;
        state.departments.unshift(action.payload);
      })

      .addCase(addDepartment.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          action.error.message ?? "Failed to add department";
      })

      .addCase(editDepartment.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })

      .addCase(editDepartment.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.departments.findIndex(
          (department) => String(department.id) === String(action.payload.id),
        );

        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })

      .addCase(editDepartment.rejected, (state, action) => {
        state.saving = false;
        state.mutationError =
          action.error.message ?? "Failed to update department";
      })

      .addCase(removeDepartment.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })

      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (department) => String(department.id) !== String(action.payload),
        );
      })

      .addCase(removeDepartment.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError =
          action.error.message ?? "Failed to delete department";
      });
  },
});

export const { clearDepartmentMutationError } = departmentsSlice.actions;

export default departmentsSlice.reducer;
