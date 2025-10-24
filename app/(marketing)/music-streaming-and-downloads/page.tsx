import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "Fair Play Music Streaming",
    description:
      "30-second previews on every track and £0.02 pay-per-play ensures every listen is deliberate, transparent, and fairly rewarded.",
  },
  {
    title: "Fair Play Music Downloads",
    description:
      "Own the music you love with £0.50 single downloads or £4.00 albums—100% goes straight to the rights holders.",
  },
  {
    title: "Support The Gig Economy",
    description:
      "Search live and streaming gigs by artist, venue, genre, or location, then book directly without hidden fees.",
  },
  {
    title: "Arrange Private Fan Gigs & Merch",
    description:
      "Invite artists to perform private shows and pick up exclusive merchandise to support them beyond the stage.",
  },
];

const CTAS = [
  { label: "Sign-up", href: "/signup", variant: "primary" as const },
  { label: "Download Desktop App", href: "#download-desktop-app", variant: "secondary" as const },
  { label: "Download Mobile App", href: "#download-mobile-app", variant: "outline" as const },
];

export default function MusicStreamingAndDownloadsPage() {
  return (
    <MarketingPage
      eyebrow="Fair Trade Music"
      title="Music Streaming & Downloads"
      description="Stream and download music the fair trade way. Pay only for what you play, know every penny supports artists and rights holders, and build a collection you can enjoy anywhere."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
