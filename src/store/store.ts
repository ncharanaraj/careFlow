import { configureStore } from "@reduxjs/toolkit";
import patientsReducer from "@/store/patientsSlice";
import appointmentsReducer from "@/store/appointmentsSlice";
import doctorsReducer from "@/store/doctorsSlice";
import departmentsReducer from "@/store/departmentsSlice";
import staffReducer from "@/store/staffSlice";
import authReducer from "@/store/authSlice";
import prescriptionsReducer from "@/store/prescriptionsSlice";
import labReportsReducer from "@/store/labReportsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    patients: patientsReducer,
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
    departments: departmentsReducer,
    staff: staffReducer,
    prescriptions: prescriptionsReducer,
    labReports: labReportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
