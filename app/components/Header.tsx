"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../lib/auth-context";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { cn } from "./ui/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Music", href: "/music-streaming-and-downloads" },
  { label: "Charts", href: "/music-charts" },
  { label: "Gigs", href: "/find-and-arrange-music-gigs" },
  { label: "Artists", href: "/music-artists" },
  { label: "Venues", href: "/live-music-venues" },
  { label: "Music Services", href: "/music-service-directory" },
  { label: "Music Pros", href: "/music-industry-professionals" },
  { label: "Contact", href: "/contact-details" },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const renderNavLinks = (onNavigate?: () => void) =>
    NAV_ITEMS.map((item) => (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "uppercase tracking-[0.12em] text-sm lg:text-base font-semibold transition-colors duration-200",
            isActive(item.href)
              ? "text-primary"
              : "text-foreground/70 hover:text-primary",
          )}
        >
          {item.label}
        </Link>
      </li>
    ));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-6 sm:h-24 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-32 sm:h-12 sm:w-40">
              <Image
                src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
                alt="Gigrilla"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            <ul className="flex items-center gap-5">{renderNavLinks()}</ul>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <Button
              asChild
              className="hidden rounded-full bg-secondary px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-secondary-foreground shadow-sm transition hover:bg-secondary/90 sm:flex"
            >
              <Link href="/control-panel">Control Panel ⚙️</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-foreground/80 transition hover:text-primary sm:inline-block"
              >
                Log-in
              </Link>
              <Button
                asChild
                className="hidden rounded-full bg-primary px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:flex"
              >
                <Link href="/signup">Sign-up</Link>
              </Button>
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-full border border-border/80 p-2 text-foreground/80 transition hover:border-primary hover:text-primary lg:hidden">
              <span className="sr-only">Open navigation</span>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs border-r border-border/40 bg-white/95 backdrop-blur">
              <SheetHeader className="pb-2">
                <SheetTitle className="text-xs uppercase tracking-[0.3em] text-foreground/60">
                  Navigate
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col justify-between pb-6">
                <ul className="flex flex-col gap-4 pl-1">
                  {renderNavLinks(() => setMobileOpen(false))}
                </ul>
                <div className="mt-10 flex flex-col gap-3">
                  {!loading && user ? (
                    <Button
                      asChild
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-secondary px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-secondary-foreground hover:bg-secondary/90"
                    >
                      <Link href="/control-panel">Control Panel ⚙️</Link>
                    </Button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-foreground/80 hover:text-primary"
                      >
                        Log-in
                      </Link>
                      <Button
                        asChild
                        onClick={() => setMobileOpen(false)}
                        className="rounded-full bg-primary px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href="/signup">Sign-up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
