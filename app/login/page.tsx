"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "../components/LoginPage";

export default function Login() {
  const router = useRouter();

  const handleNavigate = (page: "login" | "signup" | "genres" | "dashboard" | "fan-dashboard" | "artist-dashboard") => {
    switch (page) {
      case "login":
        // Already on login page
        break;
      case "signup":
        router.push("/signup");
        break;
      case "genres":
        router.push("/genres");
        break;
      case "artist-dashboard":
        router.push("/artist-dashboard");
        break;
      case "dashboard":
      case "fan-dashboard":
        router.push("/fan-dashboard");
        break;
    }
  };

  return <LoginPage onNavigate={handleNavigate} />;
}

