"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "../../../lib/auth-context";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";

type ProfileLink = {
  key: "fan" | "artist" | "venue" | "service" | "pro";
  label: string;
  description: string;
  href: string;
  badge?: string;
  disabled?: boolean;
};

const PROFILE_LINKS: ProfileLink[] = [
  {
    key: "fan",
    label: "Fan Profile",
    description:
      "Update your preferences, playlists, and gig alerts. Manage photos, videos, and favourite genres.",
    href: "/fan-dashboard",
    badge: "Primary",
  },
  {
    key: "artist",
    label: "Artist Profile",
    description:
      "Add artist members, set royalty splits, publish releases, and manage gig bookings.",
    href: "/artist-dashboard",
  },
  {
    key: "venue",
    label: "Venue Profile",
    description:
      "Publish availability, manage stage specs, handle ticketing, and approve artist offers.",
    href: "/venue-setup",
    disabled: true,
  },
  {
    key: "service",
    label: "Music Service Profile",
    description:
      "List your services, accept bookings, and collaborate on artist and venue projects.",
    href: "/music-service-setup",
    disabled: true,
  },
  {
    key: "pro",
    label: "Music Pro Profile",
    description:
      "Host webinars, deliver consultations, and support members across the music industry.",
    href: "/music-pro-setup",
    disabled: true,
  },
];

export default function ControlPanelPage() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams?.get("mode") === "guest";

  const summaryTitle = useMemo(() => {
    if (isGuestMode) {
      return "Guest Control Panel";
    }
    return "Control Panel";
  }, [isGuestMode]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-10 sm:px-10">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="uppercase tracking-[0.35em] text-[0.7rem] text-foreground-alt/70">
              {summaryTitle}
            </p>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {isGuestMode
                ? "Explore Gigrilla as a Guest"
                : "Manage Your Profiles and Membership"}
            </h1>
          </div>
          <Button
            variant="outline"
            className="rounded-full px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
            onClick={() => {
              void signOut();
            }}
          >
            Log out
          </Button>
        </div>
        <p className="max-w-3xl text-sm text-foreground/75">
          {isGuestMode
            ? "You’re viewing the limited guest experience. Upgrade to full membership to unlock streaming, downloads, profile upgrades, and the wider community."
            : "Switch between Fan, Artist, Venue, Service, and Music Pro profiles, manage memberships, and invite your team—all from one place."}
        </p>
        {isGuestMode && (
          <Button
            asChild
            className="w-fit rounded-full bg-primary px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/upgrade?type=full-fan">Upgrade to Full Membership</Link>
          </Button>
        )}
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
        <Card className="border-border/60">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Your Profiles</CardTitle>
              <CardDescription className="text-sm text-foreground/75">
                Access profile-specific tools and dashboards. Disabled options need setup.
              </CardDescription>
            </div>
            <Button asChild variant="secondary" className="rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]">
              <Link href="/profile-setup">Add a New Profile Type</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {PROFILE_LINKS.map((profile) => (
              <Card
                key={profile.key}
                className="border border-border/50 shadow-none transition hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-2">
                    {profile.badge && (
                      <Badge className="rounded-full bg-secondary px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-secondary-foreground">
                        {profile.badge}
                      </Badge>
                    )}
                    <CardTitle className="text-lg text-foreground">{profile.label}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-foreground/75">
                    {profile.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.disabled ? (
                    <Button
                      disabled
                      className="w-full rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
                    >
                      Coming Soon
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="w-full rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
                    >
                      <Link href={profile.href}>Open</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Account Snapshot</CardTitle>
            <CardDescription className="text-sm text-foreground/75">
              Quick details from your member record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground/80">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                Member
              </span>
              <span>{user?.email ?? "Unknown"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                Membership Status
              </span>
              <span>{isGuestMode ? "Guest (Limited Access)" : "Fan Member (£1/year)"}</span>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label htmlFor="invite-email" className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                Invite Admins
              </Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="Add teammate email"
                  className="rounded-full bg-input-background"
                />
                <Button
                  variant="outline"
                  className="rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
                  disabled
                >
                  Invite
                </Button>
              </div>
              <p className="text-xs text-foreground/60">
                Teammate invites will be enabled once profile admin tooling is fully integrated.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
