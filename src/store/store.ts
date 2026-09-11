import { configureStore } from "@reduxjs/toolkit";
import patientsReducer from "./patientsSlice";
import appointmentsReducer from "./appointmentsSlice";
import doctorsReducer from "./doctorsSlice";
import departmentsReducer from "./departmentsSlice";
import staffReducer from "./staffSlice";

export const store = configureStore({
  reducer: {
    patients: patientsReducer,
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
    departments: departmentsReducer,
    staff: staffReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
