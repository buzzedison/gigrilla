import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "Be Part of the Journey",
    description:
      "Position your services where artists, venues, and fans already collaborate so you become the obvious next step.",
  },
  {
    title: "Bookable Service Packages",
    description:
      "Publish offerings—from mixing to tour support—with pricing, availability, and booking workflows handled for you.",
  },
  {
    title: "Collaborate with Profiles",
    description:
      "Link to artist, venue, and pro teams, assign admin access, and keep communication centralised in one place.",
  },
  {
    title: "Promote Trusted Expertise",
    description:
      "Gather reviews, highlight specialisations, and rank for relevant searches across the directory.",
  },
];

const CTAS = [
  { label: "Join the Directory", href: "/signup", variant: "primary" as const },
  { label: "See Music Pros", href: "/music-industry-professionals", variant: "secondary" as const },
];

export default function MusicServiceDirectoryPage() {
  return (
    <MarketingPage
      eyebrow="Music Services"
      title="Music Service Directory"
      description="From production to promotion, connect your business with the artists and venues that need you most."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
