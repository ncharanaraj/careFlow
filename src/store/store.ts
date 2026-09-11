import { configureStore } from "@reduxjs/toolkit";
import patientsReducer from "./patientsSlice";
import appointmentsReducer from "./appointmentsSlice";
import doctorsReducer from "./doctorsSlice";
import departmentsReducer from "./departmentsSlice";

export const store = configureStore({
  reducer: {
    patients: patientsReducer,
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
    departments: departmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
