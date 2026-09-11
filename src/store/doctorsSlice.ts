import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Doctor, Department } from "@/types/appointment";

import {
  getDoctors,
  getDepartments,
  createDoctor,
} from "@/services/doctorService";

interface DoctorsState {
  doctors: Doctor[];
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorsState = {
  doctors: [],
  departments: [],
  loading: false,
  error: null,
};

export const fetchDoctorData = createAsyncThunk(
  "doctors/fetchDoctorData",
  async () => {
    const [doctors, departments] = await Promise.all([
      getDoctors(),
      getDepartments(),
    ]);

    return {
      doctors,
      departments,
    };
  },
);

export const addDoctor = createAsyncThunk(
  "doctors/addDoctor",
  async (doctor: Omit<Doctor, "id">) => {
    return await createDoctor(doctor);
  },
);

const doctorsSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDoctorData.fulfilled, (state, action) => {
        state.loading = false;

        state.doctors = [...action.payload.doctors].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        state.departments = action.payload.departments;
      })

      .addCase(fetchDoctorData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch doctors";
      })

      .addCase(addDoctor.fulfilled, (state, action) => {
        state.doctors.unshift(action.payload);
      });
  },
});

export default doctorsSlice.reducer;
