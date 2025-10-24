import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "Keep 100% of Your Music Revenue",
    description:
      "Streaming and download revenue routes directly to rights holders with transparent splits and no platform cut.",
  },
  {
    title: "Book More Gigs",
    description:
      "Publish availability, set gig fees, and accept fan and venue offers with built-in contracts and payment release.",
  },
  {
    title: "Collaborate & Grow",
    description:
      "Invite managers, songwriters, and crew to your profile, assign roles, and share royalties through built-in splits.",
  },
  {
    title: "Built for Every Artist Type",
    description:
      "Originals, live gig performers, vocalists for hire, instrumentalists, songwriters, lyricists, and composers each get tailored workflows.",
  },
];

const CTAS = [
  { label: "Sign-up", href: "/signup", variant: "primary" as const },
  { label: "Explore Artist Setup", href: "/artist-setup", variant: "secondary" as const },
];

export default function MusicArtistsPage() {
  return (
    <MarketingPage
      eyebrow="Artists"
      title="Music Artists on Gigrilla"
      description="Join a fair trade ecosystem designed to help you record, release, perform, and collaborate on your terms."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
