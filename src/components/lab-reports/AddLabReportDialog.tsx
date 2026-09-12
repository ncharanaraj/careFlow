import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import type { AppDispatch, RootState } from "@/store/store";
import type { LabReport } from "@/types/labReport";

import {
  addLabReport,
  editLabReport,
  clearLabReportMutationError,
} from "@/store/labReportsSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Alert, AlertDescription } from "@/components/ui/alert";

const labTestSchema = z.object({
  id: z.string(),
  testName: z.string().min(1, "Test name is required"),
  category: z.string().min(1, "Category is required"),
  result: z.string(),
  normalRange: z.string(),
  unit: z.string(),
});

const labReportSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),

  appointmentId: z.string().min(1, "Appointment is required"),

  doctorId: z.string().min(1, "Doctor is required"),

  tests: z.array(labTestSchema).min(1, "At least one test is required"),

  notes: z.string(),
});

type LabReportFormData = z.infer<typeof labReportSchema>;

interface AddLabReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labReport?: LabReport | null;
  onCreated?: () => void;
}

const createEmptyTest = () => ({
  id: crypto.randomUUID(),
  testName: "",
  category: "",
  result: "",
  normalRange: "",
  unit: "",
});

const defaultValues: LabReportFormData = {
  patientId: "",
  appointmentId: "",
  doctorId: "",
  tests: [createEmptyTest()],
  notes: "",
};

export default function AddLabReportDialog({
  open,
  onOpenChange,
  labReport,
  onCreated,
}: AddLabReportDialogProps) {
  const dispatch = useDispatch<AppDispatch>();

  const patients = useSelector((state: RootState) => state.patients.patients);

  const doctors = useSelector((state: RootState) => state.doctors.doctors);

  const appointments = useSelector(
    (state: RootState) => state.appointments.appointments,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const { saving, mutationError } = useSelector(
    (state: RootState) => state.labReports,
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LabReportFormData>({
    resolver: zodResolver(labReportSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tests",
  });

  const patientId = useWatch({
    control,
    name: "patientId",
  });

  const appointmentId = useWatch({
    control,
    name: "appointmentId",
  });

  const doctorId = useWatch({
    control,
    name: "doctorId",
  });

  const eligibleAppointments = appointments.filter((appointment) => {
    const isCompleted = appointment.status === "Completed";

    const belongsToDoctor =
      user?.role !== "Doctor" ||
      String(appointment.doctorId) === String(user.doctorId);

    return isCompleted && belongsToDoctor;
  });

  const eligiblePatientIds = new Set(
    eligibleAppointments.map((appointment) => String(appointment.patientId)),
  );

  const eligiblePatients = patients.filter((patient) =>
    eligiblePatientIds.has(String(patient.id)),
  );

  const filteredAppointments = eligibleAppointments.filter(
    (appointment) => String(appointment.patientId) === String(patientId),
  );

  const selectedDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(doctorId),
  );

  useEffect(() => {
    if (!appointmentId) {
      setValue("doctorId", "");
      return;
    }

    const appointment = appointments.find(
      (item) => String(item.id) === String(appointmentId),
    );

    if (!appointment) {
      setValue("doctorId", "");
      return;
    }

    setValue("doctorId", String(appointment.doctorId), {
      shouldValidate: true,
    });
  }, [appointmentId, appointments, setValue]);

  useEffect(() => {
    if (!open) return;

    dispatch(clearLabReportMutationError());

    if (labReport) {
      reset({
        patientId: String(labReport.patientId),
        appointmentId: String(labReport.appointmentId),
        doctorId: String(labReport.doctorId),
        tests: labReport.tests.map((test) => ({
          id: test.id,
          testName: test.testName,
          category: test.category,
          result: test.result,
          normalRange: test.normalRange,
          unit: test.unit,
        })),
        notes: labReport.notes,
      });

      return;
    }

    reset({
      patientId: "",
      appointmentId: "",
      doctorId: "",
      tests: [createEmptyTest()],
      notes: "",
    });
  }, [open, labReport, dispatch, reset]);

  const onSubmit = async (data: LabReportFormData) => {
    const payload: Omit<LabReport, "id"> = {
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      doctorId: data.doctorId,

      status: labReport?.status ?? "Ordered",

      tests: data.tests.map((test) => ({
        ...test,
        result: test.result ?? "",
        normalRange: test.normalRange ?? "",
        unit: test.unit ?? "",
      })),

      notes: data.notes.trim(),

      orderedAt: labReport?.orderedAt ?? new Date().toISOString(),

      collectedAt: labReport?.collectedAt,

      completedAt: labReport?.completedAt,
    };

    try {
      if (labReport) {
        await dispatch(
          editLabReport({
            id: labReport.id,
            labReport: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(addLabReport(payload)).unwrap();

        onCreated?.();
      }

      onOpenChange(false);
    } catch {
      // Redux handles mutationError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {labReport ? "Edit Lab Report" : "Add Lab Report"}
          </DialogTitle>

          <DialogDescription>
            Create a lab order for a completed patient appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mutationError && (
            <Alert variant="destructive">
              <AlertDescription>{mutationError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>

              <Select
                items={eligiblePatients.map((patient) => ({
                  label: patient.name,
                  value: String(patient.id),
                }))}
                value={patientId}
                onValueChange={(value) => {
                  setValue("patientId", (value ?? "") as string, {
                    shouldValidate: true,
                  });

                  setValue("appointmentId", "");

                  setValue("doctorId", "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>

                <SelectContent>
                  {eligiblePatients.map((patient) => (
                    <SelectItem key={patient.id} value={String(patient.id)}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.patientId && (
                <p className="text-sm text-red-500">
                  {errors.patientId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Appointment</label>

              <Select
                disabled={!patientId}
                items={filteredAppointments.map((appointment) => ({
                  value: String(appointment.id),
                  label: `${appointment.appointmentDate} - ${appointment.timeSlot}`,
                }))}
                value={appointmentId}
                onValueChange={(value) => {
                  setValue("appointmentId", (value ?? "") as string, {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select appointment" />
                </SelectTrigger>

                <SelectContent>
                  {filteredAppointments.map((appointment) => (
                    <SelectItem
                      key={appointment.id}
                      value={String(appointment.id)}
                    >
                      {appointment.appointmentDate} - {appointment.timeSlot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.appointmentId && (
                <p className="text-sm text-red-500">
                  {errors.appointmentId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Doctor</label>

            <Input
              value={selectedDoctor?.name ?? ""}
              placeholder="Doctor will be selected automatically"
              disabled
            />

            {errors.doctorId && (
              <p className="text-sm text-red-500">{errors.doctorId.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Lab Tests</h3>

                <p className="text-sm text-slate-500">
                  Add one or more diagnostic tests.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(createEmptyTest())}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Test
              </Button>
            </div>

            {errors.tests?.root?.message && (
              <p className="text-sm text-red-500">
                {errors.tests.root.message}
              </p>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Test {index + 1}</p>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Test Name</label>

                      <Input
                        {...register(`tests.${index}.testName`)}
                        placeholder="e.g. Hemoglobin"
                      />

                      {errors.tests?.[index]?.testName && (
                        <p className="text-sm text-red-500">
                          {errors.tests[index]?.testName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>

                      <Input
                        {...register(`tests.${index}.category`)}
                        placeholder="e.g. Blood Test"
                      />

                      {errors.tests?.[index]?.category && (
                        <p className="text-sm text-red-500">
                          {errors.tests[index]?.category?.message}
                        </p>
                      )}
                    </div>

                    {/* <div className="space-y-2">
                      <label className="text-sm font-medium">Result</label>

                      <Input
                        {...register(`tests.${index}.result`)}
                        placeholder="Enter later"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Normal Range
                      </label>

                      <Input
                        {...register(`tests.${index}.normalRange`)}
                        placeholder="e.g. 13 - 17"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Unit</label>

                      <Input
                        {...register(`tests.${index}.unit`)}
                        placeholder="e.g. g/dL"
                      />
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>

            <Textarea
              {...register("notes")}
              placeholder="Optional notes..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving
                ? labReport
                  ? "Updating..."
                  : "Creating..."
                : labReport
                  ? "Update Lab Report"
                  : "Create Lab Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
