"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../components/ui/utils";
import { useAuth } from "../../../lib/auth-context";
import { getClient } from "../../../lib/supabase/client";

type MemberType = "fan" | "artist" | "venue" | "service" | "pro";
type AccountChoice = "guest" | "fan";
type AdditionalProfileKey = "artist" | "venue" | "service" | "pro";

const MEMBER_OPTIONS: Array<{
  type: MemberType;
  title: string;
  description: string;
}> = [
  {
    type: "fan",
    title: "Music Fan",
    description: "Start exploring, stream responsibly, and invite friends to gigs.",
  },
  {
    type: "artist",
    title: "Music Artist",
    description:
      "Record, release, perform live, and unlock specialist tools once your fan profile is set.",
  },
  {
    type: "venue",
    title: "Live Music Venue",
    description:
      "Promote shows, take bookings, and manage artists with a venue-first control panel.",
  },
  {
    type: "service",
    title: "Music Service Business",
    description:
      "List your services, accept bookings, and stay part of your customers’ journey.",
  },
  {
    type: "pro",
    title: "Music Industry Professional",
    description:
      "Offer expertise, host webinars, and build your network alongside the community.",
  },
];

const GENRE_FAMILY_OPTIONS = [
  "Country",
  "Dance / EDM",
  "Downtempo / Ambient",
  "Industrial / Gothic",
  "Jamaican",
  "Latin",
  "Metal / Punk",
  "Pop",
  "Rap / Hip-Hop",
  "Rhythm ‘N’ Blues (R&B)",
  "Rock",
  "Spiritual / Religious",
  "The Blues / Jazz",
];

const MAIN_GENRE_OPTIONS = [
  "Trance",
  "Drum ‘N’ Bass / Jungle",
  "Classic Rock",
  "Indie Pop",
  "Soul",
  "House",
  "Metal",
  "Alternative",
  "Singer-Songwriter",
  "Afrobeats",
  "Country Pop",
];

const SUB_GENRE_OPTIONS = [
  "Ibiza / Dream House-Trance",
  "Dubstep",
  "Drum ‘N’ Bass",
  "Classic Rock",
  "Synthwave",
  "Ambient House",
  "Neo-Soul",
  "Afro Fusion",
];

const PROFILE_PICTURE_BUCKET = "avatars";
const FAN_GALLERY_BUCKET = "fan-gallery";

const ADDITIONAL_PROFILE_OPTIONS: Array<{
  key: AdditionalProfileKey;
  title: string;
  description: string;
}> = [
  {
    key: "artist",
    title: "Music Artist Profile",
    description:
      "Unlock tools for releases, gigs, royalties, and crew collaboration.",
  },
  {
    key: "venue",
    title: "Music Venue Profile",
    description: "Manage bookings, publish availability, and sell tickets.",
  },
  {
    key: "service",
    title: "Music Service Profile",
    description: "Promote services, accept bookings, and join new projects.",
  },
  {
    key: "pro",
    title: "Music Industry Pro Profile",
    description:
      "Host webinars, mentor talent, and grow your professional network.",
  },
];

type FanProfilePayload = {
  accountType: "guest" | "full";
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  address: string;
  addressVisibility: string;
  phone: string;
  phoneVisibility: string;
  genreFamilies: string[];
  mainGenres: string[];
  subGenres: string[];
  preferredGenreIds: string[];
  preferredGenres: string[];
  autoTopUp: boolean;
  avatarUrl?: string;
  photoGallery?: string[];
  videoLinks?: Array<{ title: string; url: string }>;
};

const ARTIST_TYPE_OPTIONS = [
  {
    id: "type1",
    label: "Type 1: Live Gig & Original Recording Artist",
    description:
      "Record original music, perform live, sell merchandise, and take bookings.",
    subTypes: [
      "Band",
      "DJ-Producer",
      "DJ-Producers",
      "Rapper",
      "Rappers",
      "Singer-Songwriter",
      "Solo Artist",
      "Group",
      "Duo",
      "Trio",
      "Quartet",
      "Ensemble",
      "Orchestra",
      "Choir",
      "Instrumental Artist",
      "Spoken Word Artist",
      "A Cappella Group",
    ],
  },
  {
    id: "type2",
    label: "Type 2: Original Recording Artist",
    description:
      "Upload, manage, and monetise recordings with full control of metadata.",
    subTypes: [
      "Band",
      "DJ-Producer",
      "DJ-Producers",
      "Rapper",
      "Rappers",
      "Singer-Songwriter",
      "Solo Artist",
      "Group",
      "Duo",
      "Trio",
      "Quartet",
      "Ensemble",
      "Orchestra",
      "Choir",
      "Instrumental Artist",
      "Spoken Word Artist",
      "A Cappella Group",
    ],
  },
  {
    id: "type3",
    label: "Type 3: Live Gig Artist (Cover, Tribute, Classical, Theatrical)",
    description:
      "Focus on live performances of existing repertoires with gig-first tooling.",
    subTypes: [
      "Cover Band",
      "Tribute Band",
      "DJ-Entertainer",
      "Cover Rapper",
      "Tribute Rapper",
      "Cover Solo Artist",
      "Tribute Solo Artist",
      "Cover Group",
      "Tribute Group",
      "Cover Duo",
      "Tribute Duo",
      "Cover Trio",
      "Tribute Trio",
      "Cover Quartet",
      "Tribute Quartet",
      "Cover Ensemble",
      "Tribute Ensemble",
      "Orchestra",
      "Choir",
      "Cover A Cappella Group",
    ],
  },
  {
    id: "type4",
    label: "Type 4: Vocal Artist for Hire",
    description:
      "Offer vocals for recordings, live backing, and bespoke projects.",
    subTypes: [
      "All Vocals",
      "Lead Vocals",
      "Backing Vocals",
      "Session Vocalist",
      "Voiceover Artist",
    ],
  },
  {
    id: "type5",
    label: "Type 5: Instrumentalist Artist for Hire",
    description:
      "Provide instrumental performances for live shows and studio sessions.",
    subTypes: [
      "All String Instruments",
      "Banjo",
      "Bass Guitar",
      "Cello",
      "Double Bass",
      "Guitar",
      "Harp",
      "Mandolin",
      "Percussion",
      "Keyboard Instruments",
      "Electronic Instruments",
    ],
  },
  {
    id: "type6",
    label: "Type 6: Songwriter Artist for Hire",
    description:
      "Write original songs across genres with clear brief and collaboration tools.",
    subTypes: [
      "Any Genre",
      "Specific Genre (Select Main Genre)",
    ],
  },
  {
    id: "type7",
    label: "Type 7: Lyricist Artist for Hire",
    description:
      "Deliver lyrical craft for projects, collaborations, and publishing deals.",
    subTypes: [
      "Any Genre",
      "Specific Genre (Select Main Genre)",
    ],
  },
  {
    id: "type8",
    label: "Type 8: Composer Artist for Hire",
    description:
      "Compose music for recordings, media, and live performances with genre tags.",
    subTypes: [
      "Any Genre",
      "Specific Genre (Select Main Genre)",
    ],
  },
];

const VENUE_TYPE_OPTIONS = [
  {
    id: "venue1",
    label: "Type 1: Public Live Gig Music Venue – Music is Everything",
    description:
      "Host public gigs, merchandise, and private hire options straight through Gigrilla.",
    subTypes: [
      "Pub",
      "Bar",
      "Club",
      "Clubstraunt",
      "Restaurant/Bistro",
      "Night Club",
      "Members Club",
      "Hotel",
      "Holiday Resort",
    ],
  },
  {
    id: "venue2",
    label: "Type 2: Private Live Gig Music Venue – Music is Entertainment",
    description:
      "Provide performances for paying guests with private event management built in.",
    subTypes: [
      "Pub",
      "Bar",
      "Club",
      "Clubstaurant",
      "Restaurant/Bistro",
      "Night Club",
      "Members Club",
      "Hotel",
      "Holiday Resort",
      "Wedding Venue",
    ],
  },
  {
    id: "venue3",
    label: "Type 3: Dedicated Live Gig Music Venue – Music is an Event",
    description:
      "Run large-format events with detailed stage specs, capacity info, and ticketing.",
    subTypes: [
      "Arena",
      "Stadium",
      "Concert Hall",
      "Opera House",
      "Theatre",
      "Amphitheatre",
      "Bandshell / Bandstand",
      "Warehouse / Industrial Building",
    ],
  },
  {
    id: "venue4",
    label: "Type 4: Live Gig Music Festival – Music is Annual",
    description:
      "Manage seasonal or multi-location festivals with rostered bookings and merch.",
    subTypes: [
      "Annual Festival - Fixed Location",
      "Annual Festival - Roaming Location",
      "Annual Festival - Multiple Fixed Locations",
    ],
  },
  {
    id: "venue5",
    label: "Type 5: Live Gig Music Promoter – Music is Transient",
    description:
      "Coordinate events across multiple venues with promoter-first tooling.",
    subTypes: ["Promoter at Multiple Venues"],
  },
  {
    id: "venue6",
    label: "Type 6: Fan’s Live Music Gig – Private Performance, Public Venue",
    description:
      "Fans book venues and artists privately while keeping event details secure.",
    subTypes: ["Temporary Fan Event"],
  },
  {
    id: "venue7",
    label: "Type 7: Fan’s Live Music Gig – Private Performance, Own Venue",
    description:
      "Fans host artists in their own spaces with privacy and responsibility handled.",
    subTypes: ["Temporary Fan Venue"],
  },
];

const GUEST_LIMITATIONS = [
  "Free trial access without the £1 yearly membership fee.",
  "30-second previews on every track with no full streaming.",
  "No location-based search, ticketing, or merchandise purchases.",
  "Cannot interact with other members or add additional profile types.",
];

const FAN_MEMBERSHIP_BENEFITS = [
  "£1 per year keeps the platform running for the Fair Trade community.",
  "Pay-as-you-play streaming at £0.02 per spin with 100% to rights holders.",
  "Download tracks (£0.50) and albums (£4.00) to keep and play anywhere.",
  "Access GigFinder, location discovery, booking, and social interactions.",
  "Add artist, venue, service, or pro profiles whenever you are ready.",
];

interface StepDefinition {
  key:
    | "member-selector"
    | "membership"
    | "fan-account-basics"
    | "fan-profile-details"
    | "fan-music-preferences"
    | "fan-payment"
    | "fan-profile-picture"
    | "fan-photos"
    | "fan-videos"
    | "profile-add"
    | "artist-type"
    | "venue-type"
    | "service-type"
    | "pro-type"
    | "guest-summary";
  label: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function SignUpWizard() {
  const router = useRouter();
  const { signUp, checkSession, user } = useAuth();
  const [isRegistered, setIsRegistered] = useState<boolean>(() => Boolean(user));
  const [selectedMemberType, setSelectedMemberType] = useState<MemberType | null>(null);
  const [accountChoice, setAccountChoice] = useState<AccountChoice | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedExtendedProfiles, setSelectedExtendedProfiles] = useState<AdditionalProfileKey[]>([]);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [genreLookup, setGenreLookup] = useState<Map<string, string>>(new Map());
  const [genreLookupError, setGenreLookupError] = useState("");
  const [profilePictureState, setProfilePictureState] = useState<{ uploading: boolean; error: string }>({
    uploading: false,
    error: "",
  });
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [videoFormError, setVideoFormError] = useState("");

  const [fanDetails, setFanDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    username: "",
    dob: "",
    address: "",
    addressVisibility: "private",
    phone: "",
    phoneVisibility: "private",
    genreFamilies: [] as string[],
    mainGenres: [] as string[],
    subGenres: [] as string[],
    cardholderName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    autoTopUp: false,
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [fanProfile, setFanProfile] = useState({
    profilePictureName: "",
    profilePictureUrl: "",
    photos: [] as { name: string; url: string }[],
    videos: [] as { url: string; title: string }[],
    newVideoTitle: "",
    newVideoUrl: "",
  });

  const [artistSelection, setArtistSelection] = useState({
    typeId: "",
    subType: "",
  });

  const [venueSelection, setVenueSelection] = useState({
    typeId: "",
    subType: "",
  });

  const [serviceDetails, setServiceDetails] = useState({
    summary: "",
    bookingNotes: "",
    acceptsBookings: true,
    journeyIntegration: true,
  });

  const [proDetails, setProDetails] = useState({
    headline: "",
    expertise: "",
    focusAreas: "",
    hostSessions: true,
  });

  useEffect(() => {
    if (user && !isRegistered) {
      setIsRegistered(true);
    }
  }, [user, isRegistered]);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await fetch("/api/genres");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Unable to load genres");
        }
        const result: { data: Array<{ id: string; name: string }> } = await response.json();
        const map = new Map<string, string>();
        result.data?.forEach(({ id, name }) => {
          if (name) {
            map.set(name.trim().toLowerCase(), String(id));
          }
        });
        setGenreLookup(map);
        setGenreLookupError("");
      } catch (error) {
        console.warn("SignUpWizard: Failed to load genres", error);
        setGenreLookupError("Using default genres while we finish loading the catalog.");
      }
    };

    loadGenres().catch((error) => console.error(error));
  }, []);

  const baseSteps: StepDefinition[] = useMemo(() => {
    const stepsList: StepDefinition[] = [
      { key: "member-selector", label: "Member Selector" },
      { key: "membership", label: "Membership Options" },
    ];

    if (accountChoice === "guest") {
      stepsList.push({ key: "guest-summary", label: "Limited Control Panel" });
    } else {
      stepsList.push(
        { key: "fan-account-basics", label: "Account Basics" },
        { key: "fan-profile-details", label: "Fan Profile Details" },
        { key: "fan-music-preferences", label: "Music Preferences" },
        { key: "fan-payment", label: "Payment & Policies" },
        { key: "fan-profile-picture", label: "Profile Picture" },
        { key: "fan-photos", label: "Fan Photos" },
        { key: "fan-videos", label: "Fan Videos" },
        { key: "profile-add", label: "Add Profile Type" },
      );
    }

    return stepsList;
  }, [accountChoice]);

  const personaStep: StepDefinition | null = useMemo(() => {
    if (!selectedMemberType || accountChoice === "guest") return null;

    switch (selectedMemberType) {
      case "artist":
        return { key: "artist-type", label: "Choose Artist Type" };
      case "venue":
        return { key: "venue-type", label: "Choose Venue Type" };
      case "service":
        return { key: "service-type", label: "Service Blueprint" };
      case "pro":
        return { key: "pro-type", label: "Pro Blueprint" };
      default:
        return null;
    }
  }, [selectedMemberType, accountChoice]);

  const steps = useMemo(
    () => (personaStep ? [...baseSteps, personaStep] : baseSteps),
    [baseSteps, personaStep],
  );

  useEffect(() => {
    if (steps.length === 0) return;
    setStepIndex((prev) => Math.min(prev, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    if (!selectedMemberType) return;
    if (selectedMemberType === "fan") {
      setSelectedExtendedProfiles([]);
      return;
    }

    const requiredMap: Record<MemberType, AdditionalProfileKey | null> = {
      fan: null,
      artist: "artist",
      venue: "venue",
      service: "service",
      pro: "pro",
    };

    const required = requiredMap[selectedMemberType];
    if (required) {
      setSelectedExtendedProfiles((prev) =>
        prev.includes(required) ? prev : [...prev, required],
      );
    }
  }, [selectedMemberType]);

  useEffect(() => {
    if (selectedMemberType === "artist" && accountChoice !== "fan") {
      setAccountChoice("fan");
    }
  }, [selectedMemberType, accountChoice]);

  const currentStep = steps[stepIndex] ?? steps[0];
  const isLastStep = stepIndex === steps.length - 1;
  const progressValue = steps.length ? ((stepIndex + 1) / steps.length) * 100 : 0;

  const toggleFromArray = (list: string[], value: string) => {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  };

  const canProceed = () => {
    if (!currentStep) return false;

    switch (currentStep.key) {
      case "member-selector":
        return Boolean(selectedMemberType);
      case "membership":
        return Boolean(accountChoice);
      case "fan-account-basics": {
        const emailMatches = fanDetails.email === fanDetails.confirmEmail;
        const passwordsMatch = fanDetails.password === fanDetails.confirmPassword;
        return (
          fanDetails.firstName.trim() &&
          fanDetails.lastName.trim() &&
          fanDetails.email.trim() &&
          fanDetails.confirmEmail.trim() &&
          fanDetails.password.trim() &&
          fanDetails.confirmPassword.trim() &&
          emailMatches &&
          passwordsMatch
        );
      }
      case "fan-profile-details":
        return (
          fanDetails.username.trim() &&
          fanDetails.dob &&
          fanDetails.address.trim() &&
          fanDetails.phone.trim()
        );
      case "fan-music-preferences":
        return (
          fanDetails.genreFamilies.length >= 1 &&
          fanDetails.mainGenres.length >= 3
        );
      case "fan-payment":
        return (
          fanDetails.cardholderName.trim() &&
          fanDetails.cardNumber.trim() &&
          fanDetails.cardExpiry.trim() &&
          fanDetails.cardCvc.trim() &&
          fanDetails.termsAccepted &&
          fanDetails.privacyAccepted
        );
      case "fan-profile-picture":
        return Boolean(fanProfile.profilePictureUrl);
      case "fan-photos":
      case "fan-videos":
      case "profile-add":
        return true;
      case "artist-type":
        return Boolean(artistSelection.typeId);
      case "venue-type":
        return Boolean(venueSelection.typeId);
      case "service-type":
        return serviceDetails.summary.trim().length > 0;
      case "pro-type":
        return proDetails.headline.trim().length > 0;
      case "guest-summary":
        return true;
      default:
        return true;
    }
  };

  const resolveGenreIds = (genres: string[]) => {
    const ids = new Set<string>();
    genres
      .map((name) => name.trim().toLowerCase())
      .forEach((key) => {
        const id = genreLookup.get(key);
        if (id) {
          ids.add(id);
        }
      });
    return Array.from(ids);
  };

  const buildFanProfilePayload = (overrides?: Partial<FanProfilePayload>): FanProfilePayload => {
    const accountType = accountChoice === "fan" ? "full" : "guest";
    const preferredGenreIds = resolveGenreIds([
      ...fanDetails.mainGenres,
      ...fanDetails.subGenres,
    ]);
    const preferredGenres = [...fanDetails.mainGenres, ...fanDetails.subGenres];

    const basePayload: FanProfilePayload = {
      accountType,
      username: fanDetails.username.trim(),
      firstName: fanDetails.firstName.trim(),
      lastName: fanDetails.lastName.trim(),
      email: fanDetails.email.trim(),
      dateOfBirth: fanDetails.dob,
      address: fanDetails.address.trim(),
      addressVisibility: fanDetails.addressVisibility,
      phone: fanDetails.phone.trim(),
      phoneVisibility: fanDetails.phoneVisibility,
      genreFamilies: fanDetails.genreFamilies,
      mainGenres: fanDetails.mainGenres,
      subGenres: fanDetails.subGenres,
      preferredGenreIds,
      preferredGenres,
      autoTopUp: fanDetails.autoTopUp,
      avatarUrl: fanProfile.profilePictureUrl || undefined,
      photoGallery: fanProfile.photos.map((photo) => photo.url),
      videoLinks: fanProfile.videos,
    };

    return overrides ? { ...basePayload, ...overrides } : basePayload;
  };

  const saveFanProfile = async (overrides?: Partial<FanProfilePayload>) => {
    if (accountChoice !== "fan") {
      return true;
    }

    try {
      const payload = buildFanProfilePayload(overrides);
      const response = await fetch("/api/fan-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          typeof data.error === "string"
            ? data.error
            : "Unable to save your profile details right now.";
        setRegistrationError(errorMessage);
        return false;
      }

      setRegistrationError("");
      return true;
    } catch (error) {
      console.error("SignUpWizard: saveFanProfile failed", error);
      setRegistrationError("We hit a snag saving your profile. Please try again.");
      return false;
    }
  };

  const submitFanDetails = async () => {
    if (accountChoice !== "fan") {
      return true;
    }

    setRegistrationError("");

    if (!isRegistered) {
      try {
        const result = await signUp(
          fanDetails.email,
          fanDetails.password,
          fanDetails.firstName,
          fanDetails.lastName,
        );

        if (result.error) {
          setRegistrationError(result.error);
          return false;
        }

        if (result.needsEmailVerification) {
          setNeedsEmailVerification(true);
          setSignupEmail(fanDetails.email);
          return false;
        }

        setIsRegistered(true);
        await checkSession();
      } catch (error) {
        console.error("SignUpWizard: submitFanDetails signUp failed", error);
        setRegistrationError("We couldn't create your account just yet. Please try again.");
        return false;
      }
    }

    const saved = await saveFanProfile();
    return saved;
  };

  const uploadProfilePicture = async (file: File) => {
    if (!file) return;

    setProfilePictureState({ uploading: true, error: "" });

    try {
      const supabase = getClient();
      const extension = file.name.split(".").pop() || "jpg";
      const path = `fan-profile/${user?.id ?? "guest"}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_PICTURE_BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(PROFILE_PICTURE_BUCKET)
        .getPublicUrl(path);

      const publicUrl = publicUrlData?.publicUrl ?? "";

      setFanProfile((prev) => ({
        ...prev,
        profilePictureName: file.name,
        profilePictureUrl: publicUrl,
      }));

      if (publicUrl) {
        try {
          await saveFanProfile({ avatarUrl: publicUrl });
        } catch (error) {
          console.warn("SignUpWizard: Failed to store avatarUrl in fan profile", error);
        }

        if (user?.id) {
          try {
            const { error: userUpdateError } = await supabase
              .from("users")
              .update({ avatar_url: publicUrl })
              .eq("id", user.id);

            if (userUpdateError) {
              console.warn("SignUpWizard: Unable to persist avatar_url on users table", userUpdateError);
            }
          } catch (error) {
            console.warn("SignUpWizard: Unexpected error updating users table", error);
          }
        }
      }
    } catch (error) {
      console.error("SignUpWizard: uploadProfilePicture failed", error);
      setProfilePictureState({
        uploading: false,
        error: "Upload failed. Please try again.",
      });
      return;
    } finally {
      setProfilePictureState((prev) => ({ ...prev, uploading: false }));
    }
  };

  const uploadGalleryPhotos = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const supabase = getClient();
    const newPhotos: { name: string; url: string }[] = [];
    setPhotoUploadError("");

    for (const file of Array.from(fileList)) {
      try {
        const sanitisedName = file.name.replace(/\s+/g, "-");
        const path = `fan-gallery/${user?.id ?? "guest"}/${Date.now()}-${sanitisedName}`;

        const { error: uploadError } = await supabase.storage
          .from(FAN_GALLERY_BUCKET)
          .upload(path, file, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(FAN_GALLERY_BUCKET)
          .getPublicUrl(path);

        const publicUrl = publicUrlData?.publicUrl ?? "";

        if (publicUrl) {
          newPhotos.push({ name: file.name, url: publicUrl });
        }
      } catch (error) {
        console.error("SignUpWizard: uploadGalleryPhotos failed", error);
        setPhotoUploadError("One of the uploads failed. You can retry any missing photos.");
      }
    }

    if (newPhotos.length > 0) {
      setFanProfile((prev) => {
        const updated = [...prev.photos, ...newPhotos];
        void saveFanProfile({ photoGallery: updated.map((photo) => photo.url) });
        return {
          ...prev,
          photos: updated,
        };
      });
    }
  };

  const handleAddVideo = async () => {
    setVideoFormError("");
    const { newVideoTitle, newVideoUrl } = fanProfile;

    if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
      setVideoFormError("Please add both a title and a YouTube link.");
      return;
    }

    try {
      const url = new URL(newVideoUrl.trim());
      if (!url.hostname.includes("youtube.com") && !url.hostname.includes("youtu.be")) {
        setVideoFormError("Only YouTube links are supported right now.");
        return;
      }
    } catch {
      setVideoFormError("Please enter a valid YouTube URL.");
      return;
    }

    const updatedVideos = [
      ...fanProfile.videos,
      { title: newVideoTitle.trim(), url: newVideoUrl.trim() },
    ];

    setFanProfile((prev) => ({
      ...prev,
      videos: updatedVideos,
      newVideoTitle: "",
      newVideoUrl: "",
    }));
    setVideoFormError("");

    await saveFanProfile({ videoLinks: updatedVideos });
  };

  const handleRemoveVideo = async (video: { title: string; url: string }) => {
    const updatedVideos = fanProfile.videos.filter(
      (item) => !(item.title === video.title && item.url === video.url),
    );

    setFanProfile((prev) => ({
      ...prev,
      videos: updatedVideos,
    }));

    await saveFanProfile({ videoLinks: updatedVideos });
  };

  const handleNext = async () => {
    if (!currentStep || !canProceed() || isProcessingStep) {
      return;
    }

    setRegistrationError("");
    setIsProcessingStep(true);

    let stepCompleted = true;

    try {
      switch (currentStep.key) {
        case "fan-account-basics":
        case "fan-profile-details":
        case "fan-music-preferences":
        case "fan-payment": {
          stepCompleted = await submitFanDetails();
          break;
        }
        case "fan-videos": {
          stepCompleted = await saveFanProfile();
          break;
        }
        default:
          break;
      }
    } finally {
      setIsProcessingStep(false);
    }

    if (!stepCompleted) {
      return;
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const resetFlow = () => {
    setSelectedMemberType(null);
    setAccountChoice(null);
    setSelectedExtendedProfiles([]);
    setRegistrationError("");
    setNeedsEmailVerification(false);
    setIsProcessingStep(false);
    setFanDetails({
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
      username: "",
      dob: "",
      address: "",
      addressVisibility: "private",
      phone: "",
      phoneVisibility: "private",
      genreFamilies: [],
      mainGenres: [],
      subGenres: [],
      cardholderName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      autoTopUp: false,
      termsAccepted: false,
      privacyAccepted: false,
    });
    setFanProfile({
      profilePictureName: "",
      profilePictureUrl: "",
      photos: [],
      videos: [],
      newVideoTitle: "",
      newVideoUrl: "",
    });
    setProfilePictureState({ uploading: false, error: "" });
    setPhotoUploadError("");
    setVideoFormError("");
    setArtistSelection({ typeId: "", subType: "" });
    setVenueSelection({ typeId: "", subType: "" });
    setServiceDetails({
      summary: "",
      bookingNotes: "",
      acceptsBookings: true,
      journeyIntegration: true,
    });
    setProDetails({
      headline: "",
      expertise: "",
      focusAreas: "",
      hostSessions: true,
    });
    setStepIndex(0);
  };

  const renderMemberSelector = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {MEMBER_OPTIONS.map((option) => {
        const isActive = selectedMemberType === option.type;
        return (
          <Card
            key={option.type}
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedMemberType(option.type);
              setStepIndex(1);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedMemberType(option.type);
                setStepIndex(1);
              }
            }}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              isActive && "border-primary shadow-lg",
            )}
          >
            <CardHeader className="space-y-3">
              <Badge className="w-fit rounded-full bg-accent px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-accent-foreground">
                {option.type === "fan" ? "Start Here" : "Add Tooling"}
              </Badge>
              <CardTitle className="text-xl font-semibold">{option.title}</CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant={isActive ? "default" : "outline"}
                className="rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
              >
                {isActive ? "Selected" : "Choose"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderMembership = () => {
    const guestAllowed = selectedMemberType !== "artist";

    return (
      <div
        className={cn(
          "grid gap-6",
          guestAllowed ? "lg:grid-cols-2" : "max-w-xl mx-auto",
        )}
      >
        {guestAllowed && (
          <Card
            className={cn(
              "border-border/60 transition hover:-translate-y-1 hover:shadow-lg",
              accountChoice === "guest" && "border-primary shadow-lg",
            )}
          >
            <CardHeader>
              <Badge className="mb-3 w-fit rounded-full bg-accent px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-accent-foreground">
                Guest Access
              </Badge>
              <CardTitle className="text-2xl text-foreground">Proceed as Guest</CardTitle>
              <CardDescription className="text-sm text-foreground/80">
                Limited free trial with view-only access to explore the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-foreground/75">
                {GUEST_LIMITATIONS.map((item) => (
                  <li key={item} className="pl-4">
                    • {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setAccountChoice("guest")}
                variant={accountChoice === "guest" ? "default" : "outline"}
                className="mt-4 rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
              >
                {accountChoice === "guest" ? "Selected" : "Choose Guest"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card
          className={cn(
            "border-border/60 transition hover:-translate-y-1 hover:shadow-lg",
            accountChoice === "fan" && "border-primary shadow-lg",
          )}
        >
          <CardHeader>
            <Badge className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-primary">
              Full Membership
            </Badge>
            <CardTitle className="text-2xl text-foreground">Proceed as Fan</CardTitle>
            <CardDescription className="text-sm text-foreground/80">
              £1 per year membership unlocks the full Fair Trade Music experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-foreground/75">
              {FAN_MEMBERSHIP_BENEFITS.map((item) => (
                <li key={item} className="pl-4">
                  • {item}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => setAccountChoice("fan")}
              variant={accountChoice === "fan" ? "default" : "outline"}
              className="mt-4 rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
            >
              {accountChoice === "fan" ? "Selected" : "Choose Fan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFanAccountBasics = () => (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Account Basics</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            These details create your Gigrilla login and keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                value={fanDetails.firstName}
                onChange={(event) =>
                  setFanDetails((prev) => ({ ...prev, firstName: event.target.value }))
                }
                placeholder="Jamie"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last-name">Surname *</Label>
              <Input
                id="last-name"
                value={fanDetails.lastName}
                onChange={(event) =>
                  setFanDetails((prev) => ({ ...prev, lastName: event.target.value }))
                }
                placeholder="Ainsworth"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={fanDetails.email}
              onChange={(event) =>
                setFanDetails((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="jamie@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-email">Confirm Email *</Label>
            <Input
              id="confirm-email"
              type="email"
              value={fanDetails.confirmEmail}
              onChange={(event) =>
                setFanDetails((prev) => ({
                  ...prev,
                  confirmEmail: event.target.value,
                }))
              }
              placeholder="Repeat your email"
              required
            />
            {fanDetails.confirmEmail && fanDetails.confirmEmail !== fanDetails.email && (
              <p className="text-xs text-destructive">Emails must match before continuing.</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={fanDetails.password}
                onChange={(event) =>
                  setFanDetails((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="At least 9 characters inc. capital, number, special"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password *</Label>
              <Input
                id="confirm-password"
                type="password"
                value={fanDetails.confirmPassword}
                onChange={(event) =>
                  setFanDetails((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Repeat your password"
                required
              />
              {fanDetails.confirmPassword && fanDetails.confirmPassword !== fanDetails.password && (
                <p className="text-xs text-destructive">Passwords must match before continuing.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {registrationError && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {registrationError}
        </div>
      )}
    </div>
  );

  const renderFanProfileDetails = () => (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Fan Profile Details</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            These details power recommendations, safety, and profile search.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fan-username">Fan Username *</Label>
            <Input
              id="fan-username"
              value={fanDetails.username}
              onChange={(event) =>
                setFanDetails((prev) => ({ ...prev, username: event.target.value }))
              }
              placeholder="This is public & searchable"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="fan-dob">Date of Birth *</Label>
              <Input
                id="fan-dob"
                type="date"
                value={fanDetails.dob}
                onChange={(event) =>
                  setFanDetails((prev) => ({ ...prev, dob: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fan-phone">Phone Number *</Label>
              <Input
                id="fan-phone"
                value={fanDetails.phone}
                onChange={(event) =>
                  setFanDetails((prev) => ({ ...prev, phone: event.target.value }))
                }
                placeholder="+44 7123 456789"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="fan-address">Home Address *</Label>
            <Textarea
              id="fan-address"
              rows={3}
              value={fanDetails.address}
              onChange={(event) =>
                setFanDetails((prev) => ({ ...prev, address: event.target.value }))
              }
              placeholder="Used for location-based services like distance to gigs."
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="address-visibility">Address Visibility</Label>
              <Select
                value={fanDetails.addressVisibility}
                onValueChange={(value) =>
                  setFanDetails((prev) => ({ ...prev, addressVisibility: value }))
                }
              >
                <SelectTrigger id="address-visibility">
                  <SelectValue placeholder="Choose visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public & Searchable</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone-visibility">Phone Visibility</Label>
              <Select
                value={fanDetails.phoneVisibility}
                onValueChange={(value) =>
                  setFanDetails((prev) => ({ ...prev, phoneVisibility: value }))
                }
              >
                <SelectTrigger id="phone-visibility">
                  <SelectValue placeholder="Choose visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public & Searchable</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFanMusicPreferences = () => (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Music Preferences</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            Pick the genres you love so we can tailor your recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {genreLookupError && (
            <p className="text-xs text-foreground/60">{genreLookupError}</p>
          )}
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Favourite Genre Families (pick at least 1)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GENRE_FAMILY_OPTIONS.map((family) => {
                const id = `genre-family-${slugify(family)}`;
                const checked = fanDetails.genreFamilies.includes(family);
                return (
                  <div key={family} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() =>
                        setFanDetails((prev) => ({
                          ...prev,
                          genreFamilies: toggleFromArray(prev.genreFamilies, family),
                        }))
                      }
                    />
                    <Label htmlFor={id} className="text-sm font-medium">
                      {family}
                    </Label>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Favourite Main Genres (pick at least 3)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {MAIN_GENRE_OPTIONS.map((genre) => {
                const id = `main-genre-${slugify(genre)}`;
                const checked = fanDetails.mainGenres.includes(genre);
                return (
                  <div key={genre} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() =>
                        setFanDetails((prev) => ({
                          ...prev,
                          mainGenres: toggleFromArray(prev.mainGenres, genre),
                        }))
                      }
                    />
                    <Label htmlFor={id} className="text-sm font-medium">
                      {genre}
                    </Label>
                  </div>
                );
              })}
            </div>
            {fanDetails.mainGenres.length > 0 && (
              <p className="mt-2 text-xs text-foreground/60">
                Selected: {fanDetails.mainGenres.join(", ")}
              </p>
            )}
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Optional Sub-Genres
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUB_GENRE_OPTIONS.map((sub) => {
                const id = `sub-genre-${slugify(sub)}`;
                const checked = fanDetails.subGenres.includes(sub);
                return (
                  <div key={sub} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() =>
                        setFanDetails((prev) => ({
                          ...prev,
                          subGenres: toggleFromArray(prev.subGenres, sub),
                        }))
                      }
                    />
                    <Label htmlFor={id} className="text-sm font-medium">
                      {sub}
                    </Label>
                  </div>
                );
              })}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );

  const renderFanPayment = () => (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Payment & Policies</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            Secure billing unlocks streaming, downloads, gigs, and membership renewal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cardholder-name">Cardholder Name *</Label>
            <Input
              id="cardholder-name"
              value={fanDetails.cardholderName}
              onChange={(event) =>
                setFanDetails((prev) => ({
                  ...prev,
                  cardholderName: event.target.value,
                }))
              }
              placeholder="Name as shown on card"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="card-number">Card Number *</Label>
              <Input
                id="card-number"
                value={fanDetails.cardNumber}
                onChange={(event) =>
                  setFanDetails((prev) => ({
                    ...prev,
                    cardNumber: event.target.value,
                  }))
                }
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="card-expiry">Expiry (MM/YY) *</Label>
              <Input
                id="card-expiry"
                value={fanDetails.cardExpiry}
                onChange={(event) =>
                  setFanDetails((prev) => ({
                    ...prev,
                    cardExpiry: event.target.value,
                  }))
                }
                placeholder="09/28"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="card-cvc">CVC *</Label>
              <Input
                id="card-cvc"
                value={fanDetails.cardCvc}
                onChange={(event) =>
                  setFanDetails((prev) => ({
                    ...prev,
                    cardCvc: event.target.value,
                  }))
                }
                placeholder="123"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="auto-top-up"
              checked={fanDetails.autoTopUp}
              onCheckedChange={(state) =>
                setFanDetails((prev) => ({
                  ...prev,
                  autoTopUp: state === true,
                }))
              }
            />
            <Label htmlFor="auto-top-up" className="text-sm font-medium">
              Enable automatic music credit top-ups from the Control Panel
            </Label>
          </div>
          <div className="space-y-3 text-sm text-foreground/75">
            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-terms"
                checked={fanDetails.termsAccepted}
                onCheckedChange={(state) =>
                  setFanDetails((prev) => ({
                    ...prev,
                    termsAccepted: state === true,
                  }))
                }
              />
              <Label htmlFor="accept-terms" className="leading-relaxed">
                I have read and understood the{' '}
                <Link href="#" className="text-primary underline-offset-4 hover:underline">
                  Gigrilla Terms &amp; Conditions of Membership
                </Link>
                .
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="accept-privacy"
                checked={fanDetails.privacyAccepted}
                onCheckedChange={(state) =>
                  setFanDetails((prev) => ({
                    ...prev,
                    privacyAccepted: state === true,
                  }))
                }
              />
              <Label htmlFor="accept-privacy" className="leading-relaxed">
                I have read and understood the{' '}
                <Link href="#" className="text-primary underline-offset-4 hover:underline">
                  Gigrilla Members Privacy &amp; Payment Policy
                </Link>
                .
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFanProfilePicture = () => (
    <div className="mx-auto w-full max-w-3xl">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Upload Your Fan Profile Picture *</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            This is the minimum requirement to publish your fan profile. You can change it later from the Control Panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fan-profile-picture">Profile Picture</Label>
            <Input
              id="fan-profile-picture"
              type="file"
              accept="image/*"
              disabled={profilePictureState.uploading}
              onChange={async (event) => {
                const file = event.target.files?.[0] || null;
                if (file) {
                  await uploadProfilePicture(file);
                  try {
                    event.target.value = "";
                  } catch {
                    // ignore reset errors
                  }
                }
              }}
            />
            <p className="text-xs text-foreground/60">
              Upload a square image for best results (JPG, PNG, or WebP).
            </p>
            {profilePictureState.uploading && (
              <p className="text-xs text-primary">Uploading image…</p>
            )}
            {profilePictureState.error && (
              <p className="text-xs text-destructive">{profilePictureState.error}</p>
            )}
          </div>
          {fanProfile.profilePictureUrl && (
            <div className="flex flex-col gap-2 rounded-xl border border-border/40 bg-white/60 p-3">
              <p className="text-xs font-semibold text-foreground/70">Current profile image</p>
              <Image
                src={fanProfile.profilePictureUrl}
                alt="Fan profile"
                width={128}
                height={128}
                unoptimized
                className="h-32 w-32 rounded-full object-cover"
              />
              <p className="text-xs text-foreground/60">{fanProfile.profilePictureName}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderFanPhotos = () => (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Add Fan Photos (Optional)</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            Bring your profile to life with photos. You can skip this now and add them later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fan-photos">Upload Photos</Label>
            <Input
              id="fan-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={async (event) => {
                await uploadGalleryPhotos(event.target.files);
                try {
                  event.target.value = "";
                } catch {
                  // ignore reset errors
                }
              }}
            />
            <p className="text-xs text-foreground/60">
              Drag &amp; drop images or upload from your device (JPG, PNG, WebP).
            </p>
            {photoUploadError && (
              <p className="text-xs text-destructive">{photoUploadError}</p>
            )}
          </div>
          {fanProfile.photos.length > 0 && (
            <div className="space-y-3 text-xs text-foreground/70">
              <p className="font-semibold">
                Uploaded photos ({fanProfile.photos.length})
              </p>
              <ul className="space-y-2">
                {fanProfile.photos.map((photo) => (
                  <li
                    key={`${photo.url}-${photo.name}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-white/60 px-3 py-2"
                  >
                    <span className="truncate">{photo.name}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={photo.url}
                        target="_blank"
                        className="text-xs text-primary underline-offset-4 hover:underline"
                      >
                        View
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs uppercase tracking-[0.18em]"
                        onClick={async () => {
                          const updated = fanProfile.photos.filter((item) => item.url !== photo.url);
                          setFanProfile((prev) => ({
                            ...prev,
                            photos: updated,
                          }));
                          await saveFanProfile({ photoGallery: updated.map((item) => item.url) });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs uppercase tracking-[0.2em] text-foreground/60">
        Photos can be managed anytime from your Control Panel.
      </p>
    </div>
  );

  const renderFanVideos = () => (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Add Fan Videos (Optional)</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            Showcase favourite performances or playlists using YouTube links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                value={fanProfile.newVideoTitle}
                onChange={(event) =>
                  setFanProfile((prev) => ({ ...prev, newVideoTitle: event.target.value }))
                }
                placeholder="e.g. Live at Camden Assembly"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-url">YouTube Link</Label>
              <Input
                id="video-url"
                value={fanProfile.newVideoUrl}
                onChange={(event) =>
                  setFanProfile((prev) => ({ ...prev, newVideoUrl: event.target.value }))
                }
                placeholder="https://youtu.be/..."
                type="url"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
              onClick={handleAddVideo}
            >
              Add Video
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
              onClick={() => {
                setFanProfile((prev) => ({
                  ...prev,
                  newVideoTitle: "",
                  newVideoUrl: "",
                }));
                setVideoFormError("");
              }}
            >
              Clear Fields
            </Button>
          </div>
          {videoFormError && (
            <p className="text-xs text-destructive">{videoFormError}</p>
          )}
          {fanProfile.videos.length > 0 && (
            <div className="space-y-3 text-xs text-foreground/70">
              <p className="font-semibold">Added Videos</p>
              <ul className="space-y-2">
                {fanProfile.videos.map((video) => (
                  <li
                    key={`${video.title}-${video.url}`}
                    className="flex flex-col gap-1 rounded-xl border border-border/40 bg-white/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <span className="font-semibold">{video.title}</span>
                      <Link
                        href={video.url}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {video.url}
                      </Link>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="self-start text-xs uppercase tracking-[0.18em] sm:self-auto"
                      onClick={() => handleRemoveVideo(video)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs uppercase tracking-[0.2em] text-foreground/60">
        Videos can be added or edited anytime from your Control Panel.
      </p>
    </div>
  );

  const renderProfileAdder = () => (
    <div className="space-y-6">
      <p className="text-sm text-foreground/70">
        You can add additional profile types now or later from your Control Panel. Switching
        between fan and extended profiles is always available via the “Switch Profile”
        control.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ADDITIONAL_PROFILE_OPTIONS.map((option) => {
          const isSelected = selectedExtendedProfiles.includes(option.key);
          return (
            <Card
              key={option.key}
              role="button"
              tabIndex={0}
              onClick={() =>
                setSelectedExtendedProfiles((prev) =>
                  prev.includes(option.key)
                    ? prev.filter((item) => item !== option.key)
                    : [...prev, option.key],
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedExtendedProfiles((prev) =>
                    prev.includes(option.key)
                      ? prev.filter((item) => item !== option.key)
                      : [...prev, option.key],
                  );
                }
              }}
              className={cn(
                "cursor-pointer border border-border/60 transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isSelected && "border-primary shadow-lg",
              )}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded border",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border bg-white",
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <span className="size-2 rounded-full bg-white" />}
                  </span>
                  <CardTitle className="text-lg text-foreground">
                    {option.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-foreground/75">
                  {option.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderArtistType = () => (
    <div className="space-y-6">
      <p className="text-sm text-foreground/75">
        Artists choose the workflow that fits how they create, perform, and collaborate.
        Start with the type that best represents you—you can always add more later.
      </p>
      <RadioGroup
        value={artistSelection.typeId}
        onValueChange={(value) => setArtistSelection({ typeId: value, subType: "" })}
        className="space-y-4"
      >
        {ARTIST_TYPE_OPTIONS.map((option) => {
          const isActive = artistSelection.typeId === option.id;
          return (
            <Card
              key={option.id}
              className={cn(
                "border border-border/60 transition hover:border-primary/50",
                isActive && "border-primary shadow-lg",
              )}
            >
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={option.id}
                    id={`artist-type-${option.id}`}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`artist-type-${option.id}`} className="text-base font-semibold">
                      {option.label}
                    </Label>
                    <CardDescription className="text-sm text-foreground/75">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Choose a sub-type (optional)
                </Label>
                <Select
                  value={isActive ? artistSelection.subType : ""}
                  onValueChange={(value) =>
                    setArtistSelection((prev) => ({ ...prev, subType: value }))
                  }
                  disabled={!isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-type" />
                  </SelectTrigger>
                  <SelectContent>
                    {option.subTypes.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );

  const renderVenueType = () => (
    <div className="space-y-6">
      <p className="text-sm text-foreground/75">
        Venue profiles adapt to how you host events—public, private, dedicated, seasonal,
        or fan-driven. Select the structure that best reflects your operations.
      </p>
      <RadioGroup
        value={venueSelection.typeId}
        onValueChange={(value) => setVenueSelection({ typeId: value, subType: "" })}
        className="space-y-4"
      >
        {VENUE_TYPE_OPTIONS.map((option) => {
          const isActive = venueSelection.typeId === option.id;
          return (
            <Card
              key={option.id}
              className={cn(
                "border border-border/60 transition hover:border-primary/50",
                isActive && "border-primary shadow-lg",
              )}
            >
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={option.id}
                    id={`venue-type-${option.id}`}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`venue-type-${option.id}`} className="text-base font-semibold">
                      {option.label}
                    </Label>
                    <CardDescription className="text-sm text-foreground/75">
                      {option.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                  Choose a sub-type (optional)
                </Label>
                <Select
                  value={isActive ? venueSelection.subType : ""}
                  onValueChange={(value) =>
                    setVenueSelection((prev) => ({ ...prev, subType: value }))
                  }
                  disabled={!isActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-type" />
                  </SelectTrigger>
                  <SelectContent>
                    {option.subTypes.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );

  const renderServiceBlueprint = () => (
    <div className="space-y-6">
      <p className="text-sm text-foreground/75">
        Music service businesses can publish offerings, collaborate with teams, and stay
        embedded across the customer journey. Provide a short overview to get started.
      </p>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Service Overview *</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            Describe the services you provide so artists, venues, and fans can find you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="service-summary">Business Summary *</Label>
            <Textarea
              id="service-summary"
              rows={4}
              value={serviceDetails.summary}
              onChange={(event) =>
                setServiceDetails((prev) => ({
                  ...prev,
                  summary: event.target.value,
                }))
              }
              placeholder="Explain what you offer, who you work with, and any specialisations."
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="service-booking-notes">Booking Preferences</Label>
            <Textarea
              id="service-booking-notes"
              rows={3}
              value={serviceDetails.bookingNotes}
              onChange={(event) =>
                setServiceDetails((prev) => ({
                  ...prev,
                  bookingNotes: event.target.value,
                }))
              }
              placeholder="Include turnaround times, collaboration requirements, or location specifics."
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="service-accepts-bookings"
                checked={serviceDetails.acceptsBookings}
                onCheckedChange={(state) =>
                  setServiceDetails((prev) => ({
                    ...prev,
                    acceptsBookings: state === true,
                  }))
                }
              />
              <Label htmlFor="service-accepts-bookings" className="text-sm font-medium">
                Allow clients to request and confirm bookings directly through Gigrilla
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="service-journey"
                checked={serviceDetails.journeyIntegration}
                onCheckedChange={(state) =>
                  setServiceDetails((prev) => ({
                    ...prev,
                    journeyIntegration: state === true,
                  }))
                }
              />
              <Label htmlFor="service-journey" className="text-sm font-medium">
                Be part of your customers&apos; journey (attach workflows to artist, venue, and
                pro profiles you collaborate with)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProBlueprint = () => (
    <div className="space-y-6">
      <p className="text-sm text-foreground/75">
        Music industry professionals gain tools for sharing expertise, delivering sessions,
        and managing client work. Provide headline information to shape your profile.
      </p>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Professional Details *</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            Outline your specialisms so the community knows how to engage with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="pro-headline">Headline *</Label>
            <Input
              id="pro-headline"
              value={proDetails.headline}
              onChange={(event) =>
                setProDetails((prev) => ({
                  ...prev,
                  headline: event.target.value,
                }))
              }
              placeholder="e.g. Music Lawyer & Rights Specialist"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pro-expertise">Expertise *</Label>
            <Textarea
              id="pro-expertise"
              rows={3}
              value={proDetails.expertise}
              onChange={(event) =>
                setProDetails((prev) => ({
                  ...prev,
                  expertise: event.target.value,
                }))
              }
              placeholder="Summarise your experience, clients, and areas of focus."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pro-focus-areas">Focus Areas</Label>
            <Textarea
              id="pro-focus-areas"
              rows={3}
              value={proDetails.focusAreas}
              onChange={(event) =>
                setProDetails((prev) => ({
                  ...prev,
                  focusAreas: event.target.value,
                }))
              }
              placeholder="Describe the types of artists, venues, or services you typically support."
            />
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="pro-host-sessions"
              checked={proDetails.hostSessions}
              onCheckedChange={(state) =>
                setProDetails((prev) => ({
                  ...prev,
                  hostSessions: state === true,
                }))
              }
            />
            <Label htmlFor="pro-host-sessions" className="text-sm font-medium">
              I plan to host webinars, live sessions, or consultations through Gigrilla
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGuestSummary = () => (
    <div className="space-y-4 text-sm text-foreground/75">
      <p>
        You can explore Gigrilla as a Guest right away. When you&apos;re ready to unlock streaming,
        downloads, and upgraded profiles, return to the Control Panel to convert to full
        membership for £1.00 per year.
      </p>
      <p className="text-foreground/70">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Log in here
        </Link>{" "}
        to continue.
      </p>
    </div>
  );

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.key) {
      case "member-selector":
        return renderMemberSelector();
      case "membership":
        return renderMembership();
      case "fan-account-basics":
        return renderFanAccountBasics();
      case "fan-profile-details":
        return renderFanProfileDetails();
      case "fan-music-preferences":
        return renderFanMusicPreferences();
      case "fan-payment":
        return renderFanPayment();
      case "fan-profile-picture":
        return renderFanProfilePicture();
      case "fan-photos":
        return renderFanPhotos();
      case "fan-videos":
        return renderFanVideos();
      case "profile-add":
        return renderProfileAdder();
      case "artist-type":
        return renderArtistType();
      case "venue-type":
        return renderVenueType();
      case "service-type":
        return renderServiceBlueprint();
      case "pro-type":
        return renderProBlueprint();
      case "guest-summary":
        return renderGuestSummary();
      default:
        return null;
    }
  };

  const canAdvance = canProceed();

  if (needsEmailVerification) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="space-y-3">
          <p className="uppercase tracking-[0.35em] text-[0.7rem] text-foreground-alt/70">
            Verify Your Email
          </p>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Check your inbox to continue
          </h1>
          <p className="text-sm text-foreground/75">
            We&apos;ve sent a verification link to <span className="font-semibold">{signupEmail}</span>.
            Confirm your email, then log in to finish setting up your Fan profile.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button
            onClick={() => router.push("/login")}
            className="w-full rounded-full bg-primary px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
          >
            Go to Login
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setNeedsEmailVerification(false);
              setIsProcessingStep(false);
            }}
            className="w-full rounded-full px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
          >
            Back to Sign-up
          </Button>
        </div>
        <p className="text-xs text-foreground/60">
          Didn&apos;t get an email? Double-check your spam folder, or wait a few minutes and try
          again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 sm:py-16">
      <header className="space-y-3 text-center sm:text-left">
        <p className="uppercase tracking-[0.35em] text-[0.7rem] text-foreground-alt/70">
          Sign-up Journey
        </p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Build Your Gigrilla Membership
        </h1>
        <p className="max-w-3xl text-sm text-foreground/75">
          Every member starts as a Fan. From there you can add Artist, Venue, Music Service, or
          Music Pro profiles, invite your team, and manage everything inside the Control
          Panel.
        </p>
      </header>

      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-2 text-xs uppercase tracking-[0.2em] text-foreground/60 sm:flex-row sm:items-center">
            <span>
              Step {stepIndex + 1} of {steps.length}: {currentStep?.label}
            </span>
            <button
              type="button"
              onClick={resetFlow}
              className="text-primary underline-offset-4 hover:underline"
            >
              Start over
            </button>
          </div>
          <Progress value={progressValue} />
        </div>

        <div className="rounded-3xl border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur">
          {renderStepContent()}
        </div>
      </div>

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">
          Need help?{" "}
          <Link href="/contact-details" className="text-primary underline-offset-4 hover:underline">
            Speak to the Gigrilla team
          </Link>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            onClick={handleBack}
            variant="outline"
            className="rounded-full px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
            disabled={stepIndex === 0}
          >
            Back
          </Button>
          {isLastStep ? (
            <Button
              onClick={() => {
                if (!canAdvance) return;
                const target =
                  accountChoice === "guest"
                    ? "/control-panel?mode=guest"
                    : "/control-panel";
                router.push(target);
              }}
              disabled={!canAdvance}
              variant="secondary"
              className="rounded-full px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
            >
              {accountChoice === "guest" ? "Explore as Guest" : "Go to Control Panel"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canAdvance || isProcessingStep}
              className="rounded-full bg-primary px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90 disabled:bg-primary/40 disabled:text-primary-foreground/60"
            >
              {isProcessingStep ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </span>
              ) : (
                "Next"
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
