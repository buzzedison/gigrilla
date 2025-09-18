"use client";

import { useRouter } from "next/navigation";
import { GenreSelectionPage } from "../components/GenreSelectionPage";

export default function Genres() {
  const router = useRouter();

  const handleNavigate = (page: "login" | "signup" | "genres") => {
    switch (page) {
      case "login":
        router.push("/login");
        break;
      case "signup":
        router.push("/signup");
        break;
      case "genres":
        // Already on genres page
        break;
    }
  };

  return <GenreSelectionPage onNavigate={handleNavigate} />;
}
