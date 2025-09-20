"use client";

import { useRouter } from "next/navigation";
import { SignUpPage } from "../components/SignUpPage";

export default function SignUp() {
  const router = useRouter();

  const handleNavigate = (page: "login" | "signup" | "genres" | "dashboard" | "fan-dashboard") => {
    switch (page) {
      case "login":
        router.push("/login");
        break;
      case "signup":
        // Already on signup page
        break;
      case "genres":
        router.push("/genres");
        break;
      case "dashboard":
      case "fan-dashboard":
        router.push("/fan-dashboard");
        break;
    }
  };

  return <SignUpPage onNavigate={handleNavigate} />;
}

