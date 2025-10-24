import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "Professional Network",
    description:
      "Connect with artists, venues, and services to advise, mentor, and build sustainable careers in the music industry.",
  },
  {
    title: "Webinars & Events",
    description:
      "Host live or streamed sessions, sell tickets, and engage members through built-in booking and communication tools.",
  },
  {
    title: "Admin & Team Controls",
    description:
      "Invite colleagues, assign roles, and manage permissions as your professional services expand.",
  },
  {
    title: "Visibility Where It Counts",
    description:
      "Share experience, showcase specialisms, and be discoverable to the right collaborators at the right time.",
  },
];

const CTAS = [
  { label: "Apply to Join", href: "/signup", variant: "primary" as const },
  { label: "Contact Us", href: "/contact-details", variant: "secondary" as const },
];

export default function MusicIndustryProfessionalsPage() {
  return (
    <MarketingPage
      eyebrow="Music Pros"
      title="Music Industry Professionals"
      description="Grow your professional practice with dedicated tools for consultants, educators, and specialists supporting the music economy."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
