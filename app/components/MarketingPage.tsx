import Link from "next/link";

import { Button } from "./ui/button";
import { cn } from "./ui/utils";

type Highlight = {
  title: string;
  description: string;
};

type Cta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
};

interface MarketingPageProps {
  eyebrow?: string;
  title: string;
  description: string;
  highlights?: Highlight[];
  ctas?: Cta[];
  className?: string;
}

export function MarketingPage({
  eyebrow,
  title,
  description,
  highlights = [],
  ctas = [],
  className,
}: MarketingPageProps) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 sm:px-10 sm:pt-20",
        className,
      )}
    >
      <header className="space-y-5 text-center sm:text-left">
        {eyebrow && (
          <p className="uppercase tracking-[0.4em] text-[0.68rem] text-foreground-alt/70">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-4xl font-bold text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto max-w-3xl text-base text-foreground/80 sm:text-lg">
          {description}
        </p>
        {ctas.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            {ctas.map((cta) => (
              <Button
                key={cta.href}
                asChild
                variant={cta.variant === "outline" ? "outline" : cta.variant === "secondary" ? "secondary" : "default"}
                className={cn(
                  "rounded-full px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em]",
                  cta.variant === "outline" && "border-primary text-primary hover:bg-primary/10",
                  cta.variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                  (!cta.variant || cta.variant === "primary") && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </header>

      {highlights.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border/40 p-6 text-left shadow-sm"
              style={{
                background:
                  "linear-gradient(145deg, rgba(220,244,250,0.55) 0%, rgba(255,255,255,0.92) 75%)",
              }}
            >
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed text-foreground/75">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
