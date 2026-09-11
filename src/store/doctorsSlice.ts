import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Doctor, Department } from "@/types/appointment";

import {
  getDoctors,
  getDepartments,
  createDoctor,
  updateDoctor,
  deleteDoctor,
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

export const editDoctor = createAsyncThunk(
  "doctors/editDoctor",
  async ({
    id,
    doctor,
  }: {
    id: string | number;
    doctor: Omit<Doctor, "id">;
  }) => {
    return await updateDoctor(id, doctor);
  },
);

export const removeDoctor = createAsyncThunk(
  "doctors/removeDoctor",
  async (id: string | number) => {
    return await deleteDoctor(id);
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
      })

      .addCase(editDoctor.fulfilled, (state, action) => {
        const index = state.doctors.findIndex(
          (doctor) => String(doctor.id) === String(action.payload.id),
        );

        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
      })

      .addCase(removeDoctor.fulfilled, (state, action) => {
        state.doctors = state.doctors.filter(
          (doctor) => String(doctor.id) !== String(action.payload),
        );
      });
  },
});

export default doctorsSlice.reducer;
