"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Download } from "lucide-react";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
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
      "List your services, accept bookings, and stay part of your customers' journey.",
  },
  {
    type: "pro",
    title: "Music Industry Professional",
    description:
      "Offer expertise, host webinars, and build your network alongside the community.",
  },
];

// Genre types for TypeScript
type GenreFamily = {
  id: string;
  name: string;
  mainGenres: GenreType[];
};

type GenreType = {
  id: string;
  name: string;
  familyId: string;
  subGenres: GenreSubtype[];
};

type GenreSubtype = {
  id: string;
  name: string;
  typeId: string;
};

// Fallback defaults (used while loading)
const DEFAULT_GENRE_FAMILIES = [
  "Country Music",
  "Dance & EDM Music",
  "Rock Music",
  "Pop Music",
  "Hip-Hop & Rap Music",
];

const DEFAULT_MAIN_GENRES = [
  "Classic Rock",
  "Indie Pop",
  "House",
  "Metal",
  "Alternative",
];

const DEFAULT_SUB_GENRES = [
  "Progressive Metal",
  "Synthwave",
  "Ambient House",
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
  onboardingCompleted?: boolean;
};

type VoiceDescriptor = {
  id: string;
  label: string;
  description: string;
};

type ArtistTypeOption = {
  id: string;
  label: string;
  description: string;
  subTypes?: string[];
  vocalCategories?: Record<string, string[]>;
  soundBasedVoiceDescriptors?: VoiceDescriptor[];
  genreBasedVoiceDescriptors?: VoiceDescriptor[];
  instrumentCategories?: Record<string, string[]>;
  songwriterOptions?: string[];
  lyricistOptions?: string[];
  composerOptions?: string[];
  genreSelection?: {
    allowMultiple: boolean;
    description: string;
  };
  availabilityOptions?: string[];
};

const ARTIST_TYPE_OPTIONS: ArtistTypeOption[] = [
  {
    id: "type1",
    label: "Type 1: Live Gig & Original Recording Artist",
    description:
      "I/we record original music (and licensed covers). I/we perform my/our original music at live Gigs. Venues and Fans can hire me/us for live Gigs through Gigrilla. Fans can buy tickets to my/our gigs on Gigrilla. You can buy my/our merchandise on Gigrilla.",
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
      "I/we record original music (and licensed covers). You can stream and buy my/our music on Gigrilla. You can buy my/our merchandise on Gigrilla.",
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
    label: "Type 3: Live Gig Artist (Cover; Tribute; Classical; Theatrical)",
    description:
      "I/we do not record original music or licensed covers. I/we perform other people's music at live gigs. You can hire me/us for live gigs through Gigrilla. You can buy tickets to my/our gigs on Gigrilla. You can buy my/our merchandise on Gigrilla.",
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
    label: "Type 4: Vocalist for Hire",
    description:
      "I sing guest and featuring vocals, live backing vocals, and recording session vocals.",
    soundBasedVoiceDescriptors: [
      { id: "ballad", label: "Ballad Voice", description: "Smooth and controlled, ideal for slow, emotional songs." },
      { id: "breathy", label: "Breathy Voice", description: "Soft and airy, creating a sense of intimacy and subtlety." },
      { id: "bright", label: "Bright Voice", description: "Clear and vibrant, often used in upbeat and pop-style songs." },
      { id: "classical-baritone", label: "Classical Baritone Voice", description: "Warm and robust, often used in operatic and classical music settings." },
      { id: "classical-bass", label: "Classical Bass Voice", description: "Deep and resonant, the lowest of male voices with a commanding presence." },
      { id: "classical-contralto", label: "Classical Contralto Voice", description: "The lowest female voice, rich and full, often used in classical and opera." },
      { id: "classical-countertenor", label: "Classical Countertenor Voice", description: "A male voice that uses falsetto to reach higher registers, common in Baroque music." },
      { id: "classical-mezzo-soprano", label: "Classical Mezzo-Soprano Voice", description: "Slightly lower than soprano, versatile with a rich tone, used in opera." },
      { id: "classical-soprano", label: "Classical Soprano Voice", description: "The highest female voice, pure and powerful, often leading in operas." },
      { id: "classical-tenor", label: "Classical Tenor Voice", description: "High male voice, bright and powerful, commonly a lead in operas." },
      { id: "coloratura", label: "Coloratura Voice", description: "Highly agile, capable of rapid vocal runs and elaborate ornamentation." },
      { id: "deep-bassy", label: "Deep Bassy Voice", description: "Very low and resonant, enriching the lower register with depth." },
      { id: "dramatic", label: "Dramatic Voice", description: "Capable of a wide range of dynamics and emotional expressions, suitable for powerful roles." },
      { id: "edgy", label: "Edgy Voice", description: "Has a sharp, biting quality, cutting through other sounds with a modern twist." },
      { id: "emotional", label: "Emotional Voice", description: "Highly expressive, conveying a wide array of feelings and nuances." },
      { id: "ethereal", label: "Ethereal Voice", description: "Light and otherworldly, often with a dreamlike, floating quality." },
      { id: "gritty", label: "Gritty Voice", description: "Rough and textured, associated with rock and blues genres." },
      { id: "haunting", label: "Haunting Voice", description: "Memorable and evocative, often leaving a lasting emotional impact." },
      { id: "high-pitched", label: "High Pitched Voice", description: "Naturally high, clear, and capable of piercing through complex soundscapes." },
      { id: "husky", label: "Husky Voice", description: "Slightly rough and low, often perceived as warm and intimate." },
      { id: "lyric", label: "Lyric Voice", description: "Flowing and melodious, ideal for delivering smooth and beautiful melodies." },
      { id: "mellow", label: "Mellow Voice", description: "Soft and well-modulated, producing a smooth, pleasant sound." },
      { id: "nasal", label: "Nasal Voice", description: "Distinct resonance in the nasal cavities, giving a unique vocal colour." },
      { id: "powerful", label: "Powerful Voice", description: "Loud and strong, able to dominate a performance with its robustness." },
      { id: "raspy", label: "Raspy Voice", description: "Gravelly and textured, adding a raw and emotional edge to the performance." },
      { id: "resonant", label: "Resonant Voice", description: "Vibrant and echoing, often enriching the music with its depth of sound." },
      { id: "robust", label: "Robust Voice", description: "Full-bodied and strong, ideal for roles requiring a commanding vocal presence." },
      { id: "silky", label: "Silky Voice", description: "Smooth and gentle, effortlessly flowing across notes with a sleek sound." },
      { id: "smoky", label: "Smoky Voice", description: "Sultry and husky, often used in jazz and blues for a textured tone." },
      { id: "soft", label: "Soft Voice", description: "Gentle and soothing, easy on the ears and calming." },
      { id: "soulful", label: "Soulful Voice", description: "Rich in tone and deep in emotion, conveying a sense of soul and depth." },
      { id: "velvety", label: "Velvety Voice", description: "Luxuriously smooth and rich, offering a comforting and warm sound." },
      { id: "vibrato", label: "Vibrato Voice", description: "Characterized by a consistent pulsating change of pitch and used to add expression to vocal music." },
      { id: "warm", label: "Warm Voice", description: "Inviting and comforting, often with a rich timber." },
      { id: "whimsical", label: "Whimsical Voice", description: "Playful and light, often with a quirky and charming quality." }
    ],
    genreBasedVoiceDescriptors: [
      { id: "a-cappella", label: "A Cappella Voice", description: "Performs without instrumental accompaniment, focusing on vocal harmonies." },
      { id: "alternative", label: "Alternative Voice", description: "Distinct and often unconventional, typically found in alternative rock and indie genres." },
      { id: "arabic", label: "Arabic Voice", description: "Melodic and intricate, often using microtonal variations and complex ornaments." },
      { id: "blues", label: "Blues Voice", description: "Expressive and soulful, ideal for conveying the emotional depth of blues music." },
      { id: "bhangra", label: "Bhangra Voice", description: "Energetic and rhythmic, characteristic of Punjabi music, often featuring vibrant, high-energy vocals." },
      { id: "bossa-nova", label: "Bossa Nova Voice", description: "Smooth and soft, with a lyrical style characteristic of Brazilian music." },
      { id: "choral", label: "Choral Voice", description: "Suited for ensemble singing; blends well in group performances, often classical or religious." },
      { id: "classical-crossover", label: "Classical Crossover Voice", description: "Combines classical singing techniques with modern styles, accessible to a wide audience." },
      { id: "country", label: "Country Voice", description: "Characteristically warm, often with a noticeable twang, suited for storytelling." },
      { id: "electronic", label: "Electronic Voice", description: "Versatile and can include electronically altered or synthesized vocal tones." },
      { id: "enka", label: "Enka Voice", description: "Emotional and melodramatic, characteristic of Japanese Enka music." },
      { id: "fado", label: "Fado Voice", description: "Rich and mournful, typical of Portuguese traditional music." },
      { id: "flamenco", label: "Flamenco Voice", description: "Intense and passionate, characteristic of Spanish Flamenco." },
      { id: "folk", label: "Folk Voice", description: "Earthy and sincere, often associated with storytelling and acoustic instrumentation." },
      { id: "gospel", label: "Gospel Voice", description: "Dynamic and powerful, capable of expressive and emotive performances." },
      { id: "gregorian-chant", label: "Gregorian Chant Voice", description: "Monophonic and sacred, typical of traditional Christian chants." },
      { id: "hip-hop", label: "Hip-Hop Voice", description: "Rhythmic and clear, suitable for spoken word as well as rhythmic singing." },
      { id: "hindustani-classical", label: "Hindustani Classical Voice", description: "Complex and modal, focusing on improvisation and ragas from North India." },
      { id: "indie", label: "Indie Voice", description: "Often emotive and distinct, characterized by its individualistic sound." },
      { id: "jazz", label: "Jazz Voice", description: "Smooth and versatile, capable of intricate improvisations and variations." },
      { id: "k-pop", label: "K-Pop Voice", description: "Energetic and melodic, often integrating dance performances with dynamic vocalization." },
      { id: "kabuki", label: "Kabuki Voice", description: "Theatrical and stylized, used in traditional Japanese Kabuki theatre." },
      { id: "latin", label: "Latin Voice", description: "Embraces styles with rhythmic and expressive vocal deliveries, common in salsa, bachata, and more." },
      { id: "metal", label: "Metal Voice", description: "Intense and often aggressive, capable of techniques like growling and screaming." },
      { id: "musical-theatre", label: "Musical Theatre Voice", description: "Strong projection and clear enunciation, capable of dramatic expression." },
      { id: "opera", label: "Opera Voice", description: "Trained for opera, powerful and capable of complex vocal deliveries." },
      { id: "pop", label: "Pop Voice", description: "Clear, contemporary, and versatile, designed for broad commercial appeal." },
      { id: "punk", label: "Punk Voice", description: "Raw and fast-paced, often embodying a rebellious spirit." },
      { id: "qawwali", label: "Qawwali Voice", description: "Spiritual and powerful, typical of the devotional music of Sufism." },
      { id: "rnb", label: "R&B Voice", description: "Smooth, melodic, often featuring an emotional or soulful delivery." },
      { id: "reggae", label: "Reggae Voice", description: "Distinctive for its rhythmic accent and smooth melodic lines." },
      { id: "rock", label: "Rock Voice", description: "Edgy and powerful, suitable for strong, energetic performances." },
      { id: "samba", label: "Samba Voice", description: "Rhythmic and lively, typical of Brazilian Samba music." },
      { id: "soul", label: "Soul Voice", description: "Rich and deep, known for its expressiveness and emotional depth." },
      { id: "taarab", label: "Taarab Voice", description: "Melodic and emotive, characteristic of East African coastal music." },
      { id: "throat-singing", label: "Throat Singing Voice", description: "Produces multiple pitches simultaneously, typical of Central Asian cultural traditions." },
      { id: "yodel", label: "Yodel Voice", description: "Characterized by rapid and repeated changes in pitch between the chest voice and falsetto, typical of Alpine and country music." }
    ],
    availabilityOptions: [
      "I am available to record voiceovers for Media Companies",
      "I am available to audition and join a Live Gig & Original Recording Artist",
      "I am available to audition and join an Original Recording Artist", 
      "I am available to audition and join a Live Gig Artist"
    ]
  },
  {
    id: "type5",
    label: "Type 5: Instrumentalist Artist for Hire",
    description:
      "I am a live performance and recording session musician.",
    instrumentCategories: {
      "String Instruments": [
        "All String Instruments",
        "Banjo",
        "Bass Guitar", 
        "Cello",
        "Double Bass",
        "Guitar",
        "Harp",
        "Lute",
        "Mandolin",
        "Nyckelharpa",
        "Phonofiddle",
        "Sitar",
        "Ukulele",
        "Viola",
        "Violin",
        "Zither"
      ],
      "Wind Instruments": [
        "All Wind Instruments",
        "Alboka",
        "Clarinet",
        "Didgeridoo",
        "Flute",
        "Harmonica",
        "Jaw Harp",
        "Kazoo",
        "Kubing",
        "Lur",
        "Nose Flute",
        "Oboe",
        "Recorder",
        "Saxophone",
        "Shaw",
        "Triton Shell",
        "Vuvuzela",
        "Whistle",
        "Xun"
      ],
      "Percussion Instruments": [
        "All Percussion Instruments",
        "Drum Set",
        "Hand Drums",
        "Mallet Percussion",
        "Metal Percussion",
        "Cowbell",
        "Shakers",
        "Misc. Percussion"
      ],
      "Keyboard Instruments": [
        "All Keyboard Instruments",
        "Accordion",
        "Celesta",
        "Clavichord",
        "Harpsichord",
        "Melodica",
        "Organ",
        "Piano"
      ],
      "Electronic Instruments": [
        "All Electronic Instruments",
        "Electronic Keyboard",
        "Sampler",
        "Synthesizer"
      ]
    },
    availabilityOptions: [
      "Available to audition and join a band",
      "Available for session recording work",
      "Available for live performance gigs",
      "Available for collaboration projects",
      "Available for teaching/instruction"
    ]
  },
  {
    id: "type6",
    label: "Type 6: Songwriter Artist for Hire",
    description:
      "I write words and musical compositions for songs (lyrics, melodies, harmonies, notes, chords and musical structure) for Artists, Labels, Recorded Audio Visual Media and Live Performances.",
    songwriterOptions: [
      "Any Genre: I write original songs for Original Recording Artists. [Type 1 & 2]",
      "Specific Genre(s): I write original songs for Original Recording Artists. [Type 1 & 2]"
    ],
    genreSelection: {
      "allowMultiple": true,
      "description": "Select multiple Genre Family: Main Genre combinations to be searchable by Type 1 and Type 2 Artists and Record Labels"
    }
  },
  {
    id: "type7",
    label: "Type 7: Lyricist Artist for Hire",
    description:
      "I write words for songs (lyrics) for Artists, Labels, Recorded Audio Visual Media and Live Performances.",
    lyricistOptions: [
      "Any Genre: I write original lyrics for Original Recording Artists. [Type 1 & 2]",
      "Specific Genre(s): I write original lyrics for Original Recording Artists. [Type 1 & 2]"
    ],
    genreSelection: {
      "allowMultiple": true,
      "description": "Select multiple Genre Family: Main Genre identifiers to be searched by Type 1 and Type 2 Artists and Record Labels"
    }
  },
  {
    id: "type8",
    label: "Type 8: Composer Artist for Hire",
    description:
      "I write musical compositions (melodies, harmonies, notes, chords and musical structure) for Artists, Labels, Recorded Audio Visual Media and Live Performances.",
    composerOptions: [
      "Any Genre: I write original compositions for Original Recording Artists. [Type 1 & 2]",
      "Specific Genre(s): I write original compositions for Original Recording Artists. [Type 1 & 2]"
    ],
    genreSelection: {
      "allowMultiple": true,
      "description": "Select multiple Genre Family: Main Genre identifiers to be searched by Type 1 and Type 2 Artists and Record Labels"
    }
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
    label: "Type 6: Fan's Live Music Gig – Private Performance, Public Venue",
    description:
      "Fans book venues and artists privately while keeping event details secure.",
    subTypes: ["Temporary Fan Event"],
  },
  {
    id: "venue7",
    label: "Type 7: Fan's Live Music Gig – Private Performance, Own Venue",
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
| "artist-profile-setup"
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

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 9) {
    errors.push("Password must be at least 9 characters long")
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one capital letter")
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function SignUpWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, checkSession, user, loading: authLoading } = useAuth();
  const onboardingParam = searchParams?.get('onboarding') as MemberType | null;
  const [isRegistered, setIsRegistered] = useState<boolean>(() => Boolean(user));
  const [selectedMemberType, setSelectedMemberType] = useState<MemberType | null>(onboardingParam || null);
  const [accountChoice, setAccountChoice] = useState<AccountChoice | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedExtendedProfiles, setSelectedExtendedProfiles] = useState<AdditionalProfileKey[]>([]);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [genreLookup, setGenreLookup] = useState<Map<string, string>>(new Map());
  const [genreLookupError, setGenreLookupError] = useState("");
  const [genreFamilies, setGenreFamilies] = useState<GenreFamily[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [profilePictureState, setProfilePictureState] = useState<{ uploading: boolean; error: string }>({
    uploading: false,
    error: "",
  });
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [videoFormError, setVideoFormError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [hasCheckedEmailVerification, setHasCheckedEmailVerification] = useState(false);
  const [hasResumedOnboarding, setHasResumedOnboarding] = useState(false);
  const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);
  const [artistRedirectLoading, setArtistRedirectLoading] = useState(onboardingParam === 'artist');
  const [openSoundGroup, setOpenSoundGroup] = useState<string | null>(null);
  const [openGenreGroup, setOpenGenreGroup] = useState<string | null>(null);
  const [openInstrumentCategory, setOpenInstrumentCategory] = useState<string | null>(null);
  const [openSongwriterGenreFamily, setOpenSongwriterGenreFamily] = useState<string | null>(null);
  const [openLyricistGenreFamily, setOpenLyricistGenreFamily] = useState<string | null>(null);
  const [openComposerGenreFamily, setOpenComposerGenreFamily] = useState<string | null>(null);
  const [showSongwriterGenres, setShowSongwriterGenres] = useState(false);
  const [showLyricistGenres, setShowLyricistGenres] = useState(false);
  const [showComposerGenres, setShowComposerGenres] = useState(false);

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
    videos: [] as { url: string; title: string; thumbnail?: string }[],
    newVideoTitle: "",
    newVideoUrl: "",
    newVideoThumbnail: "",
    fetchingVideoMetadata: false,
  });

  const [artistSelection, setArtistSelection] = useState({
    typeId: "",
    subType: "",
    vocalSoundTypes: "",
    vocalGenreStyles: "",
    availability: "",
    instrumentCategory: "",
    instrument: "",
    songwriterOption: "",
    songwriterGenres: "",
    lyricistOption: "",
    lyricistGenres: "",
    composerOption: "",
    composerGenres: "",
  });

  const [artistProfile, setArtistProfile] = useState({
    stageName: "",
    formedDate: "",
    performingMembers: 1,
    baseLocation: "",
    baseLocationLat: null as number | null,
    baseLocationLon: null as number | null,
    publicGigsPerformed: 0,
    facebookUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    xUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    snapchatUrl: "",
    recordLabelStatus: "independent",
    recordLabelName: "",
    recordLabelContactName: "",
    recordLabelContactEmail: "",
    recordLabelContactPhone: "",
    musicPublisherStatus: "independent",
    musicPublisherName: "",
    musicPublisherContactName: "",
    musicPublisherContactEmail: "",
    musicPublisherContactPhone: "",
    artistManagerStatus: "self_managed",
    artistManagerName: "",
    artistManagerContactName: "",
    artistManagerContactEmail: "",
    artistManagerContactPhone: "",
    bookingAgentStatus: "self_managed",
    bookingAgentName: "",
    bookingAgentContactName: "",
    bookingAgentContactEmail: "",
    bookingAgentContactPhone: "",
  });

  const [locationSuggestions, setLocationSuggestions] = useState<Array<{
    id: string;
    formatted: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lon?: number;
  }>>([]);

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

  // Redirect to dashboard if user has already completed FAN onboarding and is trying to do it again
  // Allow users to add additional profile types (artist, venue, service, pro) even if they have fan profile
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !onboardingParam) return;

      try {
        // Check database for actual fan onboarding status
        const response = await fetch('/api/fan-profile');
        const result = await response.json();
        
        const dbOnboardingCompleted = result.data?.onboarding_completed;
        
        console.log('SignUpWizard: Onboarding check', {
          dbOnboardingCompleted,
          hasProfile: !!result.data,
          onboardingParam
        });
        
        // If user has completed FAN onboarding
        if (dbOnboardingCompleted === true) {
          if (onboardingParam === 'fan') {
            console.log('SignUpWizard: User already completed fan onboarding, redirecting to dashboard...');
            router.push('/fan-dashboard');
          } else {
            console.log('SignUpWizard: User completed fan onboarding, setting up for additional profile...');
            // Set up for additional profile type selection
            setAccountChoice("fan");
            setSelectedMemberType(onboardingParam);
            setIsRegistered(true);
            setHasResumedOnboarding(true);
          }
        }
      } catch (error) {
        console.error('SignUpWizard: Error checking onboarding status', error);
        // Don't redirect on error, let user continue
      }
    };

    if (!authLoading && user && onboardingParam) {
      checkOnboardingStatus();
    }
  }, [authLoading, user, onboardingParam, router]);

  // Skip artist onboarding if artist profile already completed
  useEffect(() => {
    if (onboardingParam !== 'artist') {
      setArtistRedirectLoading(false);
      return;
    }

    if (!user) {
      setArtistRedirectLoading(false);
      return;
    }

    if (authLoading) return;

    let cancelled = false;

    const ensureArtistNotReOnboarded = async () => {
      try {
        const response = await fetch('/api/artist-profile');
        if (!response.ok) {
          if (!cancelled) setArtistRedirectLoading(false);
          return;
        }

        const result = await response.json();
        const artistOnboardingCompleted = result.data?.onboarding_completed;

        if (artistOnboardingCompleted) {
          console.log('SignUpWizard: Artist onboarding already complete, redirecting to artist dashboard');
          router.replace('/artist-dashboard');
        } else if (!cancelled) {
          setArtistRedirectLoading(false);
        }
      } catch (error) {
        console.error('SignUpWizard: Failed to verify artist onboarding status', error);
        if (!cancelled) {
          setArtistRedirectLoading(false);
        }
      }
    };

    ensureArtistNotReOnboarded();

    return () => {
      cancelled = true;
    };
  }, [authLoading, onboardingParam, router, user]);

  
  // Handle email verification callback and check session when returning
  useEffect(() => {
    // Run if we have onboarding param but either:
    // 1. No user yet (need to check session)
    // 2. User exists but not registered (session might be set but state not updated)
    if (onboardingParam && !authLoading && !hasCheckedEmailVerification && (!user || !isRegistered)) {
      // User came back from email verification
      // The middleware should have already processed the code and set the session
      const handleEmailVerification = async () => {
        setHasCheckedEmailVerification(true);
        try {
          const supabase = getClient();
          
          // Check for code parameter (Supabase email verification uses this)
          // The middleware should have already processed it, but we need to clean up the URL
          const queryParams = new URLSearchParams(window.location.search);
          const code = queryParams.get('code');
          
          if (code) {
            console.log('Found verification code in URL - middleware should have processed it');
            // Clean up URL immediately - remove code param, keep onboarding param
            const cleanUrl = window.location.pathname + (onboardingParam ? `?onboarding=${onboardingParam}` : '');
            window.history.replaceState({}, '', cleanUrl);
            
            // Give middleware a moment to process, then check session
            // The middleware should have already exchanged the code for a session
            await new Promise(resolve => setTimeout(resolve, 100));
            await checkSession();
            // Mark as registered if we have a user
            return;
          }
          
          // Fallback: Check if there are tokens in the URL hash (older Supabase behavior)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          // Also check query params for tokens
          const queryAccessToken = queryParams.get('access_token');
          const queryRefreshToken = queryParams.get('refresh_token');
          
          const token = accessToken || queryAccessToken;
          const refresh = refreshToken || queryRefreshToken;
          
          if (token && refresh) {
            console.log('Found tokens in URL, exchanging for session...');
            // Exchange tokens for session
            const { data, error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: refresh,
            });
            
            if (error) {
              console.error('Error setting session from email verification:', error);
            } else if (data.session) {
              console.log('Session established from email verification tokens');
              // Session established, refresh auth context
              await checkSession();
              // Mark as registered since we have a session
              setIsRegistered(true);
              // Clean up URL hash and query params
              const cleanUrl = window.location.pathname + (onboardingParam ? `?onboarding=${onboardingParam}` : '');
              window.history.replaceState({}, '', cleanUrl);
            }
          } else {
            // No code or tokens in URL, might already be in cookies via middleware
            // Just check session once
            console.log('No code or tokens in URL, checking existing session...');
            await checkSession();
            // If we have a user after checkSession, mark as registered
            // This will be handled by the useEffect that watches for user changes
          }
        } catch (error) {
          console.error('Error handling email verification:', error);
        }
      };
      
      handleEmailVerification();
    }
  }, [onboardingParam, user, authLoading, hasCheckedEmailVerification, isRegistered, checkSession]);

  useEffect(() => {
    if (user && !isRegistered) {
      console.log('User detected, setting isRegistered to true');
      setIsRegistered(true);
    }
    // Also set isRegistered if we have a user and onboarding param (came back from email verification)
    if (user && onboardingParam && !isRegistered) {
      console.log('User with onboarding param detected, setting isRegistered to true');
      setIsRegistered(true);
    }
  }, [user, isRegistered, onboardingParam]);

  // Fetch genre taxonomy from API
  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      setGenreLookupError("");
      
      try {
        const response = await fetch('/api/genres', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.details || result.error);
        }

        const { data } = result;
        
        if (!data || !data.families || data.families.length === 0) {
          setGenreLookupError("Using default genres while we finish loading the catalog...");
          setLoadingGenres(false);
          return;
        }

        // Set the genre families with full hierarchy
        console.log('Setting genre families:', {
          count: data.families.length,
          sample: data.families[0],
          africanMusic: data.families.find((f: GenreFamily) => f.name.toLowerCase().includes('african'))
        });
        setGenreFamilies(data.families);
        
        // Build lookup map for resolving genre names to IDs
        const lookup = new Map<string, string>();
        data.families.forEach((family: GenreFamily) => {
          lookup.set(family.name.toLowerCase().trim(), family.id);
          console.log(`Family "${family.name}" has ${family.mainGenres?.length || 0} main genres:`, family.mainGenres?.map((m: GenreType) => m.name));
          family.mainGenres?.forEach((main: GenreType) => {
            lookup.set(main.name.toLowerCase().trim(), main.id);
            main.subGenres?.forEach((sub: GenreSubtype) => {
              lookup.set(sub.name.toLowerCase().trim(), sub.id);
            });
          });
        });
        setGenreLookup(lookup);
        setGenreLookupError("");
      } catch (error) {
        console.error("Failed to fetch genres:", error);
        setGenreLookupError("Using default genres while we finish loading the catalog...");
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // When onboarding param is present, initialize member type and account choice immediately
  useEffect(() => {
    if (onboardingParam) {
      if (!selectedMemberType) {
        console.log('Setting member type from onboarding param:', onboardingParam);
        setSelectedMemberType(onboardingParam);
      }
      
      // Artists must use "fan" membership - set this immediately so steps are built correctly
      if (onboardingParam === "artist" && accountChoice !== "fan") {
        console.log('Setting account choice to fan for artist (required)');
        setAccountChoice("fan");
      }
    }
  }, [onboardingParam, selectedMemberType, accountChoice]);

  // Auto-advance to membership step when onboarding param is set and member type is selected
  useEffect(() => {
    if (onboardingParam && selectedMemberType && stepIndex === 0 && accountChoice) {
      console.log('Auto-advancing from member-selector due to onboarding param:', onboardingParam);
      // Use setTimeout to ensure state updates have completed
      setTimeout(() => {
        setStepIndex(1); // Move to membership step
      }, 100);
    }
  }, [onboardingParam, selectedMemberType, stepIndex, accountChoice]);


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

  const artistProfileSetupStep: StepDefinition | null = useMemo(() => {
    if (selectedMemberType !== "artist" || !artistSelection.typeId) return null;
    return { key: "artist-profile-setup", label: "Artist Profile Setup" };
  }, [selectedMemberType, artistSelection.typeId]);

  const steps = useMemo(() => {
    const stepList = personaStep ? [...baseSteps, personaStep] : baseSteps;
    if (artistProfileSetupStep) {
      stepList.push(artistProfileSetupStep);
    }
    return stepList;
  }, [baseSteps, personaStep, artistProfileSetupStep]);

  // Jump to profile-add step after steps are built and user has completed fan onboarding
  useEffect(() => {
    if (steps.length === 0) return;
    
    const profileAddIndex = steps.findIndex((s) => s.key === "profile-add");
    
    // Only jump if we've explicitly set this up for adding additional profiles
    // This should only happen when a completed fan user clicks "Switch Accounts"
    const shouldJumpToProfileAdd = 
      hasResumedOnboarding && 
      onboardingParam && 
      onboardingParam !== 'fan' &&
      accountChoice === "fan" &&
      isRegistered === true &&
      steps[stepIndex]?.key !== "profile-add" &&
      // Additional check: make sure we're not at the beginning (step 0 or 1)
      stepIndex > 1 &&
      // Don't jump back if we're already past profile-add
      profileAddIndex !== -1 &&
      stepIndex < profileAddIndex;
    
    if (shouldJumpToProfileAdd) {
      console.log('SignUpWizard: Jumping to profile-add step for additional profile...');
      setStepIndex(profileAddIndex);
    }
  }, [steps, hasResumedOnboarding, onboardingParam, accountChoice, stepIndex, isRegistered]);

  // Resume onboarding after email verification - run this after user is loaded AND steps are built
  useEffect(() => {
    const conditions = {
      authReady: !authLoading,
      hasUser: !!user,
      hasOnboardingParam: !!onboardingParam,
      hasSelectedMemberType: !!selectedMemberType,
      accountChoiceIsFan: accountChoice === "fan",
      registered: isRegistered,
      notProcessing: !isProcessingStep,
      hasSteps: steps.length > 0,
    };

    console.log('🔍 Resume check:', {
      conditions,
      hasResumedOnboarding,
      currentStepIndex: stepIndex,
      currentStepKey: steps[stepIndex]?.key,
      allSteps: steps.map(s => s.key),
    });

    const allConditionsMet = Object.values(conditions).every(Boolean);

    if (!allConditionsMet) {
      if (onboardingParam && !authLoading) {
        const missing = Object.entries(conditions)
          .filter(([, value]) => !value)
          .map(([key]) => key);
        console.log('⏳ Waiting for resume conditions:', missing);
      }
      return;
    }

    // Only resume once we have everything AND we haven't already done it
    if (hasResumedOnboarding) {
      console.log('⏭️ Already resumed, skipping');
      return;
    }

    if (selectedMemberType === "artist") {
      const targetStepIndex = steps.findIndex((step) => step.key === "fan-music-preferences");
      console.log('🎯 Looking for music preferences step:', {
        found: targetStepIndex !== -1,
        targetStepIndex,
        allSteps: steps.map((s, i) => `${i}: ${s.key}`),
      });
      
      if (targetStepIndex !== -1) {
        console.log('✅ Artist email verified! Jumping to Music Preferences:', {
          from: stepIndex,
          to: targetStepIndex,
          targetKey: steps[targetStepIndex]?.key,
        });
        setStepIndex(targetStepIndex);
        setHasResumedOnboarding(true);
      } else {
        console.error('⚠️ Could not find fan-music-preferences step in steps array!');
      }
      return;
    }

    // For other member types, go to profile details
    const profileDetailsIndex = steps.findIndex((step) => step.key === "fan-profile-details");
    if (profileDetailsIndex !== -1) {
      console.log('✅ Resuming onboarding at Fan Profile Details');
      setStepIndex(profileDetailsIndex);
      setHasResumedOnboarding(true);
    }
  }, [authLoading, user, onboardingParam, selectedMemberType, accountChoice, isRegistered, isProcessingStep, steps, hasResumedOnboarding, stepIndex]);

  useEffect(() => {
    if (steps.length === 0) return;
    // Don't reset step if we're resuming onboarding - let the resume logic handle it
    if (user && onboardingParam && selectedMemberType && isRegistered) {
      // We're in resume mode, don't reset the step
      return;
    }
    // Normal flow: make sure step index is within bounds
    setStepIndex((prev) => Math.min(prev, steps.length - 1));
  }, [steps.length, user, onboardingParam, selectedMemberType, isRegistered]);

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

  // Debug logging for step navigation
  useEffect(() => {
    console.log('📍 Step Navigation:', {
      currentStepKey: currentStep?.key,
      stepIndex,
      totalSteps: steps.length,
      isLastStep,
      canAdvance: canProceed(),
      artistStageName: artistProfile.stageName,
      allSteps: steps.map(s => s.key)
    });
  }, [stepIndex, steps.length, currentStep?.key, isLastStep, artistProfile.stageName]);

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
        const passwordValidation = validatePassword(fanDetails.password);
        return (
          fanDetails.firstName.trim() &&
          fanDetails.lastName.trim() &&
          fanDetails.email.trim() &&
          fanDetails.confirmEmail.trim() &&
          fanDetails.password.trim() &&
          fanDetails.confirmPassword.trim() &&
          emailMatches &&
          passwordsMatch &&
          passwordValidation.valid
        );
      }
      case "fan-profile-details":
        return (
          fanDetails.username.trim() &&
          fanDetails.dob &&
          fanDetails.address.trim() &&
          fanDetails.phone.trim()
        );
      case "fan-music-preferences": {
        const hasFamily = fanDetails.genreFamilies.length >= 1;
        const hasMainGenres = fanDetails.mainGenres.length >= 3;
        const canProceed = hasFamily && hasMainGenres;
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Music Preferences Validation:', {
            genreFamilies: fanDetails.genreFamilies.length,
            mainGenres: fanDetails.mainGenres.length,
            subGenres: fanDetails.subGenres.length,
            hasFamily,
            hasMainGenres,
            canProceed
          });
        }
        return canProceed;
      }
      case "fan-payment":
        // Require subscription confirmation and terms/privacy acceptance
        return subscriptionConfirmed && fanDetails.termsAccepted && fanDetails.privacyAccepted;
      case "fan-profile-picture":
        return Boolean(fanProfile.profilePictureUrl);
      case "fan-photos":
      case "fan-videos":
      case "profile-add":
        return true;
      case "artist-type":
        return Boolean(artistSelection.typeId);
      case "artist-profile-setup":
        return Boolean(artistProfile.stageName?.trim());
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

  // Helper to get genre families (with fallback to defaults)
  const getGenreFamilies = (): Array<{ id: string; name: string }> => {
    if (genreFamilies.length > 0) {
      return genreFamilies.map(f => ({ id: f.id, name: f.name }));
    }
    return DEFAULT_GENRE_FAMILIES.map((name, i) => ({ id: `default-family-${i}`, name }));
  };

  // Helper to get main genres for a selected family
  const getMainGenresForFamily = (familyIdOrName: string): GenreType[] => {
    if (genreFamilies.length === 0) {
      // Still loading - return empty array to show loading state
      console.log('Genre families array is empty, still loading...');
      return [];
    }

    // Normalize the search string for comparison
    const normalizedSearch = familyIdOrName.trim().toLowerCase();
    console.log(`Looking for family: "${familyIdOrName}" (normalized: "${normalizedSearch}")`);
    console.log('Available families:', genreFamilies.map(f => ({ id: f.id, name: f.name, mainGenresCount: f.mainGenres?.length || 0 })));
    
    // Try to find by ID first, then by name (case-insensitive)
    const family = genreFamilies.find(f => {
      const normalizedId = f.id.trim().toLowerCase();
      const normalizedName = f.name.trim().toLowerCase();
      const matches = normalizedId === normalizedSearch || normalizedName === normalizedSearch;
      if (matches) {
        console.log(`Match found! Family: "${f.name}", ID: "${f.id}", Main genres: ${f.mainGenres?.length || 0}`);
      }
      return matches;
    });
    
    if (family) {
      const mainGenres = family.mainGenres || [];
      console.log(`Found family "${family.name}" with ${mainGenres.length} main genres:`, mainGenres.map(m => m.name));
      return mainGenres;
    }
    
    console.warn(`Family not found for: "${familyIdOrName}". Available families:`, genreFamilies.map(f => f.name));
    return [];
  };

  // Helper to parse hybrid genre information
  const parseHybridGenre = (name: string): { baseName: string; hybridInfo: string | null; hybridComponents: string[] } => {
    const hybridMatch = name.match(/^(.+?)\s*\(Hybrid:\s*(.+?)\)$/);
    if (hybridMatch) {
      const components = hybridMatch[2]
        .split('+')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      return {
        baseName: hybridMatch[1].trim(),
        hybridInfo: hybridMatch[2].trim(),
        hybridComponents: components
      };
    }
    return { baseName: name, hybridInfo: null, hybridComponents: [] };
  };

  // Helper to get sub-genres for a selected main genre
  const getSubGenresForMainGenre = (mainGenreIdOrName: string): GenreSubtype[] => {
    if (genreFamilies.length === 0) {
      return DEFAULT_SUB_GENRES.map((name, i) => ({
        id: `default-sub-${i}`,
        name,
        typeId: mainGenreIdOrName
      }));
    }

    // Search through all families to find the main genre
    for (const family of genreFamilies) {
      const mainGenre = family.mainGenres.find(m => m.id === mainGenreIdOrName || m.name === mainGenreIdOrName);
      if (mainGenre) {
        return mainGenre.subGenres;
      }
    }
    return [];
  };

  const buildFanProfilePayload = (overrides?: Partial<FanProfilePayload>): FanProfilePayload => {
    const accountType = accountChoice === "fan" ? "full" : "guest";
    
    // Resolve all genre IDs
    const allGenreNames = [
      ...fanDetails.genreFamilies,
      ...fanDetails.mainGenres,
      ...fanDetails.subGenres,
    ];
    const preferredGenreIds = resolveGenreIds(allGenreNames);
    
    // Categorize genres into families, main genres, and sub-genres
    const genreFamilyIds: string[] = [];
    const mainGenreIds: string[] = [];
    const subGenreIds: string[] = [];
    
    fanDetails.genreFamilies.forEach(familyName => {
      const id = genreLookup.get(familyName.toLowerCase().trim());
      if (id) genreFamilyIds.push(id);
    });
    
    fanDetails.mainGenres.forEach(mainName => {
      const id = genreLookup.get(mainName.toLowerCase().trim());
      if (id) mainGenreIds.push(id);
    });
    
    fanDetails.subGenres.forEach(subName => {
      const id = genreLookup.get(subName.toLowerCase().trim());
      if (id) subGenreIds.push(id);
    });

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
      genreFamilies: genreFamilyIds.length > 0 ? genreFamilyIds : fanDetails.genreFamilies,
      mainGenres: mainGenreIds.length > 0 ? mainGenreIds : fanDetails.mainGenres,
      subGenres: subGenreIds.length > 0 ? subGenreIds : fanDetails.subGenres,
      preferredGenreIds,
      preferredGenres: [...fanDetails.mainGenres, ...fanDetails.subGenres],
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

      // If onboarding was marked as completed, refresh the auth context to get updated user metadata
      if (overrides?.onboardingCompleted === true) {
        console.log('Onboarding completed, refreshing auth context...');
        await checkSession();
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
          selectedMemberType || undefined,
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
      
      if (!user?.id) {
        throw new Error("User must be authenticated to upload profile picture");
      }
      
      const extension = file.name.split(".").pop() || "jpg";
      // Upload to userId/filename structure to match storage policy
      const path = `${user.id}/${Date.now()}.${extension}`;

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
    
    if (!user?.id) {
      setPhotoUploadError("User must be authenticated to upload photos");
      return;
    }
    
    const newPhotos: { name: string; url: string }[] = [];
    setPhotoUploadError("");

    for (const file of Array.from(fileList)) {
      try {
        const sanitisedName = file.name.replace(/\s+/g, "-");
        // Upload to userId/filename structure to match storage policy
        const path = `${user.id}/${Date.now()}-${sanitisedName}`;

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

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    try {
      const urlObj = new URL(url.trim());
      // Handle youtu.be short URLs
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }
      // Handle youtube.com URLs
      if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v");
      }
      return null;
    } catch {
      return null;
    }
  };

  // Fetch YouTube video metadata (title and thumbnail)
  const fetchYouTubeMetadata = async (videoId: string): Promise<{ title: string; thumbnail: string } | null> => {
    try {
      // Use YouTube oEmbed API (no API key required)
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      // Extract thumbnail URL (oEmbed provides thumbnail_url)
      // We can also construct it directly: https://img.youtube.com/vi/{videoId}/maxresdefault.jpg
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      return {
        title: data.title || "",
        thumbnail: thumbnail,
      };
    } catch (error) {
      console.error("Error fetching YouTube metadata:", error);
      return null;
    }
  };

  const handleAddVideo = async () => {
    setVideoFormError("");
    const { newVideoTitle, newVideoUrl } = fanProfile;

    if (!newVideoUrl.trim()) {
      setVideoFormError("Please add a YouTube link.");
      return;
    }

    // Validate YouTube URL
    let videoId: string | null = null;
    try {
      const url = new URL(newVideoUrl.trim());
      if (!url.hostname.includes("youtube.com") && !url.hostname.includes("youtu.be")) {
        setVideoFormError("Only YouTube links are supported right now.");
        return;
      }
      videoId = extractYouTubeId(newVideoUrl.trim());
      if (!videoId) {
        setVideoFormError("Could not extract video ID from URL. Please check the link.");
        return;
      }
    } catch {
      setVideoFormError("Please enter a valid YouTube URL.");
      return;
    }

    // Fetch video metadata if we don't have a title
    let videoTitle = newVideoTitle.trim();
    let videoThumbnail = "";

    if (!videoTitle) {
      setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: true }));
      try {
        const metadata = await fetchYouTubeMetadata(videoId);
        if (metadata) {
          videoTitle = metadata.title;
          videoThumbnail = metadata.thumbnail;
        } else {
          setVideoFormError("Could not fetch video information. Please enter a title manually.");
          setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: false }));
          return;
        }
      } catch (error) {
        console.error("Error fetching video metadata:", error);
        setVideoFormError("Could not fetch video information. Please enter a title manually.");
        setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: false }));
        return;
      }
      setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: false }));
    } else {
      // If title is provided, still fetch thumbnail
      setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: true }));
      try {
        const metadata = await fetchYouTubeMetadata(videoId);
        if (metadata) {
          videoThumbnail = metadata.thumbnail;
        }
      } catch (error) {
        console.error("Error fetching thumbnail:", error);
      }
      setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: false }));
    }

    if (!videoTitle) {
      setVideoFormError("Please enter a video title.");
      return;
    }

    // Add &rel=0 to prevent suggested videos
    const urlWithRelParam = newVideoUrl.trim();
    let finalUrl: string;
    try {
      const urlObj = new URL(urlWithRelParam);
      urlObj.searchParams.set('rel', '0');
      finalUrl = urlObj.toString();
    } catch {
      finalUrl = urlWithRelParam;
    }

    const updatedVideos = [
      ...fanProfile.videos,
      {
        title: videoTitle,
        url: finalUrl,
        thumbnail: videoThumbnail || undefined,
      },
    ];

    setFanProfile((prev) => ({
      ...prev,
      videos: updatedVideos,
      newVideoTitle: "",
      newVideoUrl: "",
      newVideoThumbnail: "",
    }));
    setVideoFormError("");

    await saveFanProfile({ videoLinks: updatedVideos });
  };

  const handleRemoveVideo = async (video: { title: string; url: string; thumbnail?: string }) => {
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
    console.log('handleNext called:', { 
      currentStep: currentStep?.key, 
      canProceed: canProceed(), 
      isProcessingStep,
      stepIndex,
      selectedMemberType,
      accountChoice
    });
    
    if (!currentStep || !canProceed() || isProcessingStep) {
      console.log('handleNext blocked:', { 
        hasCurrentStep: !!currentStep, 
        canProceed: canProceed(), 
        isProcessingStep 
      });
      return;
    }

    setRegistrationError("");
    setIsProcessingStep(true);

    let stepCompleted = true;

    try {
      switch (currentStep.key) {
        case "member-selector":
          // Member selector just needs to validate that a type is selected
          stepCompleted = Boolean(selectedMemberType);
          break;
        case "fan-account-basics":
        case "fan-profile-details":
        case "fan-music-preferences":
        case "fan-payment": {
          if (currentStep.key === "fan-payment") {
            // Simulated payment - no actual payment processing
            console.log('💰 Payment step: Simulated payment processing (accepting any input)');
            stepCompleted = true;
          } else {
            // Try to save but don't block progression on errors
            try {
              stepCompleted = await submitFanDetails();
              if (!stepCompleted) {
                console.warn(`Failed to save ${currentStep.key}, but allowing advancement`);
                stepCompleted = true;
              }
            } catch (error) {
              console.error(`Error saving ${currentStep.key}, but allowing advancement:`, error);
              stepCompleted = true; // Always allow progression
            }
          }
          break;
        }
        case "fan-videos": {
          // Videos are optional - try to save and mark onboarding as complete
          try {
            await saveFanProfile({ onboardingCompleted: true });
            console.log('✅ Fan onboarding completed');
          } catch (error) {
            console.warn("SignUpWizard: Failed to save videos, but allowing progression", error);
          }
          stepCompleted = true; // Always allow progression
          break;
        }
        case "artist-profile-setup": {
          // Save artist profile data
          try {
            const response = await fetch('/api/artist-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                stage_name: artistProfile.stageName,
                established_date: artistProfile.formedDate ? `${artistProfile.formedDate}-01` : null,
                performing_members: artistProfile.performingMembers,
                base_location: artistProfile.baseLocation,
                base_location_lat: artistProfile.baseLocationLat,
                base_location_lon: artistProfile.baseLocationLon,
                gigs_performed: artistProfile.publicGigsPerformed,
                facebook_url: artistProfile.facebookUrl,
                instagram_url: artistProfile.instagramUrl,
                threads_url: artistProfile.threadsUrl,
                x_url: artistProfile.xUrl,
                tiktok_url: artistProfile.tiktokUrl,
                youtube_url: artistProfile.youtubeUrl,
                snapchat_url: artistProfile.snapchatUrl,
                record_label_status: artistProfile.recordLabelStatus,
                record_label_name: artistProfile.recordLabelName,
                record_label_contact_name: artistProfile.recordLabelContactName,
                record_label_email: artistProfile.recordLabelContactEmail,
                record_label_phone: artistProfile.recordLabelContactPhone,
                music_publisher_status: artistProfile.musicPublisherStatus,
                music_publisher_name: artistProfile.musicPublisherName,
                music_publisher_contact_name: artistProfile.musicPublisherContactName,
                music_publisher_email: artistProfile.musicPublisherContactEmail,
                music_publisher_phone: artistProfile.musicPublisherContactPhone,
                artist_manager_status: artistProfile.artistManagerStatus,
                artist_manager_name: artistProfile.artistManagerName,
                artist_manager_contact_name: artistProfile.artistManagerContactName,
                artist_manager_email: artistProfile.artistManagerContactEmail,
                artist_manager_phone: artistProfile.artistManagerContactPhone,
                booking_agent_status: artistProfile.bookingAgentStatus,
                booking_agent_name: artistProfile.bookingAgentName,
                booking_agent_contact_name: artistProfile.bookingAgentContactName,
                booking_agent_email: artistProfile.bookingAgentContactEmail,
                booking_agent_phone: artistProfile.bookingAgentContactPhone,
                artist_type_id: artistSelection.typeId ? parseInt(artistSelection.typeId.replace('type', '')) : null,
                artist_sub_types: artistSelection.subType ? [artistSelection.subType] : []
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('API Error Response:', errorData);
              throw new Error(`Failed to save artist profile: ${errorData.error || response.statusText}`);
            }
            
            console.log('✅ Artist profile saved successfully');
            stepCompleted = true;
          } catch (error) {
            console.error('Error saving artist profile:', error);
            // Allow progression even if save fails
            stepCompleted = true;
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      // Allow advancement even if there's an error - don't block user progress
      stepCompleted = true;
    } finally {
      setIsProcessingStep(false);
    }

    if (!stepCompleted) {
      return;
    }

    if (stepIndex < steps.length - 1) {
      console.log(`Advancing from step ${stepIndex} (${currentStep.key}) to step ${stepIndex + 1} (${steps[stepIndex + 1]?.key})`);
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const resetFlow = () => {
    // Don't reset selectedMemberType if we're resuming onboarding
    if (!onboardingParam) {
      setSelectedMemberType(null);
    }
    setAccountChoice(null);
    setSelectedExtendedProfiles([]);
    setRegistrationError("");
    setNeedsEmailVerification(false);
    setIsProcessingStep(false);
    setHasCheckedEmailVerification(false);
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
      newVideoThumbnail: "",
      fetchingVideoMetadata: false,
    });
    setProfilePictureState({ uploading: false, error: "" });
    setPhotoUploadError("");
    setVideoFormError("");
    setPasswordErrors([]);
    setArtistSelection({ typeId: "", subType: "", vocalSoundTypes: "", vocalGenreStyles: "", availability: "", instrumentCategory: "", instrument: "", songwriterOption: "", songwriterGenres: "", lyricistOption: "", lyricistGenres: "", composerOption: "", composerGenres: "" });
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
                onChange={(event) => {
                  const newPassword = event.target.value
                  setFanDetails((prev) => ({ ...prev, password: newPassword }))
                  if (newPassword.length === 0) {
                    setPasswordErrors([])
                  } else {
                    const validation = validatePassword(newPassword)
                    setPasswordErrors(validation.errors)
                  }
                }}
                placeholder="At least 9 characters inc. capital, number, special"
                required
              />
              {passwordErrors.length > 0 && (
                <div className="space-y-1">
                  {passwordErrors.map((error, index) => (
                    <p key={index} className="text-xs text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
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

  const renderFanMusicPreferences = () => {
    const availableFamilies = getGenreFamilies();

    // Helper to get breadcrumb path for a main genre
    const getMainGenreBreadcrumb = (mainGenreName: string) => {
      for (const family of genreFamilies) {
        const mainGenre = family.mainGenres?.find(mg => mg.name === mainGenreName);
        if (mainGenre) {
          return `${family.name} > ${mainGenreName}`;
        }
      }
      return mainGenreName;
    };

    // Helper to get breadcrumb path for a sub-genre
    const getSubGenreBreadcrumb = (subGenreName: string) => {
      for (const family of genreFamilies) {
        for (const mainGenre of family.mainGenres || []) {
          const subGenre = mainGenre.subGenres?.find(sg => sg.name === subGenreName);
          if (subGenre) {
            // Parse the sub-genre name to remove hybrid info from breadcrumb
            const parsed = parseHybridGenre(subGenreName);
            return `${family.name} > ${mainGenre.name} > ${parsed.baseName}`;
          }
        }
      }
      // Parse even if not found in catalog
      const parsed = parseHybridGenre(subGenreName);
      return parsed.baseName;
    };

    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Music Preferences</CardTitle>
            <CardDescription className="text-sm text-foreground/80 leading-relaxed mt-2">
              Pick at least 1 favourite Genre Family, and at least 3 Main Genres. Feel free to add your favourite Sub-Genres while you&apos;re here too…
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingGenres && (
              <div className="flex items-center gap-2 text-sm text-foreground/70 bg-muted/50 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading genre catalog...</span>
              </div>
            )}
            {genreLookupError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{genreLookupError}</p>
            )}

            {/* Breadcrumb Navigation & Progress Indicator */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                  <span>Your Selections:</span>
                </div>
                <div className="flex items-center gap-2">
                  {fanDetails.genreFamilies.length >= 1 && fanDetails.mainGenres.length >= 3 ? (
                    <Badge variant="default" className="text-xs font-semibold bg-green-600">
                      ✓ Ready to Continue
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {fanDetails.genreFamilies.length < 1 && "Need 1+ Family"}
                      {fanDetails.genreFamilies.length >= 1 && fanDetails.mainGenres.length < 3 && `Need ${3 - fanDetails.mainGenres.length} more Main Genre${3 - fanDetails.mainGenres.length !== 1 ? 's' : ''}`}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {fanDetails.genreFamilies.length > 0 && (
                  <>
                    <span className={cn(
                      "font-semibold",
                      fanDetails.genreFamilies.length >= 1 ? "text-green-600 dark:text-green-400" : "text-foreground/90"
                    )}>
                      {fanDetails.genreFamilies.length} Family{fanDetails.genreFamilies.length !== 1 ? 'ies' : ''}
                    </span>
                    {fanDetails.mainGenres.length > 0 && <span className="text-foreground/40">•</span>}
                  </>
                )}
                {fanDetails.mainGenres.length > 0 && (
                  <>
                    <span className={cn(
                      "font-semibold",
                      fanDetails.mainGenres.length >= 3 ? "text-green-600 dark:text-green-400" : "text-foreground/90"
                    )}>
                      {fanDetails.mainGenres.length} Main Genre{fanDetails.mainGenres.length !== 1 ? 's' : ''}
                      {fanDetails.mainGenres.length < 3 && ` (need ${3 - fanDetails.mainGenres.length} more)`}
                    </span>
                    {fanDetails.subGenres.length > 0 && <span className="text-foreground/40">•</span>}
                  </>
                )}
                {fanDetails.subGenres.length > 0 && (
                  <span className="text-foreground/90 font-semibold">{fanDetails.subGenres.length} Sub-Genre{fanDetails.subGenres.length !== 1 ? 's' : ''} (optional)</span>
                )}
                {fanDetails.genreFamilies.length === 0 && fanDetails.mainGenres.length === 0 && fanDetails.subGenres.length === 0 && (
                  <span className="text-foreground/60 italic">No selections yet</span>
                )}
              </div>
            </div>

            {/* STEP 1: All Genre Families */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold uppercase tracking-wider text-foreground/90">
                  Step 1: All Genre Families
                </p>
                <span className="text-xs text-foreground/60" title="Select at least 1 genre family">ℹ️</span>
                {fanDetails.genreFamilies.length > 0 && (
                  <Badge variant="default" className="text-xs font-semibold">
                    {fanDetails.genreFamilies.length} selected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">Click on a Genre Family card below to select it as a favourite (the card will be highlighted with a checkmark)</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableFamilies.map((family) => {
                  const id = `genre-family-${family.id}`;
                  const checked = fanDetails.genreFamilies.includes(family.name);
                  return (
                    <Card
                      key={family.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setFanDetails((prev) => ({
                          ...prev,
                          genreFamilies: toggleFromArray(prev.genreFamilies, family.name),
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setFanDetails((prev) => ({
                            ...prev,
                            genreFamilies: toggleFromArray(prev.genreFamilies, family.name),
                          }));
                        }
                      }}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        checked
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 hover:border-primary/50"
                      )}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={() =>
                            setFanDetails((prev) => ({
                              ...prev,
                              genreFamilies: toggleFromArray(prev.genreFamilies, family.name),
                            }))
                          }
                          className="pointer-events-none"
                        />
                        <Label
                          htmlFor={id}
                          className={cn(
                            "flex-1 cursor-pointer text-sm font-semibold leading-snug",
                            checked ? "text-primary" : "text-foreground"
                          )}
                        >
                          {family.name}
                        </Label>
                        {checked && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm" />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* STEP 2: Your Favourite Genre Families (with expandable sections for Main Genres) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold uppercase tracking-wider text-foreground/90">
                  Step 2: Your Favourite Genre Families
                </p>
                <span className="text-xs text-foreground/60" title="Expand to select main genres">ℹ️</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">Expand a Genre Family to select Main Genres from that Genre Family</p>
              
              {fanDetails.genreFamilies.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
                  <p className="text-sm italic text-foreground/70 text-center">
                    Choose a Genre Family above to get started.
                  </p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {fanDetails.genreFamilies.map((familyName) => {
                    const allMainGenres = getMainGenresForFamily(familyName);
                    const availableMainGenres = allMainGenres.filter(
                      (mainGenre) => !fanDetails.mainGenres.includes(mainGenre.name)
                    );
                    const selectedCount = allMainGenres.filter(mg => fanDetails.mainGenres.includes(mg.name)).length;
                    
                    return (
                      <AccordionItem
                        key={familyName}
                        value={familyName}
                        className="border border-border/60 rounded-lg px-4 shadow-sm bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <AccordionTrigger className="text-sm font-bold text-primary hover:no-underline py-4 hover:bg-muted/30 rounded-lg -mx-2 px-2 transition-colors flex-1">
                            <div className="flex items-center gap-2 flex-1 text-left">
                              <span>{familyName}</span>
                              <span className="text-xs font-normal text-foreground/60">Genre Family</span>
                              {allMainGenres.length > 0 && (
                                <span className="ml-auto text-xs font-medium text-foreground/70">
                                  {selectedCount > 0 && (
                                    <span className="text-primary mr-1">{selectedCount}/{allMainGenres.length} selected</span>
                                  )}
                                  {selectedCount === 0 && (
                                    <span className="text-foreground/60">{allMainGenres.length} available</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-base hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remove the family and all its main genres and sub-genres
                              const familyMainGenres = allMainGenres.map(mg => mg.name);
                              setFanDetails((prev) => ({
                                ...prev,
                                genreFamilies: prev.genreFamilies.filter((gf) => gf !== familyName),
                                mainGenres: prev.mainGenres.filter((mg) => !familyMainGenres.includes(mg)),
                                subGenres: prev.subGenres.filter((sg) => {
                                  // Remove sub-genres that belong to any of the family's main genres
                                  return !familyMainGenres.some(fmg => {
                                    const sgList = getSubGenresForMainGenre(fmg);
                                    return sgList.some(s => s.name === sg);
                                  });
                                })
                              }));
                            }}
                            title="Remove genre family and all its main genres and sub-genres"
                          >
                            ×
                          </Button>
                        </div>
                        <AccordionContent className="pb-4 pt-2">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground/90">Select Main Genre:</Label>
                            {loadingGenres ? (
                              <div className="flex items-center gap-2 text-sm text-foreground/70 bg-muted/30 rounded-lg p-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading main genres...</span>
                              </div>
                            ) : allMainGenres.length === 0 ? (
                              <div className="bg-muted/30 rounded-lg p-3 border border-border/40">
                                <p className="text-sm text-foreground/70 italic">
                                  No main genres found for this family. Please wait for the catalog to finish loading.
                                </p>
                              </div>
                            ) : availableMainGenres.length > 0 ? (
                            <Select
                                key={`${familyName}-${selectedCount}-${availableMainGenres.length}`}
                              onValueChange={(value) => {
                                  const mainGenre = availableMainGenres.find(m => m.id === value || m.name === value);
                                  if (mainGenre && !fanDetails.mainGenres.includes(mainGenre.name)) {
                                  setFanDetails((prev) => ({
                                    ...prev,
                                      mainGenres: [...prev.mainGenres, mainGenre.name],
                                  }));
                                }
                              }}
                            >
                                <SelectTrigger className="w-full h-10 text-sm">
                                <SelectValue placeholder="Choose a Main Genre..." />
                              </SelectTrigger>
                              <SelectContent>
                                  {availableMainGenres.map((mainGenre) => (
                                    <SelectItem key={mainGenre.id} value={mainGenre.id} className="text-sm">
                                      {mainGenre.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            ) : (
                              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                                <p className="text-sm text-foreground/80 font-medium">
                                  ✓ All Main Genres from this family have been selected.
                                </p>
                              </div>
                            )}
                            
                            {/* Show selected main genres for this family */}
                            {selectedCount > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/40">
                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 border-b border-green-200 dark:border-green-800 pb-1">Selected from this family:</p>
                                <div className="flex flex-wrap gap-2">
                                  {allMainGenres
                                    .filter(mg => fanDetails.mainGenres.includes(mg.name))
                                    .map(mg => (
                                      <Badge 
                                        key={mg.id} 
                                        variant="secondary" 
                                        className="text-xs font-medium group relative pl-3 pr-7 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                          setFanDetails((prev) => ({
                                            ...prev,
                                            mainGenres: prev.mainGenres.filter((mgName) => mgName !== mg.name),
                                            // Also remove any sub-genres from this main genre
                                            subGenres: prev.subGenres.filter((sg) => {
                                              const sgMainGenres = getSubGenresForMainGenre(mg.name);
                                              return !sgMainGenres.some(smg => smg.name === sg);
                                            })
                                          }));
                                        }}
                                        title="Click to remove"
                                      >
                                        <span className="mr-1">{mg.name}</span>
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 dark:text-red-400 font-bold text-sm">
                                          ×
                                        </span>
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </section>

            {/* STEP 3: Your Favourite Main Genres (with expandable sections for Sub-Genres) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground/90">
                    Step 3: Your Favourite Main Genres
                  </p>
                  <span className="text-xs text-foreground/60" title="Select at least 3 main genres">ℹ️</span>
                </div>
                {fanDetails.mainGenres.length > 0 && (
                  <Badge variant={fanDetails.mainGenres.length >= 3 ? "default" : "secondary"} className="text-xs font-semibold">
                    {fanDetails.mainGenres.length} selected
                    {fanDetails.mainGenres.length < 3 && ` (need ${3 - fanDetails.mainGenres.length} more)`}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">Expand a Main Genre to select Sub-Genres from that Main Genre</p>
              
              {fanDetails.mainGenres.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
                  <p className="text-sm italic text-foreground/70 text-center">
                  Choose a Main Genre from your Favourite Genre Families above.
                </p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {fanDetails.mainGenres.map((mainGenreName) => {
                    const availableSubGenres = getSubGenresForMainGenre(mainGenreName).filter(
                      (subGenre) => !fanDetails.subGenres.includes(subGenre.name)
                    );
                    const allSubGenres = getSubGenresForMainGenre(mainGenreName);
                    const selectedSubCount = allSubGenres.filter(sg => fanDetails.subGenres.includes(sg.name)).length;
                    const breadcrumb = getMainGenreBreadcrumb(mainGenreName);
                    
                    return (
                      <AccordionItem
                        key={mainGenreName}
                        value={mainGenreName}
                        className="border border-border/60 rounded-lg px-4 shadow-sm bg-card"
                      >
                        <div className="flex items-center gap-2">
                          <AccordionTrigger className="text-sm font-bold text-primary hover:no-underline py-4 hover:bg-muted/30 rounded-lg -mx-2 px-2 transition-colors flex-1">
                            <div className="flex flex-col items-start gap-1 flex-1 text-left">
                              <div className="flex items-center gap-2 w-full">
                                <span>{mainGenreName}</span>
                                <span className="text-xs font-normal text-foreground/60">Main Genre</span>
                                {allSubGenres.length > 0 && (
                                  <span className="ml-auto text-xs font-medium text-foreground/70">
                                    {selectedSubCount > 0 && (
                                      <span className="text-primary">{selectedSubCount}/{allSubGenres.length} sub-genres</span>
                                    )}
                                    {selectedSubCount === 0 && (
                                      <span className="text-foreground/60">{allSubGenres.length} available</span>
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-foreground/60 font-normal mt-0.5">
                                {breadcrumb}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-base hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFanDetails((prev) => ({
                                ...prev,
                                mainGenres: prev.mainGenres.filter((mg) => mg !== mainGenreName),
                                // Also remove any sub-genres from this main genre
                                subGenres: prev.subGenres.filter((sg) => {
                                  const sgMainGenres = getSubGenresForMainGenre(mainGenreName);
                                  return !sgMainGenres.some(smg => smg.name === sg);
                                })
                              }));
                            }}
                            title="Remove main genre and its sub-genres"
                          >
                            ×
                          </Button>
                        </div>
                        <AccordionContent className="pb-4 pt-2">
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground/90">Select Sub-Genre:</Label>
                            {availableSubGenres.length > 0 ? (
                            <Select
                                key={`${mainGenreName}-${selectedSubCount}-${availableSubGenres.length}`}
                              onValueChange={(value) => {
                                  const subGenre = availableSubGenres.find(s => s.id === value || s.name === value);
                                  if (subGenre && !fanDetails.subGenres.includes(subGenre.name)) {
                                  setFanDetails((prev) => ({
                                    ...prev,
                                      subGenres: [...prev.subGenres, subGenre.name],
                                  }));
                                }
                              }}
                            >
                                <SelectTrigger className="w-full h-10 text-sm">
                                <SelectValue placeholder="Choose a Sub-Genre..." />
                              </SelectTrigger>
                              <SelectContent>
                                  {availableSubGenres.map((subGenre) => {
                                    const parsed = parseHybridGenre(subGenre.name);
                                    return (
                                      <SelectItem key={subGenre.id} value={subGenre.id} className="text-sm">
                                        <div className="flex flex-col py-1">
                                          <span className="font-medium">{parsed.baseName}</span>
                                          {parsed.hybridInfo && (
                                            <span className="text-xs text-muted-foreground/80 mt-0.5">
                                              Hybrid: {parsed.hybridInfo}
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>
                            ) : (
                              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                                <p className="text-sm text-foreground/80 font-medium">
                                  ✓ All Sub-Genres from this main genre have been selected.
                                </p>
                              </div>
                            )}
                            
                            {/* Show selected sub-genres for this main genre */}
                            {selectedSubCount > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/40">
                                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 border-b border-green-200 dark:border-green-800 pb-1">Selected from this main genre:</p>
                                <div className="flex flex-wrap gap-2">
                                  {allSubGenres
                                    .filter(sg => fanDetails.subGenres.includes(sg.name))
                                    .map(sg => {
                                      const parsed = parseHybridGenre(sg.name);
                                      return (
                                        <Badge 
                                          key={sg.id} 
                                          variant="secondary" 
                                          className="text-xs font-medium group relative pl-3 pr-7 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200 cursor-pointer"
                                          onClick={() => {
                                            setFanDetails((prev) => ({
                                              ...prev,
                                              subGenres: prev.subGenres.filter((sgName) => sgName !== sg.name),
                                            }));
                                          }}
                                          title="Click to remove"
                                        >
                                          <span className="mr-1">{parsed.baseName}</span>
                                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 dark:text-red-400 font-bold text-sm">
                                            ×
                                          </span>
                                        </Badge>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </section>

            {/* STEP 4: Your Favourite Sub-Genres */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground/90">
                    Step 4: Your Favourite Sub-Genres
                  </p>
                  <span className="text-xs text-foreground/60" title="Optional sub-genre selections">ℹ️</span>
                </div>
                {fanDetails.subGenres.length > 0 && (
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {fanDetails.subGenres.length} selected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">Charts cover Genre Families & Main Genres, but you can search and discover music by Genre Family, Main Genre, and Sub-Genre. Gigrilla will recommend music based on all three levels of Genre ID.</p>
              
              {fanDetails.subGenres.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
                  <p className="text-sm italic text-foreground/70 text-center">
                    Choose a Sub-Genre from your Favourite Main Genres above (optional).
                </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fanDetails.subGenres.map((subGenre) => {
                    const breadcrumb = getSubGenreBreadcrumb(subGenre);
                    const parsed = parseHybridGenre(subGenre);
                    return (
                      <Card key={subGenre} id={`subgenre-${subGenre}`} className="border-primary/50 bg-primary/5 shadow-sm transition-all duration-200">
                        <CardContent className="flex items-start justify-between p-4">
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm font-semibold text-primary block mb-1">
                              {parsed.baseName}
                        </Label>
                            <div className="text-xs text-foreground/70 font-normal mb-1">
                              {breadcrumb}
                            </div>
                            {parsed.hybridInfo && (
                              <div className="text-xs text-muted-foreground/80 mt-1">
                                Hybrid: {parsed.hybridInfo}
                              </div>
                            )}
                          </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                            className="h-8 w-8 p-0 text-base hover:bg-red-100 hover:text-red-600 flex-shrink-0 ml-3 transition-all duration-200 hover:scale-110 group"
                          onClick={() => {
                            // Add animation effect before removal
                            const card = document.getElementById(`subgenre-${subGenre}`);
                            if (card) {
                              card.classList.add('animate-pulse', 'opacity-50');
                              setTimeout(() => {
                                setFanDetails((prev) => ({
                                  ...prev,
                                  subGenres: prev.subGenres.filter((sg) => sg !== subGenre),
                                }));
                              }, 150);
                            } else {
                              setFanDetails((prev) => ({
                                ...prev,
                                subGenres: prev.subGenres.filter((sg) => sg !== subGenre),
                              }));
                            }
                          }}
                            title="Kiss goodbye - Remove this sub-genre"
                        >
                          <span className="group-hover:animate-bounce">💋</span>
                        </Button>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    );
  };

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
              value={fanDetails.cardholderName || ""}
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
                value={fanDetails.cardNumber || ""}
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
                value={fanDetails.cardExpiry || ""}
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
                value={fanDetails.cardCvc || ""}
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
          <div className="space-y-4 text-sm">
            <div className="space-y-3 border-t border-border/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                Ts&amp;Cs, Privacy &amp; Payments:
              </p>
              
              <div className="space-y-4">
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
                    className="mt-1"
                  />
                  <Label htmlFor="accept-terms" className="leading-relaxed flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Gigrilla Terms &amp; Conditions of Membership Document</span>
                      <Link 
                        href="#" 
                        download
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Download Terms & Conditions"
                      >
                        <Download className="h-4 w-4" />
                      </Link>
                    </div>
                    <span className="text-xs text-foreground/80">* I have read and understood the Gigrilla Terms &amp; Conditions of Membership.</span>
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
                    className="mt-1"
                  />
                  <Label htmlFor="accept-privacy" className="leading-relaxed flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Gigrilla Members Privacy &amp; Payment Policy Document</span>
                      <Link 
                        href="#" 
                        download
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Download Privacy & Payment Policy"
                      >
                        <Download className="h-4 w-4" />
                      </Link>
                    </div>
                    <span className="text-xs text-foreground/80">* I have read and understood the Gigrilla Members Privacy &amp; Payment Policy.</span>
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                Confirm Membership Subscription:
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                {subscriptionConfirmed ? (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-semibold">Subscription Confirmed</span>
                    </div>
                    <p className="text-center text-sm text-foreground/80">
                      Standard Gigrilla Membership
                    </p>
                    <p className="text-center text-lg font-bold text-primary">
                      £1.00/year
                    </p>
                    <p className="text-center text-xs text-foreground/70">
                      Full Fan Profile &amp; Full Access
                    </p>
                  </div>
                ) : (
                  <>
                    <Button
                      type="button"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wider"
                      disabled={!fanDetails.termsAccepted || !fanDetails.privacyAccepted}
                      onClick={() => {
                        // Simulate subscription confirmation
                        setSubscriptionConfirmed(true);
                        console.log('Subscription confirmed for Standard Gigrilla Membership - £1.00/year');
                      }}
                    >
                      CLICK to SUBSCRIBE
                    </Button>
                    <p className="text-center text-sm text-foreground/80">
                      to Standard Gigrilla Membership
                    </p>
                    <p className="text-center text-lg font-bold text-primary">
                      for £1.00/year
                    </p>
                    <p className="text-center text-xs text-foreground/70">
                      with Full Fan Profile &amp; Full Access
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFanProfilePicture = () => (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Fan Profile Setup</h1>
        <h2 className="text-xl font-semibold text-foreground/80">FULL FAN SIGN-UP PROFILE DETAILS</h2>
        <div className="flex items-center justify-center gap-2 text-2xl">
          <span>3️⃣</span>
          <span className="text-lg font-semibold text-foreground">Fan Profile Setup</span>
        </div>
        <p className="text-sm text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Let&apos;s populate &amp; publish your Fan Profile, so you can explore Gigrilla.
        </p>
        <div className="bg-muted/30 border border-border/40 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-xs text-foreground/70 flex items-start gap-2">
            <span className="text-primary">ℹ️</span>
            <span>
              After this, we can add any additional profile types.<br />
              All Artist, Venue, Music Service, and Music Industry Pro Profiles are built on your individual Fan Profile. Then, you can invite other Fan Profiles to become admin-members of your Artist, Venue, Music Service, or Music Industry Pro Profile from your Control Panel while logged-in.
            </span>
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            (1/3) Add your Fan Profile Picture:
          </CardTitle>
          <CardDescription className="text-sm text-foreground/75">
            <span className="font-semibold">*minimum requirement to Publish Fan Profile.</span> You can change it later from the Control Panel.
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
              <div className="flex items-center gap-3">
                <Image
                  src={fanProfile.profilePictureUrl}
                  alt="Fan profile"
                  width={128}
                  height={128}
                  unoptimized
                  className="h-32 w-32 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs text-foreground/60 mb-2">{fanProfile.profilePictureName}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setFanProfile((prev) => ({
                        ...prev,
                        profilePictureUrl: "",
                        profilePictureName: "",
                      }));
                    }}
                  >
                    😎 Manage Profile Picture
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-4 py-2 text-xs uppercase tracking-wider"
            onClick={async () => {
              // Skip, Save & Explore
              await saveFanProfile({ onboardingCompleted: true });
              router.push("/dashboard");
            }}
          >
            Skip, Save &amp; Explore
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-full px-4 py-2 text-xs uppercase tracking-wider"
            onClick={async () => {
              // Save & Add Photos Next
              await saveFanProfile();
              const photosIndex = steps.findIndex((s) => s.key === "fan-photos");
              if (photosIndex !== -1) {
                setStepIndex(photosIndex);
              }
            }}
            disabled={!fanProfile.profilePictureUrl}
          >
            Save &amp; Add Photos Next
          </Button>
          <Button
            type="button"
            variant="default"
            className="rounded-full px-4 py-2 text-xs uppercase tracking-wider"
            onClick={async () => {
              // Publish Fan Profile Only
              await saveFanProfile({ onboardingCompleted: true });
              await submitFanDetails();
              router.push("/dashboard");
            }}
            disabled={!fanProfile.profilePictureUrl}
          >
            Publish Fan Profile Only
          </Button>
          <Button
            type="button"
            variant="default"
            className="rounded-full px-4 py-2 text-xs uppercase tracking-wider"
            onClick={async () => {
              // Publish & Add Profile Type
              await saveFanProfile({ onboardingCompleted: true });
              await submitFanDetails();
              const profileAddIndex = steps.findIndex((s) => s.key === "profile-add");
              if (profileAddIndex !== -1) {
                setStepIndex(profileAddIndex);
              } else {
                router.push("/dashboard");
              }
            }}
            disabled={!fanProfile.profilePictureUrl}
          >
            Publish &amp; Add Profile Type
          </Button>
        </div>
        <p className="text-center text-xs text-foreground/60 italic">
          * Profile picture is required to publish your Fan Profile
        </p>
      </div>
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

  const renderFanVideos = () => {
    // Auto-fetch title when URL is pasted (debounced)
    const handleUrlChange = async (url: string) => {
      setFanProfile((prev) => ({ ...prev, newVideoUrl: url }));
      
      if (url.trim() && !fanProfile.newVideoTitle.trim()) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: true }));
          try {
            const metadata = await fetchYouTubeMetadata(videoId);
            if (metadata) {
              setFanProfile((prev) => ({
                ...prev,
                newVideoTitle: metadata.title,
                newVideoThumbnail: metadata.thumbnail,
              }));
            }
          } catch (error) {
            console.error("Error fetching video metadata:", error);
          }
          setFanProfile((prev) => ({ ...prev, fetchingVideoMetadata: false }));
        }
      }
    };

    return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Add Fan Videos (Optional)</CardTitle>
          <CardDescription className="text-sm text-foreground/75">
              Paste a YouTube URL to automatically fetch the title, or enter it manually. Thumbnails will be shown automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="video-url">YouTube URL *</Label>
                <Input
                  id="video-url"
                  value={fanProfile.newVideoUrl}
                  onChange={(event) => handleUrlChange(event.target.value)}
                  placeholder="https://youtu.be/... or https://www.youtube.com/watch?v=..."
                  type="url"
                />
                {fanProfile.fetchingVideoMetadata && (
                  <p className="text-xs text-foreground/60 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Fetching video information...
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-title">Video Title {fanProfile.newVideoTitle ? "(fetched)" : "(optional - will fetch from video)"}</Label>
              <Input
                id="video-title"
                value={fanProfile.newVideoTitle}
                onChange={(event) =>
                  setFanProfile((prev) => ({ ...prev, newVideoTitle: event.target.value }))
                }
                  placeholder="Title will be fetched automatically, or enter manually"
              />
            </div>
            </div>
            
            {/* Show thumbnail preview if available */}
            {fanProfile.newVideoThumbnail && (
              <div className="rounded-lg border border-border/40 p-3 bg-muted/30">
                <Label className="text-xs text-foreground/70 mb-2 block">Video Preview:</Label>
                <div className="flex items-center gap-3">
                  <img
                    src={fanProfile.newVideoThumbnail}
                    alt="Video thumbnail"
                    className="w-32 h-20 object-cover rounded-md"
                    onError={(e) => {
                      // Fallback if thumbnail fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{fanProfile.newVideoTitle || "Video"}</p>
                    <p className="text-xs text-foreground/60 mt-1">{fanProfile.newVideoUrl}</p>
            </div>
          </div>
              </div>
            )}
            
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
              onClick={handleAddVideo}
                disabled={fanProfile.fetchingVideoMetadata || !fanProfile.newVideoUrl.trim()}
            >
                {fanProfile.fetchingVideoMetadata ? "Fetching..." : "Add Video"}
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
                    newVideoThumbnail: "",
                }));
                setVideoFormError("");
              }}
            >
              Clear Fields
            </Button>
          </div>
          {videoFormError && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-2">{videoFormError}</p>
          )}
          {fanProfile.videos.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground/90">Added Videos</p>
                <div className="space-y-3">
                  {fanProfile.videos.map((video, index) => (
                    <div
                      key={`${video.title}-${video.url}-${index}`}
                      className="flex flex-col gap-3 rounded-xl border border-border/40 bg-white/60 p-4 sm:flex-row sm:items-center"
                    >
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full sm:w-32 h-20 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{video.title}</p>
                      <Link
                        href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline-offset-4 hover:underline break-all"
                      >
                        {video.url}
                      </Link>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                        className="self-start text-xs uppercase tracking-[0.18em] sm:self-auto shrink-0"
                      onClick={() => handleRemoveVideo(video)}
                    >
                      Remove
                    </Button>
                    </div>
                ))}
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs uppercase tracking-[0.2em] text-foreground/60">
          🎥 Manage Videos - Videos can be added or edited anytime from your Control Panel.
      </p>
    </div>
  );
  };

  const renderProfileAdder = () => (
    <div className="space-y-6">
      {/* Fan Profile Completed Message */}
      <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
              ✅ Fan Profile Completed!
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Your fan profile is all set up. You can now explore Gigrilla or add additional profile types below.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-foreground/70">
        You can add additional profile types now or later from your Control Panel. Switching
        between fan and extended profiles is always available via the &quot;Switch Profile&quot;
        control.
      </p>

      {/* Skip to Dashboard Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-full px-6 py-3"
          onClick={() => router.push("/fan-dashboard")}
        >
          Skip & Go to Fan Dashboard
        </Button>
      </div>

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
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🎵
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Artist Type</h3>
            <p className="text-sm text-foreground/60">Step 5 of 6</p>
          </div>
        </div>
        <p className="text-base text-foreground/80 leading-relaxed">
          Each Artist Type has a unique set of tools to help you create, perform, and collaborate.
          Choose the type that best represents you—you can always add more profiles later.
        </p>
      </div>
      
      <div className="space-y-4">
        {ARTIST_TYPE_OPTIONS.map((option) => {
          const isActive = artistSelection.typeId === option.id;
          return (
            <Card
              key={option.id}
              role="button"
              tabIndex={0}
              onClick={() => setArtistSelection({ typeId: option.id, subType: "", vocalSoundTypes: "", vocalGenreStyles: "", availability: "", instrumentCategory: "", instrument: "", songwriterOption: "", songwriterGenres: "", lyricistOption: "", lyricistGenres: "", composerOption: "", composerGenres: "" })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setArtistSelection({ typeId: option.id, subType: "", vocalSoundTypes: "", vocalGenreStyles: "", availability: "", instrumentCategory: "", instrument: "", songwriterOption: "", songwriterGenres: "", lyricistOption: "", lyricistGenres: "", composerOption: "", composerGenres: "" });
                }
              }}
              className={cn(
                "group cursor-pointer border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isActive 
                  ? "border-primary bg-primary/5 shadow-lg" 
                  : "border-border/40 hover:border-primary/30"
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                      isActive
                        ? "border-primary bg-primary scale-110"
                        : "border-border/60 bg-background group-hover:border-primary/50",
                    )}
                  >
                    {isActive && (
                      <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {option.label}
                    </h4>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              {isActive && (
                <CardContent className="pt-0 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4 pl-10">
                    <div className="h-px bg-border/40" />
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="text-primary">→</span>
                        {option.id === 'type4' ? 'Choose your voice types and availability (select all that apply)' : 
                         option.id === 'type5' ? 'Choose your instrument category and specific instrument' : 
                         option.id === 'type6' ? 'Choose your songwriter scope and genres (select all that apply)' : 
                         option.id === 'type7' ? 'Choose your lyricist scope and genres (select all that apply)' : 
                         option.id === 'type8' ? 'Choose your composer scope and genres (select all that apply)' : 'Choose your specialty'}
                        <span className="text-xs font-normal text-foreground/50">(optional)</span>
                      </Label>
                      
                      {/* Type 4 uses vocal categories and availability selection */}
                      {option.id === 'type4' && option.soundBasedVoiceDescriptors && option.genreBasedVoiceDescriptors ? (
                        <div className="space-y-6">
                          {/* Sound-Based Voice Descriptors - Single Multi-Select Dropdown */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-semibold text-foreground">
                                Sound-Based Voice Descriptions
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <span className="text-xs text-gray-500">Select at least one</span>
                            </div>
                            <p className="text-xs text-gray-600">Choose all voice descriptions that apply to your vocal style</p>
                            
                            {/* Dropdown trigger with click-outside handler */}
                            <div className="relative">
                              <button
                                type="button"
                                className={`w-full flex items-center justify-between p-3 border-2 rounded-lg bg-white transition-colors text-left ${
                                  openSoundGroup === 'sound-dropdown' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-400'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenSoundGroup(openSoundGroup === 'sound-dropdown' ? null : 'sound-dropdown')
                                }}
                              >
                                <span className="text-sm text-gray-600">
                                  {artistSelection.vocalSoundTypes 
                                    ? `${artistSelection.vocalSoundTypes.split('|').length} voice type${artistSelection.vocalSoundTypes.split('|').length > 1 ? 's' : ''} selected`
                                    : 'Click to select voice descriptions...'}
                                </span>
                                <svg
                                  className={`w-5 h-5 text-gray-400 transition-transform ${openSoundGroup === 'sound-dropdown' ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {/* Dropdown content with backdrop for click-outside */}
                              {openSoundGroup === 'sound-dropdown' && (
                                <>
                                  {/* Invisible backdrop to catch outside clicks */}
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenSoundGroup(null)
                                    }}
                                  />
                                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-purple-300 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="sticky top-0 bg-purple-50 px-3 py-2 border-b border-purple-200">
                                      <p className="text-xs text-purple-700 font-medium">Click to select • Dropdown closes when you click outside</p>
                                    </div>
                                    <div className="p-2 grid grid-cols-1 gap-1.5">
                                      {option.soundBasedVoiceDescriptors.map((descriptor) => {
                                        const soundTypesArray = artistSelection.vocalSoundTypes ? artistSelection.vocalSoundTypes.split('|').map(s => s.trim()) : []
                                        const isSelected = soundTypesArray.some(s => s.startsWith(descriptor.label))
                                        
                                        return (
                                          <div
                                            key={descriptor.id}
                                            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                                              isSelected
                                                ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                : 'border-gray-100 hover:border-purple-300 hover:bg-purple-50/50'
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              // Store as "Label (Description)" format
                                              const fullDescriptor = `${descriptor.label} (${descriptor.description})`
                                              const newSoundTypes = isSelected
                                                ? soundTypesArray.filter((s: string) => !s.startsWith(descriptor.label))
                                                : [...soundTypesArray, fullDescriptor]
                                              setArtistSelection((prev) => ({
                                                ...prev,
                                                vocalSoundTypes: newSoundTypes.length > 0 ? newSoundTypes.join('|') : ''
                                              }))
                                            }}
                                          >
                                            <div className="flex items-center gap-2.5">
                                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                                              }`}>
                                                {isSelected && (
                                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                              </div>
                                              <span className={`text-sm ${isSelected ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>
                                                {descriptor.label}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Selected sound types display - Full descriptions with X button */}
                            {artistSelection.vocalSoundTypes && (
                              <div className="space-y-2 mt-3">
                                <p className="text-xs font-medium text-purple-700">Your selected voice types:</p>
                                <div className="flex flex-col gap-2">
                                  {artistSelection.vocalSoundTypes.split('|').map((s: string) => s.trim()).map((fullDescriptor: string) => {
                                    const label = fullDescriptor.split(' (')[0]
                                    return (
                                      <div 
                                        key={label} 
                                        className="group flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200 hover:border-purple-300 transition-colors"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-purple-900">{label}</p>
                                          <p className="text-xs text-purple-700 mt-0.5">
                                            {fullDescriptor.includes('(') ? fullDescriptor.split('(')[1]?.replace(')', '') : ''}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          className="flex-shrink-0 p-1 rounded-full hover:bg-purple-200 text-purple-400 hover:text-purple-700 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const soundTypesArray = artistSelection.vocalSoundTypes?.split('|').map(s => s.trim()) || []
                                            const newSoundTypes = soundTypesArray.filter((s: string) => !s.startsWith(label))
                                            setArtistSelection((prev) => ({
                                              ...prev,
                                              vocalSoundTypes: newSoundTypes.length > 0 ? newSoundTypes.join('|') : ''
                                            }))
                                          }}
                                          aria-label={`Remove ${label}`}
                                        >
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Genre-Based Voice Descriptors - Single Multi-Select Dropdown */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-semibold text-foreground">
                                Genre-Based Voice Descriptions
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <span className="text-xs text-gray-500">Select at least one</span>
                            </div>
                            <p className="text-xs text-gray-600">Choose all genre styles that describe your vocal approach</p>
                            
                            {/* Dropdown trigger with click-outside handler */}
                            <div className="relative">
                              <button
                                type="button"
                                className={`w-full flex items-center justify-between p-3 border-2 rounded-lg bg-white transition-colors text-left ${
                                  openGenreGroup === 'genre-dropdown' ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200 hover:border-pink-400'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenGenreGroup(openGenreGroup === 'genre-dropdown' ? null : 'genre-dropdown')
                                }}
                              >
                                <span className="text-sm text-gray-600">
                                  {artistSelection.vocalGenreStyles 
                                    ? `${artistSelection.vocalGenreStyles.split('|').length} genre style${artistSelection.vocalGenreStyles.split('|').length > 1 ? 's' : ''} selected`
                                    : 'Click to select genre styles...'}
                                </span>
                                <svg
                                  className={`w-5 h-5 text-gray-400 transition-transform ${openGenreGroup === 'genre-dropdown' ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {/* Dropdown content with backdrop for click-outside */}
                              {openGenreGroup === 'genre-dropdown' && (
                                <>
                                  {/* Invisible backdrop to catch outside clicks */}
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenGenreGroup(null)
                                    }}
                                  />
                                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-pink-300 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="sticky top-0 bg-pink-50 px-3 py-2 border-b border-pink-200">
                                      <p className="text-xs text-pink-700 font-medium">Click to select • Dropdown closes when you click outside</p>
                                    </div>
                                    <div className="p-2 grid grid-cols-1 gap-1.5">
                                      {option.genreBasedVoiceDescriptors.map((descriptor) => {
                                        const genreStylesArray = artistSelection.vocalGenreStyles ? artistSelection.vocalGenreStyles.split('|').map(s => s.trim()) : []
                                        const isSelected = genreStylesArray.some(s => s.startsWith(descriptor.label))
                                        
                                        return (
                                          <div
                                            key={descriptor.id}
                                            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                                              isSelected
                                                ? 'border-pink-500 bg-pink-50 shadow-sm'
                                                : 'border-gray-100 hover:border-pink-300 hover:bg-pink-50/50'
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              // Store as "Label (Description)" format
                                              const fullDescriptor = `${descriptor.label} (${descriptor.description})`
                                              const newGenreStyles = isSelected
                                                ? genreStylesArray.filter((s: string) => !s.startsWith(descriptor.label))
                                                : [...genreStylesArray, fullDescriptor]
                                              setArtistSelection((prev) => ({
                                                ...prev,
                                                vocalGenreStyles: newGenreStyles.length > 0 ? newGenreStyles.join('|') : ''
                                              }))
                                            }}
                                          >
                                            <div className="flex items-center gap-2.5">
                                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                isSelected ? 'border-pink-600 bg-pink-600' : 'border-gray-300'
                                              }`}>
                                                {isSelected && (
                                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                              </div>
                                              <span className={`text-sm ${isSelected ? 'text-pink-900 font-medium' : 'text-gray-700'}`}>
                                                {descriptor.label}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Selected genre styles display - Full descriptions with X button */}
                            {artistSelection.vocalGenreStyles && (
                              <div className="space-y-2 mt-3">
                                <p className="text-xs font-medium text-pink-700">Your selected genre styles:</p>
                                <div className="flex flex-col gap-2">
                                  {artistSelection.vocalGenreStyles.split('|').map((s: string) => s.trim()).map((fullDescriptor: string) => {
                                    const label = fullDescriptor.split(' (')[0]
                                    return (
                                      <div 
                                        key={label} 
                                        className="group flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-pink-100/50 border border-pink-200 hover:border-pink-300 transition-colors"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-pink-900">{label}</p>
                                          <p className="text-xs text-pink-700 mt-0.5">
                                            {fullDescriptor.includes('(') ? fullDescriptor.split('(')[1]?.replace(')', '') : ''}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          className="flex-shrink-0 p-1 rounded-full hover:bg-pink-200 text-pink-400 hover:text-pink-700 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const genreStylesArray = artistSelection.vocalGenreStyles?.split('|').map(s => s.trim()) || []
                                            const newGenreStyles = genreStylesArray.filter((s: string) => !s.startsWith(label))
                                            setArtistSelection((prev) => ({
                                              ...prev,
                                              vocalGenreStyles: newGenreStyles.length > 0 ? newGenreStyles.join('|') : ''
                                            }))
                                          }}
                                          aria-label={`Remove ${label}`}
                                        >
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Validation message */}
                          {(!artistSelection.vocalSoundTypes || !artistSelection.vocalGenreStyles) && (
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <p className="text-xs text-amber-800">
                                <span className="font-semibold">Note:</span> You must select at least one option from each list (Sound-Based and Genre-Based) to complete your vocalist profile.
                              </p>
                            </div>
                          )}
                          
                          {/* Availability checkboxes */}
                          <div className="space-y-3 pt-4 border-t border-gray-200">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="text-primary">→</span>
                              What type of vocalist work are you available for?
                              <span className="text-xs font-normal text-foreground/50">(optional, select all that apply)</span>
                            </Label>
                            <div className="grid grid-cols-1 gap-2">
                              {option.availabilityOptions?.map((availabilityOption: string) => {
                                const availabilityArray = artistSelection.availability ? artistSelection.availability.split(',').map((s: string) => s.trim()) : []
                                const isSelected = availabilityArray.includes(availabilityOption)
                                
                                return (
                                  <div
                                    key={availabilityOption}
                                    className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                      isSelected
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const newAvailability = isSelected
                                        ? availabilityArray.filter((s: string) => s !== availabilityOption)
                                        : [...availabilityArray, availabilityOption]
                                      
                                      setArtistSelection((prev) => ({ 
                                        ...prev, 
                                        availability: newAvailability.length > 0 ? newAvailability.join(', ') : ''
                                      }))
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected ? 'border-green-600 bg-green-600' : 'border-gray-300'
                                      }`}>
                                        {isSelected && (
                                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`text-sm ${isSelected ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                                        {availabilityOption}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ) : option.id === 'type5' ? (
                        <div className="space-y-4">
                          {/* Dropdown to select/view instrument category */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">
                              Instrument Category
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <p className="text-xs text-gray-600">Select a category to view and pick instruments (you can switch between categories)</p>
                            <Select
                              value={artistSelection.instrumentCategory?.split('|')[0] || ''}
                              onValueChange={(value) => {
                                // Just change the view, don't reset anything
                                const currentCategories = artistSelection.instrumentCategory ? artistSelection.instrumentCategory.split('|').map(s => s.trim()) : []
                                if (!currentCategories.includes(value)) {
                                  // Add this category if not already included
                                  setArtistSelection((prev) => ({ 
                                    ...prev, 
                                    instrumentCategory: [...currentCategories, value].join('|')
                                  }))
                                }
                                // Set this as the "active" category to view
                                setOpenInstrumentCategory(value)
                              }}
                            >
                              <SelectTrigger className="h-11 border-2 font-ui hover:border-primary/50 transition-colors">
                                <SelectValue placeholder="Select instrument category..." />
                              </SelectTrigger>
                              <SelectContent>
                                {option.instrumentCategories && Object.keys(option.instrumentCategories).map((category) => {
                                  const hasSelections = artistSelection.instrument?.split('|').some(inst => 
                                    option.instrumentCategories?.[category]?.includes(inst)
                                  )
                                  return (
                                    <SelectItem key={category} value={category} className="font-ui">
                                      <span className="flex items-center gap-2">
                                        {category}
                                        {hasSelections && (
                                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        )}
                                      </span>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Multi-select specific instruments from the currently viewed category */}
                          {(openInstrumentCategory || artistSelection.instrumentCategory) && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-foreground">
                                  Select Instruments from: <span className="text-purple-600">{openInstrumentCategory || artistSelection.instrumentCategory?.split('|')[0]}</span>
                                </Label>
                                <span className="text-xs text-gray-500">Select all that apply</span>
                              </div>
                              
                              {/* Show instruments from the active category */}
                              {(() => {
                                const activeCategory = openInstrumentCategory || artistSelection.instrumentCategory?.split('|')[0] || ''
                                const instruments = option.instrumentCategories?.[activeCategory] || []
                                const instrumentsArray = artistSelection.instrument ? artistSelection.instrument.split('|').map(s => s.trim()) : []
                                
                                return (
                                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                                    <div className="grid grid-cols-2 gap-2">
                                      {instruments.map((instrument: string) => {
                                        const isSelected = instrumentsArray.includes(instrument)
                                        
                                        return (
                                          <div
                                            key={instrument}
                                            className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                                              isSelected
                                                ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const newInstruments = isSelected
                                                ? instrumentsArray.filter((s: string) => s !== instrument)
                                                : [...instrumentsArray, instrument]
                                              
                                              // Also ensure this category is tracked
                                              const currentCategories = artistSelection.instrumentCategory ? artistSelection.instrumentCategory.split('|').map(s => s.trim()) : []
                                              const updatedCategories = currentCategories.includes(activeCategory) 
                                                ? currentCategories 
                                                : [...currentCategories, activeCategory]
                                              
                                              setArtistSelection((prev) => ({
                                                ...prev,
                                                instrument: newInstruments.length > 0 ? newInstruments.join('|') : '',
                                                instrumentCategory: updatedCategories.join('|')
                                              }))
                                            }}
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                                              }`}>
                                                {isSelected && (
                                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                              </div>
                                              <span className={`text-sm ${isSelected ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>
                                                {instrument}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })()}
                              
                              {/* Quick category switcher tabs */}
                              {option.instrumentCategories && Object.keys(option.instrumentCategories).length > 1 && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                  <span className="text-xs text-gray-500 mr-1">Quick switch:</span>
                                  {Object.keys(option.instrumentCategories).map((category) => {
                                    const isActive = (openInstrumentCategory || artistSelection.instrumentCategory?.split('|')[0]) === category
                                    const hasSelections = artistSelection.instrument?.split('|').some(inst => 
                                      option.instrumentCategories?.[category]?.includes(inst)
                                    )
                                    return (
                                      <button
                                        key={category}
                                        type="button"
                                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                          isActive 
                                            ? 'bg-purple-600 text-white' 
                                            : hasSelections
                                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setOpenInstrumentCategory(category)
                                        }}
                                      >
                                        {category.replace(' Instruments', '')}
                                        {hasSelections && !isActive && ' •'}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Show selected instruments summary */}
                          {artistSelection.instrument && (
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                              <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">
                                Your Instruments ({artistSelection.instrument.split('|').length} selected)
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {artistSelection.instrument.split('|').map((s: string) => s.trim()).map((instrument: string) => (
                                  <span 
                                    key={instrument} 
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold"
                                  >
                                    ✓ {instrument}
                                    <button
                                      type="button"
                                      className="ml-1 hover:bg-purple-700 rounded-full p-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const instrumentsArray = artistSelection.instrument?.split('|').map(s => s.trim()) || []
                                        const newInstruments = instrumentsArray.filter((s: string) => s !== instrument)
                                        setArtistSelection((prev) => ({
                                          ...prev,
                                          instrument: newInstruments.length > 0 ? newInstruments.join('|') : ''
                                        }))
                                      }}
                                      aria-label={`Remove ${instrument}`}
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Availability checkboxes */}
                          <div className="mt-6 space-y-3">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="text-primary">→</span>
                              What type of instrumentalist artist are you?
                              <span className="text-xs font-normal text-foreground/50">(select all that apply)</span>
                            </Label>
                            <div className="grid grid-cols-1 gap-2">
                              {option.availabilityOptions?.map((availabilityOption: string) => {
                                const availabilityArray = artistSelection.availability ? artistSelection.availability.split(',').map((s: string) => s.trim()) : []
                                const isSelected = availabilityArray.includes(availabilityOption)
                                
                                return (
                                  <div
                                    key={availabilityOption}
                                    className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                      isSelected
                                        ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const newAvailability = isSelected
                                        ? availabilityArray.filter((s: string) => s !== availabilityOption)
                                        : [...availabilityArray, availabilityOption]
                                      
                                      setArtistSelection((prev) => ({ 
                                        ...prev, 
                                        availability: newAvailability.length > 0 ? newAvailability.join(', ') : ''
                                      }))
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-sm">{availabilityOption}</span>
                                      {isSelected && (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            
                            {/* Show selected availability */}
                            {artistSelection.availability && (
                              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                                <div className="text-xs font-semibold text-green-900 uppercase tracking-wide mb-2">Your Availability</div>
                                <div className="flex flex-wrap gap-2">
                                  {artistSelection.availability.split(',').map((s: string) => s.trim()).map((item: string) => (
                                    <span key={item} className="px-2 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                                      ✓ {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : option.id === 'type6' ? (
                        <div className="space-y-4">
                          {/* Songwriter Options */}
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold text-foreground">Songwriter Scope (select one)</Label>
                            <div className="grid grid-cols-1 gap-2">
                              {option.songwriterOptions?.map((songwriterOption: string) => {
                                const isSelected = artistSelection.songwriterOption === songwriterOption
                                const isAnyGenre = songwriterOption.toLowerCase().includes('any genre')
                                
                                return (
                                  <div
                                    key={songwriterOption}
                                    className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                      isSelected
                                        ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setArtistSelection((prev) => ({ 
                                        ...prev, 
                                        songwriterOption: songwriterOption,
                                        // Clear genre selections if "Any Genre" is selected
                                        songwriterGenres: isAnyGenre ? '' : prev.songwriterGenres
                                      }))
                                      // Auto-expand genre selection when "Specific Genre(s)" is chosen
                                      if (!isAnyGenre) {
                                        setShowSongwriterGenres(true)
                                      } else {
                                        setShowSongwriterGenres(false)
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-sm">{songwriterOption}</span>
                                      {isSelected && (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          
                          {/* Genre Selection - Only visible when "Specific Genre(s)" is selected */}
                          {artistSelection.songwriterOption?.toLowerCase().includes('specific genre') && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowSongwriterGenres(!showSongwriterGenres)
                              }}
                            >
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-gray-900">
                                    Select Your Specific Genres
                                  </span>
                                  <span className="text-red-500">*</span>
                                  {artistSelection.songwriterGenres && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                      {artistSelection.songwriterGenres.split(',').length} selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {option.genreSelection?.description}
                                </p>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${showSongwriterGenres ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {showSongwriterGenres && (
                              <div className="p-4 bg-white border-t border-gray-200">
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                  {genreFamilies.map((family) => {
                                    const selectedGenres = artistSelection.songwriterGenres ? artistSelection.songwriterGenres.split(',').map(s => s.trim()) : []
                                    const selectedInFamily = family.mainGenres?.filter(mg => selectedGenres.includes(`${family.name}: ${mg.name}`)).length || 0
                                    const isOpen = openSongwriterGenreFamily === family.id

                                    return (
                                      <div key={family.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                          type="button"
                                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setOpenSongwriterGenreFamily(isOpen ? null : family.id)
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${selectedInFamily > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                                              {family.name}
                                            </span>
                                            {selectedInFamily > 0 && (
                                              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                                {selectedInFamily}
                                              </span>
                                            )}
                                          </div>
                                          <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                        {isOpen && (
                                          <div className="p-3 bg-white border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-2">
                                              {family.mainGenres?.map((mainGenre) => {
                                                const genreKey = `${family.name}: ${mainGenre.name}`
                                                const isSelected = selectedGenres.includes(genreKey)

                                                return (
                                                  <div
                                                    key={mainGenre.id}
                                                    className={`text-left p-2 rounded-md border transition-all cursor-pointer text-sm ${
                                                      isSelected
                                                        ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md font-medium'
                                                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                                                    }`}
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      const newSelectedGenres = isSelected
                                                        ? selectedGenres.filter((s: string) => s !== genreKey)
                                                        : [...selectedGenres, genreKey]

                                                      setArtistSelection((prev) => ({
                                                        ...prev,
                                                        songwriterGenres: newSelectedGenres.length > 0 ? newSelectedGenres.join(', ') : ''
                                                      }))
                                                    }}
                                                  >
                                                    <div className="flex items-center justify-between gap-1">
                                                      <span>{mainGenre.name}</span>
                                                      {isSelected && <span className="text-xs">✓</span>}
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                          
                          {/* Show selected songwriter info */}
                          {(artistSelection.songwriterOption || artistSelection.songwriterGenres) && (
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                              <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">Your Songwriter Profile</div>
                              <div className="space-y-2">
                                {artistSelection.songwriterOption && (
                                  <div>
                                    <div className="text-xs font-medium text-purple-800 mb-1">Scope:</div>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                        ✓ {artistSelection.songwriterOption}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {artistSelection.songwriterGenres && (
                                  <div>
                                    <div className="text-xs font-medium text-purple-800 mb-1">Searchable Genres:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {artistSelection.songwriterGenres.split(',').map((s: string) => s.trim()).map((genre: string) => (
                                        <span key={genre} className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                          ✓ {genre}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : option.id === 'type7' ? (
                        <div className="space-y-4">
                          {/* Lyricist Options */}
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold text-foreground">Lyricist Scope (select one)</Label>
                            <div className="grid grid-cols-1 gap-2">
                              {option.lyricistOptions?.map((lyricistOption: string) => {
                                const isSelected = artistSelection.lyricistOption === lyricistOption
                                const isAnyGenre = lyricistOption.toLowerCase().includes('any genre')
                                
                                return (
                                  <div
                                    key={lyricistOption}
                                    className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                      isSelected
                                        ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setArtistSelection((prev) => ({ 
                                        ...prev, 
                                        lyricistOption: lyricistOption,
                                        // Clear genre selections if "Any Genre" is selected
                                        lyricistGenres: isAnyGenre ? '' : prev.lyricistGenres
                                      }))
                                      // Auto-expand genre selection when "Specific Genre(s)" is chosen
                                      if (!isAnyGenre) {
                                        setShowLyricistGenres(true)
                                      } else {
                                        setShowLyricistGenres(false)
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-sm">{lyricistOption}</span>
                                      {isSelected && (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          
                          {/* Genre Selection - Only visible when "Specific Genre(s)" is selected */}
                          {artistSelection.lyricistOption?.toLowerCase().includes('specific genre') && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowLyricistGenres(!showLyricistGenres)
                              }}
                            >
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-gray-900">
                                    Select Your Specific Genres
                                  </span>
                                  <span className="text-red-500">*</span>
                                  {artistSelection.lyricistGenres && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                      {artistSelection.lyricistGenres.split(',').length} selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {option.genreSelection?.description}
                                </p>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${showLyricistGenres ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {showLyricistGenres && (
                              <div className="p-4 bg-white border-t border-gray-200">
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                  {genreFamilies.map((family) => {
                                    const selectedGenres = artistSelection.lyricistGenres ? artistSelection.lyricistGenres.split(',').map(s => s.trim()) : []
                                    const selectedInFamily = family.mainGenres?.filter(mg => selectedGenres.includes(`${family.name}: ${mg.name}`)).length || 0
                                    const isOpen = openLyricistGenreFamily === family.id

                                    return (
                                      <div key={family.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                          type="button"
                                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setOpenLyricistGenreFamily(isOpen ? null : family.id)
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${selectedInFamily > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                                              {family.name}
                                            </span>
                                            {selectedInFamily > 0 && (
                                              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                                {selectedInFamily}
                                              </span>
                                            )}
                                          </div>
                                          <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                        {isOpen && (
                                          <div className="p-3 bg-white border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-2">
                                              {family.mainGenres?.map((mainGenre) => {
                                                const genreKey = `${family.name}: ${mainGenre.name}`
                                                const isSelected = selectedGenres.includes(genreKey)

                                                return (
                                                  <div
                                                    key={mainGenre.id}
                                                    className={`text-left p-2 rounded-md border transition-all cursor-pointer text-sm ${
                                                      isSelected
                                                        ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md font-medium'
                                                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                                                    }`}
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      const newSelectedGenres = isSelected
                                                        ? selectedGenres.filter((s: string) => s !== genreKey)
                                                        : [...selectedGenres, genreKey]

                                                      setArtistSelection((prev) => ({
                                                        ...prev,
                                                        lyricistGenres: newSelectedGenres.length > 0 ? newSelectedGenres.join(', ') : ''
                                                      }))
                                                    }}
                                                  >
                                                    <div className="flex items-center justify-between gap-1">
                                                      <span>{mainGenre.name}</span>
                                                      {isSelected && <span className="text-xs">✓</span>}
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                          
                          {/* Show selected lyricist info */}
                          {(artistSelection.lyricistOption || artistSelection.lyricistGenres) && (
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                              <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">Your Lyricist Profile</div>
                              <div className="space-y-2">
                                {artistSelection.lyricistOption && (
                                  <div>
                                    <div className="text-xs font-medium text-purple-800 mb-1">Scope:</div>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                        ✓ {artistSelection.lyricistOption}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {artistSelection.lyricistGenres && (
                                  <div>
                                    <div className="text-xs font-medium text-purple-800 mb-1">Searchable Genres:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {artistSelection.lyricistGenres.split(',').map((s: string) => s.trim()).map((genre: string) => (
                                        <span key={genre} className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                          ✓ {genre}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : option.id === 'type8' ? (
                        <div className="space-y-4">
                          {/* Composer Options */}
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold text-foreground">Composer Scope (select one)</Label>
                            <div className="grid grid-cols-1 gap-2">
                              {option.composerOptions?.map((composerOption: string) => {
                                const isSelected = artistSelection.composerOption === composerOption
                                const isAnyGenre = composerOption.toLowerCase().includes('any genre')
                                
                                return (
                                  <div
                                    key={composerOption}
                                    className={`text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                      isSelected
                                        ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setArtistSelection((prev) => ({ 
                                        ...prev, 
                                        composerOption: composerOption,
                                        // Clear genre selections if "Any Genre" is selected
                                        composerGenres: isAnyGenre ? '' : prev.composerGenres
                                      }))
                                      // Auto-expand genre selection when "Specific Genre(s)" is chosen
                                      if (!isAnyGenre) {
                                        setShowComposerGenres(true)
                                      } else {
                                        setShowComposerGenres(false)
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-sm">{composerOption}</span>
                                      {isSelected && (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          
                          {/* Genre Selection - Only visible when "Specific Genre(s)" is selected */}
                          {artistSelection.composerOption?.toLowerCase().includes('specific genre') && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <button
                              type="button"
                              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowComposerGenres(!showComposerGenres)
                              }}
                            >
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-gray-900">
                                    Select Your Specific Genres
                                  </span>
                                  <span className="text-red-500">*</span>
                                  {artistSelection.composerGenres && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                      {artistSelection.composerGenres.split(',').length} selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {option.genreSelection?.description}
                                </p>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${showComposerGenres ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {showComposerGenres && (
                              <div className="p-4 bg-white border-t border-gray-200">
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                  {genreFamilies.map((family) => {
                                    const selectedGenres = artistSelection.composerGenres ? artistSelection.composerGenres.split(',').map(s => s.trim()) : []
                                    const selectedInFamily = family.mainGenres?.filter(mg => selectedGenres.includes(`${family.name}: ${mg.name}`)).length || 0
                                    const isOpen = openComposerGenreFamily === family.id

                                    return (
                                      <div key={family.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                          type="button"
                                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setOpenComposerGenreFamily(isOpen ? null : family.id)
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${selectedInFamily > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                                              {family.name}
                                            </span>
                                            {selectedInFamily > 0 && (
                                              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                                {selectedInFamily}
                                              </span>
                                            )}
                                          </div>
                                          <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                        {isOpen && (
                                          <div className="p-3 bg-white border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-2">
                                              {family.mainGenres?.map((mainGenre) => {
                                                const genreKey = `${family.name}: ${mainGenre.name}`
                                                const isSelected = selectedGenres.includes(genreKey)

                                                return (
                                                  <div
                                                    key={mainGenre.id}
                                                    className={`text-left p-2 rounded-md border transition-all cursor-pointer text-sm ${
                                                      isSelected
                                                        ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md font-medium'
                                                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                                                    }`}
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      const newSelectedGenres = isSelected
                                                        ? selectedGenres.filter((s: string) => s !== genreKey)
                                                        : [...selectedGenres, genreKey]

                                                      setArtistSelection((prev) => ({
                                                        ...prev,
                                                        composerGenres: newSelectedGenres.length > 0 ? newSelectedGenres.join(', ') : ''
                                                      }))
                                                    }}
                                                  >
                                                    <div className="flex items-center justify-between gap-1">
                                                      <span>{mainGenre.name}</span>
                                                      {isSelected && <span className="text-xs">✓</span>}
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                          
                          {/* Show selected composer info */}
                          {(artistSelection.composerOption || artistSelection.composerGenres) && (
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                              <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">Your Composer Profile</div>
                              <div className="space-y-2">
                                {artistSelection.composerOption && (
                                  <div>
                                    <div className="text-xs font-medium text-purple-800 mb-1">Scope:</div>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                        ✓ {artistSelection.composerOption}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {artistSelection.composerGenres && (
                                  <div>
                                    <div className="text-xs font-medium text-purple-800 mb-1">Searchable Genres:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {artistSelection.composerGenres.split(',').map((s: string) => s.trim()).map((genre: string) => (
                                        <span key={genre} className="px-2 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                                          ✓ {genre}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Scroll indicator banner */}
                          {option.subTypes && option.subTypes.length > 8 && (
                            <div className="rounded-lg bg-purple-100 border-2 border-purple-400 p-3 text-center">
                              <div className="flex items-center justify-center text-purple-900 font-semibold text-xs">
                                <span>{option.subTypes.length} Specialties - Dropdown Scrolls!</span>
                              </div>
                            </div>
                          )}
                          
                          {option.subTypes && (
                            <Select
                              value={artistSelection.subType}
                              onValueChange={(value) =>
                                setArtistSelection((prev) => ({ ...prev, subType: value }))
                              }
                            >
                              <SelectTrigger className="h-11 border-2 font-ui hover:border-primary/50 transition-colors">
                                <SelectValue placeholder="Select a specialty..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {option.subTypes.map((sub: string) => (
                                  <SelectItem key={sub} value={sub} className="font-ui">
                                    {sub}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {option.subTypes && option.subTypes.length > 8 && (
                            <p className="text-xs text-orange-700 font-semibold bg-orange-50 border border-orange-300 rounded px-3 py-2 text-center">
                              ⚠️ This dropdown has {option.subTypes.length} options - scroll inside the dropdown to see all specialties!
                            </p>
                          )}
                          
                          {/* Show selected specialty */}
                          {artistSelection.subType && (
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <div>
                                  <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Selected Specialty</div>
                                  <div className="text-sm font-bold text-purple-700">{artistSelection.subType}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-6 space-y-2 border-t border-border/40 pt-4">
                      <Button
                        className="w-full rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90 sm:w-auto"
                        disabled={!canProceed() || isProcessingStep}
                        onClick={handleNext}
                      >
                        {isProcessingStep ? 'Working…' : `Proceed with ${option.label}`}
                      </Button>
                      <p className="text-xs text-foreground/70">
                        You can revisit this selection later from your Control Panel.
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Overall selection summary */}
      {artistSelection.typeId && (
        <div className="flex flex-col gap-4 rounded-lg border-2 border-green-400 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <div className="font-bold text-green-900 mb-1">Your Artist Type Selection</div>
              <div className="space-y-1 text-sm text-green-800">
                <div>
                  <span className="font-semibold">Type:</span> {ARTIST_TYPE_OPTIONS.find(opt => opt.id === artistSelection.typeId)?.label}
                </div>
                {artistSelection.subType && (
                  <div>
                    <span className="font-semibold">Specialty:</span> {artistSelection.subType}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            className="w-full rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90 sm:w-auto"
            disabled={!canProceed() || isProcessingStep}
            onClick={handleNext}
          >
            {isProcessingStep ? 'Working…' : 'Proceed with selection'}
          </Button>
        </div>
      )}
      
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex gap-3">
          <div className="text-xl">💡</div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Need multiple profiles?</p>
            <p className="text-xs text-foreground/70">
              You can add additional artist types later from your Control Panel. Start with the one that best represents your primary work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderArtistProfileSetup = () => (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🎤
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Artist Profile Setup</h3>
            <p className="text-sm text-foreground/60">Step 6 of 6 • Final Step</p>
          </div>
        </div>
        <p className="text-base text-foreground/80 leading-relaxed">
          Complete your artist profile to start making money on Gigrilla. This information helps fans and venues discover and connect with you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Artist Details */}
        <Card className="border-2 border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h4 className="text-lg font-bold text-foreground">Artist Details</h4>
            </div>
            <p className="text-xs text-foreground/60 mt-1">Basic information about your artist identity</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stageName" className="font-semibold">
                  Artist Stage Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stageName"
                  placeholder="The name you perform under..."
                  value={artistProfile.stageName}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, stageName: e.target.value }))}
                  className="font-ui h-11 border-2 focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formedDate" className="font-semibold flex items-center gap-2">
                  Artist Formed <span className="text-lg">🗓️</span>
                </Label>
                <div className="relative">
                  <Input
                    id="formedDate"
                    type="month"
                    value={artistProfile.formedDate}
                    onChange={(e) => setArtistProfile(prev => ({ ...prev, formedDate: e.target.value }))}
                    className="font-ui h-11 border-2 focus:border-primary pr-12"
                    placeholder="mm/yyyy"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    📅
                  </div>
                </div>
                <p className="text-xs text-foreground/60 italic">
                  Select the month and year when you started performing together
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="performingMembers" className="font-semibold">Number of Performing Members</Label>
                <Input
                  id="performingMembers"
                  type="number"
                  min="1"
                  value={artistProfile.performingMembers}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, performingMembers: parseInt(e.target.value) || 1 }))}
                  className="font-ui h-11 border-2 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicGigsPerformed" className="font-semibold">Public Gigs Performed</Label>
                <Input
                  id="publicGigsPerformed"
                  type="number"
                  min="0"
                  placeholder="Before joining Gigrilla..."
                  value={artistProfile.publicGigsPerformed}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, publicGigsPerformed: parseInt(e.target.value) || 0 }))}
                  className="font-ui h-11 border-2 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseLocation" className="font-semibold">Artist Base Location</Label>
              <div className="relative">
                <Input
                  id="baseLocation"
                  placeholder="Start typing city, address, or postal code..."
                  value={artistProfile.baseLocation}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setArtistProfile(prev => ({ ...prev, baseLocation: value }));
                    
                    // Fetch location suggestions
                    if (value.length >= 3) {
                      try {
                        const response = await fetch(`/api/location-search?query=${encodeURIComponent(value)}`);
                        const data = await response.json();
                        if (data.suggestions && data.suggestions.length > 0) {
                          // Store suggestions in state for dropdown
                          setLocationSuggestions(data.suggestions);
                        }
                      } catch (error) {
                        console.error('Location search error:', error);
                      }
                    } else {
                      setLocationSuggestions([]);
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow click on suggestion
                    setTimeout(() => setLocationSuggestions([]), 200);
                  }}
                  className="font-ui h-11 border-2 focus:border-primary"
                />
                {locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion) => {
                      // Format as: City/Town(+State?), Country
                      const cityPart = suggestion.city || '';
                      const statePart = suggestion.state ? `, ${suggestion.state}` : '';
                      const countryPart = suggestion.country || '';
                      const displayLocation = cityPart && countryPart 
                        ? `${cityPart}${statePart}, ${countryPart}`
                        : suggestion.formatted;
                      
                      return (
                        <button
                          key={suggestion.id}
                          type="button"
                          onClick={() => {
                            setArtistProfile(prev => ({ 
                              ...prev, 
                              baseLocation: displayLocation,
                              baseLocationLat: suggestion.lat || null,
                              baseLocationLon: suggestion.lon || null
                            }));
                            setLocationSuggestions([]);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-border/30 last:border-0"
                        >
                          <div className="text-sm font-medium text-foreground">{displayLocation}</div>
                          {suggestion.formatted && suggestion.formatted !== displayLocation && (
                            <div className="text-xs text-foreground/60 mt-1">
                              📍 {suggestion.formatted}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-xs text-foreground/60 italic flex items-start gap-1">
                <span>ℹ️</span>
                <span>Start typing to search locations. Your profile will display as: City/Town, State/Province, Country</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="border-2 border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h4 className="text-lg font-bold text-foreground">Social Media Accounts</h4>
            </div>
            <p className="text-xs text-foreground/60 mt-1">Connect your social profiles to build your online presence</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl" className="flex items-center gap-2">
                  <span className="text-blue-600">f</span>
                  Facebook
                </Label>
                <Input
                  id="facebookUrl"
                  placeholder="facebook.com/yourartist"
                  value={artistProfile.facebookUrl}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, facebookUrl: e.target.value }))}
                  className="font-ui h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                  <span className="text-pink-600">📷</span>
                  Instagram
                </Label>
                <Input
                  id="instagramUrl"
                  placeholder="instagram.com/yourartist"
                  value={artistProfile.instagramUrl}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, instagramUrl: e.target.value }))}
                  className="font-ui h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threadsUrl" className="flex items-center gap-2">
                  <span className="text-gray-800">🧵</span>
                  Threads
                </Label>
                <Input
                  id="threadsUrl"
                  placeholder="threads.net/@yourartist"
                  value={artistProfile.threadsUrl}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, threadsUrl: e.target.value }))}
                  className="font-ui h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xUrl" className="flex items-center gap-2">
                  <span className="text-gray-900">𝕏</span>
                  X (Twitter)
                </Label>
                <Input
                  id="xUrl"
                  placeholder="x.com/yourartist"
                  value={artistProfile.xUrl}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, xUrl: e.target.value }))}
                  className="font-ui h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktokUrl" className="flex items-center gap-2">
                  <span className="text-gray-900">🎵</span>
                  TikTok
                </Label>
                <Input
                  id="tiktokUrl"
                  placeholder="tiktok.com/@yourartist"
                  value={artistProfile.tiktokUrl}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, tiktokUrl: e.target.value }))}
                  className="font-ui h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
                  <span className="text-red-600">▶️</span>
                  YouTube
                </Label>
                <Input
                  id="youtubeUrl"
                  placeholder="youtube.com/@yourartist"
                  value={artistProfile.youtubeUrl}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  className="font-ui h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapchatUrl" className="flex items-center gap-2">
                  <span className="text-yellow-400">👻</span>
                  Snapchat
                </Label>
                <Input
                  id="snapchatUrl"
                  placeholder="snapchat.com/add/yourartist"
                  value={artistProfile.snapchatUrl}
                  onChange={(e) => setArtistProfile(prev => ({ ...prev, snapchatUrl: e.target.value }))}
                  className="font-ui h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Status */}
        <Card className="border-2 border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h4 className="text-lg font-bold text-foreground">Contract Status</h4>
            </div>
            <p className="text-xs text-foreground/60 mt-1">Tell us about your industry relationships and representation</p>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Record Label */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Record Label Status</Label>
                <Select
                  value={artistProfile.recordLabelStatus}
                  onValueChange={(value) => setArtistProfile(prev => ({ ...prev, recordLabelStatus: value }))}
                >
                  <SelectTrigger className="font-ui">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Signed to Label</SelectItem>
                    <SelectItem value="independent">Self-Signed: Independent</SelectItem>
                    <SelectItem value="seeking">Seeking Label</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {artistProfile.recordLabelStatus === "signed" && (
                <div className="space-y-4 pl-4 border-l-2 border-border/40">
                  <p className="text-xs text-foreground/60 italic">
                    ℹ️ If your Record Label is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Label company name below to help us invite and match them to you.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="recordLabelName">Record Label Name</Label>
                      <Input
                        id="recordLabelName"
                        placeholder="Start typing label company name…"
                        value={artistProfile.recordLabelName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, recordLabelName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recordLabelContactName">Record Label Contact Name</Label>
                      <Input
                        id="recordLabelContactName"
                        placeholder="Start typing contact name…"
                        value={artistProfile.recordLabelContactName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, recordLabelContactName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recordLabelContactEmail">Record Label Contact Email</Label>
                      <Input
                        id="recordLabelContactEmail"
                        type="email"
                        placeholder="contact@company.com…"
                        value={artistProfile.recordLabelContactEmail}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, recordLabelContactEmail: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recordLabelContactPhone">Record Label Contact Phone</Label>
                      <Input
                        id="recordLabelContactPhone"
                        placeholder="Country Code + phone number…"
                        value={artistProfile.recordLabelContactPhone}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, recordLabelContactPhone: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Music Publisher */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Music Publisher Status</Label>
                <Select
                  value={artistProfile.musicPublisherStatus}
                  onValueChange={(value) => setArtistProfile(prev => ({ ...prev, musicPublisherStatus: value }))}
                >
                  <SelectTrigger className="font-ui">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Signed to Publisher</SelectItem>
                    <SelectItem value="independent">Self-Publishing: Independent</SelectItem>
                    <SelectItem value="seeking">Seeking Publisher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {artistProfile.musicPublisherStatus === "signed" && (
                <div className="space-y-4 pl-4 border-l-2 border-border/40">
                  <p className="text-xs text-foreground/60 italic">
                    ℹ️ If your Music Publisher is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Publisher company name below to help us invite and match them to you.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="musicPublisherName">Music Publisher Name</Label>
                      <Input
                        id="musicPublisherName"
                        placeholder="Start typing publisher company name…"
                        value={artistProfile.musicPublisherName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, musicPublisherName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="musicPublisherContactName">Music Publisher Contact Name</Label>
                      <Input
                        id="musicPublisherContactName"
                        placeholder="Start typing contact name…"
                        value={artistProfile.musicPublisherContactName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, musicPublisherContactName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="musicPublisherContactEmail">Music Publisher Contact Email</Label>
                      <Input
                        id="musicPublisherContactEmail"
                        type="email"
                        placeholder="contact@company.com…"
                        value={artistProfile.musicPublisherContactEmail}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, musicPublisherContactEmail: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="musicPublisherContactPhone">Music Publisher Contact Phone</Label>
                      <Input
                        id="musicPublisherContactPhone"
                        placeholder="Country Code + phone number…"
                        value={artistProfile.musicPublisherContactPhone}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, musicPublisherContactPhone: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Artist Manager */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Artist Manager Status</Label>
                <Select
                  value={artistProfile.artistManagerStatus}
                  onValueChange={(value) => setArtistProfile(prev => ({ ...prev, artistManagerStatus: value }))}
                >
                  <SelectTrigger className="font-ui">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Managed Artist</SelectItem>
                    <SelectItem value="self_managed">Self-Managed: Independent</SelectItem>
                    <SelectItem value="seeking">Seeking Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {artistProfile.artistManagerStatus === "signed" && (
                <div className="space-y-4 pl-4 border-l-2 border-border/40">
                  <p className="text-xs text-foreground/60 italic">
                    ℹ️ If your Manager is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Management company name below to help us invite and match them to you.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="artistManagerName">Artist Manager Name</Label>
                      <Input
                        id="artistManagerName"
                        placeholder="Start typing management company name…"
                        value={artistProfile.artistManagerName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, artistManagerName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artistManagerContactName">Artist Manager Contact Name</Label>
                      <Input
                        id="artistManagerContactName"
                        placeholder="Start typing contact name…"
                        value={artistProfile.artistManagerContactName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, artistManagerContactName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artistManagerContactEmail">Artist Manager Contact Email</Label>
                      <Input
                        id="artistManagerContactEmail"
                        type="email"
                        placeholder="contact@company.com…"
                        value={artistProfile.artistManagerContactEmail}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, artistManagerContactEmail: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="artistManagerContactPhone">Artist Manager Contact Phone</Label>
                      <Input
                        id="artistManagerContactPhone"
                        placeholder="Country Code + phone number…"
                        value={artistProfile.artistManagerContactPhone}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, artistManagerContactPhone: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Agent */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Booking Agent Status</Label>
                <Select
                  value={artistProfile.bookingAgentStatus}
                  onValueChange={(value) => setArtistProfile(prev => ({ ...prev, bookingAgentStatus: value }))}
                >
                  <SelectTrigger className="font-ui">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Signed to Booking Agent</SelectItem>
                    <SelectItem value="self_managed">Self-Booking: Independent</SelectItem>
                    <SelectItem value="seeking">Seeking Booking Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {artistProfile.bookingAgentStatus === "signed" && (
                <div className="space-y-4 pl-4 border-l-2 border-border/40">
                  <p className="text-xs text-foreground/60 italic">
                    ℹ️ If your Booking Agent is already on Gigrilla they&apos;ll show-up as you start to type. If not, just finish typing their full Agency company name below to help us invite and match them to you.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bookingAgentName">Booking Agent Name</Label>
                      <Input
                        id="bookingAgentName"
                        placeholder="Start typing agency company name…"
                        value={artistProfile.bookingAgentName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, bookingAgentName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookingAgentContactName">Booking Agent Contact Name</Label>
                      <Input
                        id="bookingAgentContactName"
                        placeholder="Start typing contact name…"
                        value={artistProfile.bookingAgentContactName}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, bookingAgentContactName: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookingAgentContactEmail">Booking Agent Contact Email</Label>
                      <Input
                        id="bookingAgentContactEmail"
                        type="email"
                        placeholder="contact@company.com…"
                        value={artistProfile.bookingAgentContactEmail}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, bookingAgentContactEmail: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookingAgentContactPhone">Booking Agent Contact Phone</Label>
                      <Input
                        id="bookingAgentContactPhone"
                        placeholder="Country Code + phone number…"
                        value={artistProfile.bookingAgentContactPhone}
                        onChange={(e) => setArtistProfile(prev => ({ ...prev, bookingAgentContactPhone: e.target.value }))}
                        className="font-ui"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completion Message */}
        <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="text-3xl">🎉</div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-foreground">Almost There!</h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Once you complete this profile, you&apos;ll have access to your Artist Dashboard where you can upload music, 
                book gigs, connect with fans, and start earning. Click <strong>Go to Artist Dashboard</strong> below to finish your setup!
              </p>
            </div>
          </div>
        </div>
      </div>
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
                    {option.subTypes?.map((sub: string) => (
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
      case "artist-profile-setup":
        return renderArtistProfileSetup();
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

  if (artistRedirectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-center">
        <div className="space-y-4">
          <p className="uppercase tracking-[0.35em] text-[0.7rem] text-foreground-alt/70">
            Preparing Artist Dashboard
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="size-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-foreground/70">
              Checking your artist profile status…
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              {currentStep?.label}
            </span>
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
              onClick={async () => {
                if (!canAdvance || isProcessingStep) return;
                
                setIsProcessingStep(true);
                
                // Save artist profile if on artist-profile-setup step
                if (currentStep?.key === "artist-profile-setup") {
                  console.log('💾 Saving artist profile...', {
                    stageName: artistProfile.stageName,
                    artistTypeId: artistSelection.typeId,
                    artistSubType: artistSelection.subType
                  });
                  try {
                    const response = await fetch('/api/artist-profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        stage_name: artistProfile.stageName,
                        established_date: artistProfile.formedDate ? `${artistProfile.formedDate}-01` : null,
                        performing_members: artistProfile.performingMembers,
                        base_location: artistProfile.baseLocation,
                        base_location_lat: artistProfile.baseLocationLat,
                        base_location_lon: artistProfile.baseLocationLon,
                        gigs_performed: artistProfile.publicGigsPerformed,
                        facebook_url: artistProfile.facebookUrl,
                        instagram_url: artistProfile.instagramUrl,
                        threads_url: artistProfile.threadsUrl,
                        x_url: artistProfile.xUrl,
                        tiktok_url: artistProfile.tiktokUrl,
                        youtube_url: artistProfile.youtubeUrl,
                        snapchat_url: artistProfile.snapchatUrl,
                        record_label_status: artistProfile.recordLabelStatus,
                        record_label_name: artistProfile.recordLabelName,
                        record_label_contact_name: artistProfile.recordLabelContactName,
                        record_label_email: artistProfile.recordLabelContactEmail,
                        record_label_phone: artistProfile.recordLabelContactPhone,
                        music_publisher_status: artistProfile.musicPublisherStatus,
                        music_publisher_name: artistProfile.musicPublisherName,
                        music_publisher_contact_name: artistProfile.musicPublisherContactName,
                        music_publisher_email: artistProfile.musicPublisherContactEmail,
                        music_publisher_phone: artistProfile.musicPublisherContactPhone,
                        artist_manager_status: artistProfile.artistManagerStatus,
                        artist_manager_name: artistProfile.artistManagerName,
                        artist_manager_contact_name: artistProfile.artistManagerContactName,
                        artist_manager_email: artistProfile.artistManagerContactEmail,
                        artist_manager_phone: artistProfile.artistManagerContactPhone,
                        booking_agent_status: artistProfile.bookingAgentStatus,
                        booking_agent_name: artistProfile.bookingAgentName,
                        booking_agent_contact_name: artistProfile.bookingAgentContactName,
                        booking_agent_email: artistProfile.bookingAgentContactEmail,
                        booking_agent_phone: artistProfile.bookingAgentContactPhone,
                        artist_type_id: artistSelection.typeId ? parseInt(artistSelection.typeId.replace('type', '')) : null,
                        artist_sub_types: artistSelection.subType ? [artistSelection.subType] : [],
                        vocal_sound_types: artistSelection.vocalSoundTypes || null,
                        vocal_genre_styles: artistSelection.vocalGenreStyles || null,
                        availability: artistSelection.availability || null,
                        instrument_category: artistSelection.instrumentCategory || null,
                        instrument: artistSelection.instrument || null,
                        songwriter_option: artistSelection.songwriterOption || null,
                        songwriter_genres: artistSelection.songwriterGenres || null,
                        lyricist_option: artistSelection.lyricistOption || null,
                        lyricist_genres: artistSelection.lyricistGenres || null,
                        composer_option: artistSelection.composerOption || null,
                        composer_genres: artistSelection.composerGenres || null
                      })
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}));
                      console.error('API Error Response:', errorData);
                      throw new Error(`Failed to save artist profile: ${errorData.error || response.statusText}`);
                    }
                    
                    console.log('✅ Artist profile saved successfully');
                  } catch (error) {
                    console.error('Error saving artist profile:', error);
                    // Continue to redirect even if save fails
                  }
                }
                
                setIsProcessingStep(false);
                
                // Redirect to appropriate dashboard
                let target = "/control-panel";
                if (accountChoice === "guest") {
                  target = "/control-panel?mode=guest";
                } else if (selectedMemberType === "artist") {
                  target = "/artist-dashboard";
                }
                router.push(target);
              }}
              disabled={!canAdvance || isProcessingStep}
              variant="secondary"
              className="rounded-full px-5 py-2 text-[0.7rem] uppercase tracking-[0.18em]"
            >
              {isProcessingStep ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : accountChoice === "guest" 
                ? "Explore as Guest" 
                : selectedMemberType === "artist"
                ? "Go to Artist Dashboard"
                : "Go to Control Panel"}
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
                  Next
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
