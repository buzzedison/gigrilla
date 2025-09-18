"use client";
import React from "react";
import { Button } from "./ui/button";
import { motion, Variants } from "framer-motion";
import { Play, Music, Users, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "./ui/utils";

export function Hero() {
  const [active, setActive] = useState<"fans" | "artists" | "venues" | "specialists">(
    "fans",
  );

  const content = {
    fans: {
      heading: ["Discover Music,", "Support Artists,", "Connect"],
      headingAccent: "with Community",
      description: "Start as a Fan and explore everything Gigrilla has to offer. Stream new tracks, follow your favorite artists, attend live shows, and upgrade to Artist/Venue profiles anytime. Your journey begins here.",
      stats: [
        { value: "100K+", label: "Music Fans" },
        { value: "1M+", label: "Streams" },
        { value: "10K+", label: "Live Shows" },
      ],
      cta: "Join Gigrilla",
    },
    artists: {
      heading: ["Upload Music,", "Book Gigs,", "Sell"],
      headingAccent: "Your Art",
      description: "Upload your tracks and albums, manage your catalog with DDEX metadata, book gigs at venues, sell merchandise, and connect directly with fans. Keep 100% of your earnings with zero platform fees.",
      stats: [
        { value: "50K+", label: "Artists" },
        { value: "100K+", label: "Songs" },
        { value: "0%", label: "Our Cut" },
      ],
      cta: "Start Uploading",
    },
    venues: {
      heading: ["Book Artists,", "Manage Events,", "Grow"],
      headingAccent: "Your Venue",
      description: "Find the perfect Artists for your venue, manage bookings seamlessly, sell tickets directly, and grow your event business. Connect with talented performers and build your audience.",
      stats: [
        { value: "25K+", label: "Venues" },
        { value: "500K+", label: "Events" },
        { value: "95%", label: "Success Rate" },
      ],
      cta: "Find Artists",
    },
    specialists: {
      heading: ["Offer Services,", "Build Reputation,", "Grow"],
      headingAccent: "Your Business",
      description: "Offer your expertise to Artists and Venues. Provide mixing, mastering, promotion, and professional services. Build your reputation and grow your business in the music industry.",
      stats: [
        { value: "15K+", label: "Specialists" },
        { value: "200K+", label: "Projects" },
        { value: "4.9★", label: "Avg Rating" },
      ],
      cta: "Offer Services",
    },
  };
  const [dots, setDots] = useState<
    { top: number; left: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    // Generate client-only dot positions and timings to avoid SSR hydration mismatch
    const generated = Array.from({ length: 8 }, () => ({
      top: Math.random() * 80 + 10,
      left: Math.random() * 80 + 10,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setDots(generated);
  }, []);
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity
    }
  };

  const floatingAnimationSlow = {
    y: [0, -15, 0],
    x: [0, 10, 0],
    transition: {
      duration: 6,
      repeat: Infinity
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative min-h-[90vh] overflow-hidden"
      style={{
        background:
          "radial-gradient(60rem 30rem at 80% -10%, rgba(200,146,199,0.35), transparent 70%), radial-gradient(50rem 25rem at 0% 110%, rgba(237, 0, 140, 0.25), transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #F8F1F8 100%)",
      }}
    >
      {/* Background gradient elements */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] right-[-10%] w-[32rem] h-[32rem] rounded-full blur-3xl"
             style={{ background: "radial-gradient(closest-side, var(--g-purple-4), transparent)" }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[28rem] h-[28rem] rounded-full blur-3xl"
             style={{ background: "radial-gradient(closest-side, var(--g-cerise), transparent)" }} />
      </div>

      <div className="relative container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left Content */}
          <motion.div 
            className="space-y-8 z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Category Pills */}
            <motion.div
              className="flex flex-wrap gap-3"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onMouseEnter={() => setActive("fans")}
                  onClick={() => setActive("fans")}
                  aria-pressed={active === "fans"}
                  className={cn(
                    "rounded-full px-6 py-2 transition-all duration-300",
                    active === "fans"
                      ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                      : "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
                  )}
                >
                  <Users className="w-4 h-4 mr-2" />
                  For Fans
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onMouseEnter={() => setActive("artists")}
                  onClick={() => setActive("artists")}
                  aria-pressed={active === "artists"}
                  className={cn(
                    "rounded-full px-6 py-2 transition-all duration-300",
                    active === "artists"
                      ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                      : "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
                  )}
                >
                  <Music className="w-4 h-4 mr-2" />
                  For Artists
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onMouseEnter={() => setActive("venues")}
                  onClick={() => setActive("venues")}
                  aria-pressed={active === "venues"}
                  className={cn(
                    "rounded-full px-6 py-2 transition-all duration-300",
                    active === "venues"
                      ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                      : "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
                  )}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  For Venues
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onMouseEnter={() => setActive("specialists")}
                  onClick={() => setActive("specialists")}
                  aria-pressed={active === "specialists"}
                  className={cn(
                    "rounded-full px-6 py-2 transition-all duration-300",
                    active === "specialists"
                      ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                      : "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
                  )}
                >
                  <Play className="w-4 h-4 mr-2" />
                  For Specialists
                </Button>
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              className="space-y-6"
              variants={itemVariants}
            >
              <motion.h1
                key={`heading-${active}`} // Re-animate heading on tab change
                className="text-5xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {content[active].heading.map((line, index) => (
                  <React.Fragment key={index}>
                    <motion.span
                      className="inline-block text-gray-900"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.7 + index * 0.2 }}
                    >
                      {line}
                    </motion.span>
                    <br />
                  </React.Fragment>
                ))}
                <motion.span
                  className="inline-block text-primary"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  {content[active].headingAccent.split(' ')[0]}
                </motion.span>
                <motion.span
                  className="inline-block text-gray-900 ml-4"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                >
                  {content[active].headingAccent.split(' ').slice(1).join(' ')}
                </motion.span>
              </motion.h1>
            </motion.div>

            {/* Description */}
            <motion.div
              className="max-w-xl"
              variants={itemVariants}
            >
              <motion.p
                key={`desc-${active}`} // Re-animate description on tab change
                className="text-gray-600 text-xl leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {content[active].description}
              </motion.p>
              <p className="mt-2 text-sm font-medium text-primary">
                {active === "fans" && "You’re viewing: For Fans"}
                {active === "artists" && "You’re viewing: For Artists"}
                {active === "venues" && "You’re viewing: For Venues"}
                {active === "specialists" && "You’re viewing: For Specialists"}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  key={`cta-${active}`} // Re-animate CTA on tab change
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <a href="/signup">
                    <Music className="w-5 h-5 mr-2" />
                    {content[active].cta}
                  </a>
                </Button>
                </motion.div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" className="border-2 border-[var(--g-purple-4)] text-[var(--g-purple-4)] hover:bg-white/10 px-8 py-4 rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-300">
                  <a href="#demo">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              key={`stats-${active}`} // Re-animate stats on tab change
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, staggerChildren: 0.1 }}
            >
              {content[active].stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Decorative Elements */}
          <div className="relative hidden lg:block h-[600px]">
            {/* Central Avatar with Pulse Effect */}
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
            >
              <motion.div 
                className="relative"
                animate={floatingAnimation}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-2xl">
                  <Music className="w-12 h-12 text-white" />
                </div>
                {/* Pulse rings */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-purple-400"
                  animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
            </motion.div>

            {/* Floating Music Elements */}
            <motion.div 
              className="absolute top-16 left-20 w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg"
              animate={floatingAnimation}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 }}
            >
              <Play className="w-8 h-8 text-white" />
            </motion.div>

            <motion.div 
              className="absolute top-32 right-16 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
              animate={floatingAnimationSlow}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2 }}
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>

            <motion.div 
              className="absolute bottom-20 left-16 w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg"
              animate={floatingAnimation}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.4 }}
            >
              <Calendar className="w-7 h-7 text-white" />
            </motion.div>

            <motion.div 
              className="absolute bottom-32 right-20 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
              animate={floatingAnimationSlow}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.6 }}
            >
              <Music className="w-5 h-5 text-white" />
            </motion.div>

            {/* Connecting Lines */}
            <motion.svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              <motion.path
                d="M 200 100 Q 300 200 400 300"
                stroke="url(#gradient1)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 3 }}
              />
              <motion.path
                d="M 100 400 Q 250 250 400 150"
                stroke="url(#gradient2)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 3.5 }}
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* Ambient Dots (client-generated to avoid hydration mismatch) */}
            {dots.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gray-300 rounded-full"
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: pos.duration, repeat: Infinity, delay: pos.delay }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}