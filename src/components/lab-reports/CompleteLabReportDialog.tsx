import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { AppDispatch, RootState } from "@/store/store";
import type { LabReport } from "@/types/labReport";

import {
  clearLabReportMutationError,
  editLabReport,
} from "@/store/labReportsSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z.object({
  tests: z.array(
    z.object({
      id: z.string(),
      testName: z.string(),
      category: z.string(),

      result: z.string().min(1, "Result is required"),

      normalRange: z.string().min(1, "Normal range is required"),

      unit: z.string().min(1, "Unit is required"),
    }),
  ),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labReport: LabReport | null;
}

export default function CompleteLabReportDialog({
  open,
  onOpenChange,
  labReport,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { saving, mutationError } = useSelector(
    (state: RootState) => state.labReports,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tests: [],
    },
  });

  useEffect(() => {
    if (!open || !labReport) return;

    dispatch(clearLabReportMutationError());

    reset({
      tests: labReport.tests.map((test) => ({
        id: test.id,
        testName: test.testName,
        category: test.category,
        result: test.result ?? "",
        normalRange: test.normalRange ?? "",
        unit: test.unit ?? "",
      })),
    });
  }, [open, labReport, dispatch, reset]);

  if (!labReport) {
    return null;
  }

  const onSubmit = async (data: FormData) => {
    const payload: Omit<LabReport, "id"> = {
      patientId: labReport.patientId,
      appointmentId: labReport.appointmentId,
      doctorId: labReport.doctorId,

      status: "Completed",

      tests: data.tests,

      notes: labReport.notes,

      orderedAt: labReport.orderedAt,
      collectedAt: labReport.collectedAt,
      completedAt: new Date().toISOString(),
    };

    try {
      await dispatch(
        editLabReport({
          id: labReport.id,
          labReport: payload,
        }),
      ).unwrap();

      onOpenChange(false);
    } catch {
      // Redux handles mutationError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Complete Lab Report</DialogTitle>

          <DialogDescription>
            Enter the final result details for every test.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mutationError && (
            <Alert variant="destructive">
              <AlertDescription>{mutationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {labReport.tests.map((test, index) => (
              <div key={test.id} className="space-y-4 rounded-lg border p-4">
                <div>
                  <p className="font-medium">{test.testName}</p>

                  <p className="text-sm text-slate-500">{test.category}</p>
                </div>

                <input type="hidden" {...register(`tests.${index}.id`)} />

                <input type="hidden" {...register(`tests.${index}.testName`)} />

                <input type="hidden" {...register(`tests.${index}.category`)} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Result</label>

                    <Input
                      {...register(`tests.${index}.result`)}
                      placeholder="e.g. 14.2"
                    />

                    {errors.tests?.[index]?.result && (
                      <p className="text-sm text-red-500">
                        {errors.tests[index]?.result?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Normal Range</label>

                    <Input
                      {...register(`tests.${index}.normalRange`)}
                      placeholder="e.g. 13 - 17"
                    />

                    {errors.tests?.[index]?.normalRange && (
                      <p className="text-sm text-red-500">
                        {errors.tests[index]?.normalRange?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit</label>

                    <Input
                      {...register(`tests.${index}.unit`)}
                      placeholder="e.g. g/dL"
                    />

                    {errors.tests?.[index]?.unit && (
                      <p className="text-sm text-red-500">
                        {errors.tests[index]?.unit?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Completing..." : "Complete Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
