import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import PasswordProtection from './components/PasswordProtection';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gigrilla – Book, Perform, Connect",
  description:
    "The music platform for artists, venues, services, and fans. DDEX-compliant metadata, gigs, and commerce in one place.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Gigrilla – Book, Perform, Connect",
    description:
      "The music platform for artists, venues, services, and fans. DDEX-compliant metadata, gigs, and commerce in one place.",
    url: "https://gigrilla.app",
    siteName: "Gigrilla",
    type: "website",
  },
  metadataBase: new URL("https://gigrilla.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} antialiased`}
      >
        <AuthProvider>
          <PasswordProtection>
            {children}
          </PasswordProtection>
        </AuthProvider>
      </body>
    </html>
  );
}
