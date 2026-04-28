import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { SignUpWizard } from "./components/SignUpWizard";

function SignUpFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[var(--g-cerise)]" />
        <p className="font-ui text-base text-[var(--g-purple-2)]">
          Loading sign up...
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-[var(--g-purple-2)]/8 px-6 py-4 sm:px-10 xl:px-16">
        <Link href="/login" className="inline-flex">
          <Image
            src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
            alt="Gigrilla Logo"
            width={430}
            height={132}
            className="h-auto w-[140px] sm:w-[160px] xl:w-[180px]"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden font-ui text-sm text-[var(--g-purple-2)]/65 sm:block">
            Already have an account?
          </span>
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-xl border-[var(--g-purple-2)]/20 px-5 font-ui text-sm font-semibold text-[var(--g-purple-2)] hover:border-[var(--g-cerise)] hover:text-[var(--g-cerise)]"
          >
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-10 xl:px-0 xl:py-10">
        <Suspense fallback={<SignUpFallback />}>
          <SignUpWizard />
        </Suspense>
      </main>
    </div>
  );
}
