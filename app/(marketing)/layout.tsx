import type { ReactNode } from "react";

import { Header } from "../components/Header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <Header />
      <main>{children}</main>
    </div>
  );
}
