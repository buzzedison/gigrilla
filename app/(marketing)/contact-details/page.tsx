import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "General Enquiries",
    description:
      "Reach the Gigrilla team for platform questions, partnership ideas, and anything else you need clarified.",
  },
  {
    title: "Suggestions & Feedback",
    description:
      "Share product requests or improvements so we can keep building the tools the music industry needs.",
  },
  {
    title: "Report Issues",
    description:
      "Flag copyright concerns, bugs, or errors—our support workflow ensures the right specialists follow up.",
  },
  {
    title: "Member Support",
    description:
      "Signed-in members can raise tickets directly from the Control Panel for profile, billing, or booking help.",
  },
];

const CTAS = [
  { label: "Email Support", href: "mailto:support@gigrilla.app", variant: "primary" as const },
  { label: "Report an Issue", href: "#report-issue-form", variant: "secondary" as const },
];

export default function ContactDetailsPage() {
  return (
    <MarketingPage
      eyebrow="Contact"
      title="Contact Gigrilla"
      description="We’re here to help the music industry thrive. Tell us how we can support you and we’ll get in touch."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
