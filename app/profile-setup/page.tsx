"use client";

import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { ArrowLeft, Music, Building2, Briefcase, Users, Palette, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";

const profileTypes = [
  {
    id: 'artist',
    title: 'Music Artist Profile',
    description: 'Unlock tools for releases, gigs, royalties, and crew collaboration.',
    icon: Music,
    accentClass: 'bg-primary/10 text-primary',
    path: '/artist-setup'
  },
  {
    id: 'venue',
    title: 'Music Venue Profile',
    description: 'Manage bookings, publish availability, and sell tickets.',
    icon: Building2,
    accentClass: 'bg-secondary/10 text-secondary',
    path: '/venue-setup'
  },
  {
    id: 'music-service',
    title: 'Music Service Profile',
    description: 'Promote services, accept bookings, and join new projects.',
    icon: Briefcase,
    accentClass: 'bg-emerald-100 text-emerald-700',
    path: '/music-service-setup'
  },
  {
    id: 'industry-pro',
    title: 'Music Industry Pro Profile',
    description: 'Host webinars, mentor talent, and grow your professional network.',
    icon: Users,
    accentClass: 'bg-orange-100 text-orange-700',
    path: '/industry-pro-setup'
  },
  {
    id: 'creative',
    title: 'Creative Professional Profile',
    description: 'Offer design, photography, media, or other creative services.',
    icon: Palette,
    accentClass: 'bg-indigo-100 text-indigo-700',
    path: '/creative-setup'
  },
  {
    id: 'merchant',
    title: 'Merchandise Seller Profile',
    description: 'Sell merchandise, tickets, and music-related products.',
    icon: ShoppingBag,
    accentClass: 'bg-teal-100 text-teal-700',
    path: '/merchant-setup'
  }
];

export default function ProfileSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasArtistProfile, setHasArtistProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check if user has an artist profile
  useEffect(() => {
    const checkArtistProfile = async () => {
      if (!user) return;

      try {
        console.log('ProfileSetup: Checking if user has artist profile...');
        const response = await fetch('/api/artist-profile');
        const result = await response.json();

        console.log('ProfileSetup: Artist profile API response:', {
          status: response.status,
          data: result.data,
          error: result.error,
          message: result.message
        });

        if (result.data) {
          console.log('ProfileSetup: User has artist profile, setting state to true');
          setHasArtistProfile(true);
        } else {
          console.log('ProfileSetup: User has no artist profile, setting state to false');
          setHasArtistProfile(false);
        }
      } catch (error) {
        console.error('ProfileSetup: Error checking artist profile:', error);
        setHasArtistProfile(false);
      }
    };

    checkArtistProfile();
  }, [user]);

  const handleProfileAction = (profile: typeof profileTypes[number]) => {
    console.log('ProfileSetup: Button clicked for profile:', profile.id);
    console.log('ProfileSetup: hasArtistProfile state:', hasArtistProfile);

    if (profile.id === 'artist') {
      if (hasArtistProfile) {
        console.log('ProfileSetup: User has artist profile, navigating to dashboard');
        router.push('/artist-dashboard?section=home');
      } else {
        console.log('ProfileSetup: User has no artist profile, starting onboarding...');
        router.push('/signup?onboarding=artist');
      }
      return;
    }

    if (profile.id === 'venue') {
      console.log('ProfileSetup: Starting venue onboarding...');
      router.push('/signup?onboarding=venue');
      return;
    }

    if (profile.id === 'music-service') {
      console.log('ProfileSetup: Starting service onboarding...');
      router.push('/signup?onboarding=service');
      return;
    }

    if (profile.id === 'industry-pro') {
      console.log('ProfileSetup: Starting pro onboarding...');
      router.push('/signup?onboarding=pro');
      return;
    }

    console.log('ProfileSetup: Navigating to setup page for:', profile.id);
    router.push(profile.path);
  };

  const getProfileCta = (profile: typeof profileTypes[number]) => {
    if (profile.id === 'artist' && hasArtistProfile === null) return 'Checking...';
    if (profile.id === 'artist' && hasArtistProfile === true) return 'Go to Artist Dashboard';
    return `Create ${profile.title}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-center">
        <div className="space-y-4">
          <p className="uppercase tracking-[0.35em] text-[0.7rem] text-foreground-alt/70">
            Loading Profile Options
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="size-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-foreground/70">Preparing your profile switcher...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 bg-background px-6 py-12 sm:px-10 sm:py-16">
      <header className="space-y-5 text-center sm:text-left">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="uppercase tracking-[0.35em] text-[0.7rem] text-foreground-alt/70">
            Profile Switcher
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/fan-dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground transition hover:border-primary/50 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to FAN Dashboard
            </Link>
            <Link
              href="/artist-dashboard?section=home"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground transition hover:border-primary/50 hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to ARTIST Dashboard
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Switch Profile</h1>
          <p className="max-w-3xl text-sm text-foreground/75">
            Create and manage your different Gigrilla profile types. Your fan profile stays active,
            and artist users can jump straight back into the current Artist Dashboard.
          </p>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Choose a profile type</h2>
            <p className="text-sm text-foreground/70">
              Switch to an existing dashboard or start onboarding for another account type.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profileTypes.map((profile) => {
            const IconComponent = profile.icon;
            return (
              <Card
                key={profile.id}
                className="group border border-border/60 bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", profile.accentClass)}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg text-foreground transition group-hover:text-primary">
                        {profile.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm text-foreground/75">
                        {profile.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    className="w-full rounded-full bg-primary px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90 disabled:bg-primary/40 disabled:text-primary-foreground/60"
                    disabled={profile.id === 'artist' && hasArtistProfile === null}
                    onClick={() => handleProfileAction(profile)}
                  >
                    {getProfileCta(profile)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-4 text-sm text-foreground/75 md:grid-cols-2">
          <div>
            <h3 className="mb-1 text-base font-bold text-foreground">Multiple Profiles</h3>
            <p>
              Each profile has its own dashboard, settings, and tools for that role.
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold text-foreground">Easy Switching</h3>
            <p>
              Use the dashboard buttons above to move directly between your fan and artist workspaces.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
