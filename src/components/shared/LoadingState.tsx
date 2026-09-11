import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3">
      <LoaderCircle className="h-6 w-6 animate-spin text-slate-500" />

      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
