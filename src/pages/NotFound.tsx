import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mb-2 text-6xl font-bold text-slate-900">404</div>

          <CardTitle className="text-2xl">Page not found</CardTitle>

          <CardDescription>
            The page you're looking for doesn't exist or may have been moved.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button onClick={() => navigate("/dashboard")}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
