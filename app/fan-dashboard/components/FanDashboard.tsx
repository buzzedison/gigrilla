"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FanSidebar } from "./FanSidebar";
import { FanHeader } from "./FanHeader";
import { FanProfileForm } from "./FanProfileForm";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { FanMusicContent } from "./FanMusicContent";
import { FanInbox } from "./FanInbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";

interface FanDashboardProps {
  showMusicContent?: boolean;
}

type FanDashboardSection = "dashboard" | "music" | "messages";

export function FanDashboard({ showMusicContent = false }: FanDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<FanDashboardSection>(
    showMusicContent ? "music" : "dashboard"
  );
  const [unreadMessages, setUnreadMessages] = useState(0);
  const deepLinkedFolder = searchParams?.get("folder") || null;

  const replaceDashboardQuery = useCallback((section: FanDashboardSection, folderId?: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (section === "dashboard") {
      params.delete("section");
      params.delete("folder");
    } else {
      params.set("section", section);
      if (section === "messages") {
        if (folderId && folderId !== "all") {
          params.set("folder", folderId);
        } else {
          params.delete("folder");
        }
      } else {
        params.delete("folder");
      }
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const requestedSection = searchParams?.get("section");
    if (requestedSection === "messages") {
      setActiveSection("messages");
      return;
    }
    if (requestedSection === "music" && showMusicContent) {
      setActiveSection("music");
      return;
    }
    if (requestedSection === "dashboard" || !requestedSection) {
      setActiveSection(showMusicContent ? "music" : "dashboard");
    }
  }, [searchParams, showMusicContent]);

  useEffect(() => {
    if (!showMusicContent && activeSection === "music") {
      setActiveSection("dashboard");
    }
  }, [showMusicContent, activeSection]);

  const loadUnreadSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/inbox?audience=fan&summary=true", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) return;
      const unread = typeof payload?.data?.unreadTotal === "number"
        ? payload.data.unreadTotal
        : 0;
      setUnreadMessages(unread);
    } catch {
      // keep previous count if fetch fails
    }
  }, []);

  useEffect(() => {
    void loadUnreadSummary();
    const interval = window.setInterval(() => {
      void loadUnreadSummary();
    }, 45000);
    return () => window.clearInterval(interval);
  }, [loadUnreadSummary]);

  const handleSectionChange = (section: FanDashboardSection) => {
    if (section === "music" && !showMusicContent) {
      setActiveSection("dashboard");
      replaceDashboardQuery("dashboard");
      return;
    }
    setActiveSection(section);
    replaceDashboardQuery(section, section === "messages" ? deepLinkedFolder : null);
  };

  const renderMainContent = () => {
    if (activeSection === "messages") {
      return (
        <div className="flex flex-1 flex-col gap-6 px-4 pb-16 pt-4 sm:px-6 lg:pb-8 lg:pl-8 lg:pr-10">
          <FanInbox
            initialFolderId={deepLinkedFolder}
            onFolderChange={(folderId) => replaceDashboardQuery("messages", folderId)}
            onUnreadCountChange={setUnreadMessages}
          />
        </div>
      );
    }

    if (activeSection === "music" && showMusicContent) {
      return <FanMusicContent />;
    }

    return (
      <div className="flex flex-1 flex-col gap-6 px-4 pb-16 pt-4 sm:px-6 lg:flex-row lg:gap-8 lg:overflow-hidden lg:pb-8 lg:pl-8 lg:pr-10">
        <div className="flex-1 min-w-0 lg:overflow-y-auto">
          <FanProfileForm />
        </div>

        <div className="w-full flex-none lg:w-[360px] lg:overflow-y-auto">
          <ProfileCompletionCard />
        </div>
      </div>
    );
  };

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent
        side="left"
        className="w-full max-w-[20rem] p-0 sm:max-w-sm"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Fan navigation</SheetTitle>
        </SheetHeader>
        <FanSidebar
          activeSection={activeSection}
          unreadMessages={unreadMessages}
          onSectionChange={(section) => {
            handleSectionChange(section);
          }}
          onNavigate={() => setMobileSidebarOpen(false)}
          className="h-full w-full"
        />
      </SheetContent>

      <div className="min-h-screen bg-[#4a2c5a] font-ui lg:flex lg:overflow-hidden">
        <div className="hidden lg:flex lg:w-72 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-white/10">
          <FanSidebar
            activeSection={activeSection}
            unreadMessages={unreadMessages}
            onSectionChange={handleSectionChange}
          />
        </div>

        <div className="flex-1 lg:flex lg:min-h-screen lg:flex-col">
          <FanHeader
            unreadMessages={unreadMessages}
            onOpenMessages={() => handleSectionChange("messages")}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
          />

          {renderMainContent()}
        </div>
      </div>
    </Sheet>
  );
}
