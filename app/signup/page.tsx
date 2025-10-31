import { Suspense } from "react";
import { SignUpWizard } from "./components/SignUpWizard";

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading signup...</p>
        </div>
      </div>
    }>
      <SignUpWizard />
    </Suspense>
  );
}
