import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "GigFinder",
    description:
      "Search by artist, venue, genre, mood, or location to uncover live and streaming performances the moment they publish.",
  },
  {
    title: "Gig Booker",
    description:
      "Send offers, confirm bookings, manage contracts, and release payments on completion—everything in one workflow.",
  },
  {
    title: "Private Fan Gigs",
    description:
      "Book artists into venues for private shows or host them in your own space with privacy-first controls.",
  },
  {
    title: "Safety & Best Practice",
    description:
      "Access safety checklists, dos and don’ts, ticketing, and gatekeeping tools so gigs stay secure for everyone involved.",
  },
];

const CTAS = [
  { label: "Find Gigs", href: "/signup", variant: "primary" as const },
  { label: "Learn About Venues", href: "/live-music-venues", variant: "secondary" as const },
];

export default function FindAndArrangeMusicGigsPage() {
  return (
    <MarketingPage
      eyebrow="Gigs"
      title="Find & Arrange Music Gigs"
      description="Connect artists, venues, and fans with transparent gig management. Discover opportunities, manage bookings, and celebrate the live music economy."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
