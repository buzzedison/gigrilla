"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "../components/LoginPage";

export default function Login() {
  const router = useRouter();

  const handleNavigate = (page: "login" | "signup" | "genres" | "dashboard") => {
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
      case "dashboard":
        router.push("/dashboard");
        break;
    }
  };

  return <LoginPage onNavigate={handleNavigate} />;
}

