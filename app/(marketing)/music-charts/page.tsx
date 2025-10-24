import { MarketingPage } from "../../components/MarketingPage";

const HIGHLIGHTS = [
  {
    title: "Combined Music Chart",
    description:
      "Track performance across streams, downloads, and fan engagement to see the bigger picture of what’s resonating globally.",
  },
  {
    title: "Charts by Genre",
    description:
      "Drill into Genre Family, Main Genre, and Sub-Genre leaderboards tailored to how music is organised across the platform.",
  },
  {
    title: "Official Charts Worldwide",
    description:
      "Blend Gigrilla activity with recognised industry charts to recognise success at every career stage.",
  },
  {
    title: "Fan-Facing Discovery",
    description:
      "Surface new favourites through mood, location, and recommendation signals informed by your fan preferences.",
  },
];

const CTAS = [
  { label: "Explore Music", href: "/music-streaming-and-downloads", variant: "primary" as const },
  { label: "Sign-up", href: "/signup", variant: "secondary" as const },
];

export default function MusicChartsPage() {
  return (
    <MarketingPage
      eyebrow="Charts"
      title="Music Charts Built for Fair Trade"
      description="Keep tabs on what’s rising, who’s breaking through, and how different genres perform with transparent metrics across Gigrilla."
      highlights={HIGHLIGHTS}
      ctas={CTAS}
    />
  );
}
