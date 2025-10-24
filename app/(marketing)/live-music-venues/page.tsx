import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "Discover & Invite Artists",
    description:
      "Browse performers by genre, location, and availability, then send offers or open applications for your calendar.",
  },
  {
    title: "One Supplier Simplicity",
    description:
      "Manage contracts, payments, and reporting through Gigrilla so your accounts team reconciles a single partner.",
  },
  {
    title: "Showcase Your Venue",
    description:
      "Upload photos, menus, capacity info, and rider details so fans and artists know exactly what to expect.",
  },
  {
    title: "Match Any Venue Model",
    description:
      "Public, private, dedicated live venues, festivals, and promoters each get specific tools and profile types.",
  },
];

const CTAS = [
  { label: "Register Your Venue", href: "/signup", variant: "primary" as const },
  { label: "Book Artists", href: "/find-and-arrange-music-gigs", variant: "secondary" as const },
];

export default function LiveMusicVenuesPage() {
  return (
    <MarketingPage
      eyebrow="Venues"
      title="Live Music Venues on Gigrilla"
      description="Promote gigs, streamline booking, and keep your venue top-of-mind for artists and fans worldwide."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
