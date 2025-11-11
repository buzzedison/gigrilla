"use client"

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../../lib/auth-context";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { createClient } from "../../lib/supabase/client";

interface GenreSelectionPageProps {
  onNavigate: (page: "login" | "signup" | "genres") => void;
}

type Genre = { id: string; name: string };
type DbGenre = { id: string | number; name: string; description?: string; parent_id?: string | number };
type DbGenreNormalized = { id: string; name: string; description?: string; parent_id?: string };

const defaultFamilies = [
  "Blues", "Classical", "Country", "Electronic", "Folk", "Gospel",
  "Hip Hop", "Jazz", "Latin", "Metal", "Pop", "Punk",
  "R&B", "Reggae", "Rock", "World Music",
];

const defaultMains = [
  "Alternative Rock", "Classic Rock", "Indie Rock", "Pop Rock", "Synth Pop",
  "Rap", "Trap", "House", "Techno", "Heavy Metal", "Thrash Metal"
];

const defaultSubs = [
  "Progressive Metal", "Death Metal", "Black Metal", "Power Metal"
];

export function GenreSelectionPage({ onNavigate }: GenreSelectionPageProps) {
  const { user, session } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"family" | "main" | "sub">("main");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Selection state for filtering
  const [selectedFamily, setSelectedFamily] = useState<Genre | null>(null);
  const [selectedMain, setSelectedMain] = useState<Genre | null>(null);

  const [allGenres, setAllGenres] = useState<DbGenreNormalized[]>([]);
  const [families, setFamilies] = useState<Genre[]>([]);
  const [mains, setMains] = useState<Genre[]>([]);
  const [subs, setSubs] = useState<Genre[]>([]);

  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [provisioningUser, setProvisioningUser] = useState(false);
  const [genresError, setGenresError] = useState("");
  
  // User role state
  const [userRole, setUserRole] = useState<string | null>(null);

  // Debug environment variables
  useEffect(() => {
    console.log("DEBUG: Environment variables:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  }, []);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        return;
      }

      try {
        const token = session?.access_token;
        const response = await fetch(`https://gpfjkgdwymwdmmrezecc.supabase.co/rest/v1/users?select=user_role&id=eq.${user.id}`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZmprZ2R3eW13ZG1tcmV6ZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjg0NTMsImV4cCI6MjA3MDg0NDQ1M30.UkLIsnIy4d77Ypf9PnladhjpDbYJnriRfUZm5epUg2Q',
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setUserRole(data[0].user_role);
            console.log("User role fetched:", data[0].user_role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
      }
    };

    fetchUserRole();
  }, [user, session?.access_token]);

  // Removed unused testDatabaseAccess helper to satisfy ESLint and keep code lean

  // Fetch all genres hierarchically from new API
  useEffect(() => {
    const fetchAllGenres = async () => {
      if (!user) {
        console.log("No user, skipping genre fetch");
        return;
      }

      setLoadingFamilies(true);
      setGenresError("");

      // Force fallback after 10 seconds regardless
      const forceFallbackTimeout = setTimeout(() => {
        console.log("FORCED FALLBACK: Loading taking too long, using defaults");
        setFamilies(defaultFamilies.map((n, i) => ({ id: String(i + 1), name: n })));
        setMains(defaultMains.map((n, i) => ({ id: String(i + 100), name: n })));
        setSubs(defaultSubs.map((n, i) => ({ id: String(i + 200), name: n })));
        setGenresError("Loading timeout - using default genres");
        setLoadingFamilies(false);
      }, 10000);

      try {
        console.log("Fetching hierarchical genres from API...");
        
        const response = await fetch('/api/genres', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.details || result.error);
        }

        const { data } = result;
        
        if (!data || !data.families || data.families.length === 0) {
          console.log("No genres found in database, using defaults");
          setFamilies(defaultFamilies.map((n, i) => ({ id: String(i + 1), name: n })));
          setMains(defaultMains.map((n, i) => ({ id: String(i + 100), name: n })));
          setSubs(defaultSubs.map((n, i) => ({ id: String(i + 200), name: n })));
          setGenresError("Using default genres (database appears empty)");
        } else {
          console.log("SUCCESS: Processing hierarchical genres from API");
          
          // Extract families
          const familiesData: Genre[] = data.families.map((f: { id: string; name: string }) => ({
            id: f.id,
            name: f.name
          }));
          
          // Extract all main genres (types)
          const allMainsData: Genre[] = [];
          data.families.forEach((family: { mainGenres: Array<{ id: string; name: string }> }) => {
            family.mainGenres.forEach((main: { id: string; name: string }) => {
              if (!allMainsData.find(m => m.id === main.id)) {
                allMainsData.push({ id: main.id, name: main.name });
              }
            });
          });
          
          // Extract all sub-genres (subtypes)
          const allSubsData: Genre[] = [];
          data.families.forEach((family: { mainGenres: Array<{ subGenres: Array<{ id: string; name: string }> }> }) => {
            family.mainGenres.forEach((main: { subGenres: Array<{ id: string; name: string }> }) => {
              main.subGenres.forEach((sub: { id: string; name: string }) => {
                if (!allSubsData.find(s => s.id === sub.id)) {
                  allSubsData.push({ id: sub.id, name: sub.name });
                }
              });
            });
          });

          // Build normalized structure for filtering
          const normalized: DbGenreNormalized[] = [];
          data.families.forEach((family: { id: string; name: string; mainGenres: Array<{ id: string; name: string; subGenres: Array<{ id: string; name: string }> }> }) => {
            normalized.push({ id: family.id, name: family.name, parent_id: undefined });
            family.mainGenres.forEach((main: { id: string; name: string; subGenres: Array<{ id: string; name: string }> }) => {
              normalized.push({ id: main.id, name: main.name, parent_id: family.id });
              main.subGenres.forEach((sub: { id: string; name: string }) => {
                normalized.push({ id: sub.id, name: sub.name, parent_id: main.id });
              });
            });
          });

          console.log("ORGANIZED GENRES:", {
            familiesCount: familiesData.length,
            mainsCount: allMainsData.length,
            subsCount: allSubsData.length,
            sampleFamilies: familiesData.slice(0, 3),
            sampleMains: allMainsData.slice(0, 3),
            sampleSubs: allSubsData.slice(0, 3)
          });

          setAllGenres(normalized);
          setFamilies(familiesData);
          setMains(allMainsData);
          setSubs(allSubsData);
          setGenresError(""); // Clear any previous errors
        }
      } catch (fetchError) {
        console.error("Failed to fetch genres:", fetchError);
        setFamilies(defaultFamilies.map((n, i) => ({ id: String(i + 1), name: n })));
        setMains(defaultMains.map((n, i) => ({ id: String(i + 100), name: n })));
        setSubs(defaultSubs.map((n, i) => ({ id: String(i + 200), name: n })));
        setGenresError(`Failed to fetch genres: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      } finally {
        clearTimeout(forceFallbackTimeout);
        console.log("Setting loadingFamilies to false");
        setLoadingFamilies(false);
      }
    };

    fetchAllGenres();
  }, [user]); // Only run when user changes

  // User provisioning is now handled by auth context, so this is disabled
  // to prevent hanging Supabase client calls
  useEffect(() => {
    console.log("User provisioning handled by auth context, skipping local provisioning");
    setProvisioningUser(false); // Ensure this doesn't stay in loading state
  }, [user]);

  // Filter mains based on selected family
  useEffect(() => {
    if (!allGenres.length) return;

    if (selectedFamily) {
      const filteredMains = allGenres.filter(genre =>
        genre.parent_id === selectedFamily.id
      );
      setMains(filteredMains.length > 0 ? filteredMains : defaultMains.map((n, i) => ({ id: String(i + 100), name: n })));
    } else {
      const allMains = allGenres.filter((genre) => {
        if (!genre.parent_id) return false
        const parent = allGenres.find((g) => g.id === genre.parent_id)
        return !parent?.parent_id
      })
      setMains(allMains.length > 0 ? allMains : defaultMains.map((n, i) => ({ id: String(i + 100), name: n })));
    }
  }, [selectedFamily, allGenres]);

  // Filter subs based on selected main
  useEffect(() => {
    if (!allGenres.length) return;

    if (selectedMain) {
      const filteredSubs = allGenres.filter(genre =>
        genre.parent_id === selectedMain.id
      );
      setSubs(filteredSubs.length > 0 ? filteredSubs : defaultSubs.map((n, i) => ({ id: String(i + 200), name: n })));
    } else {
      const allSubs = allGenres.filter(genre => {
        if (!genre.parent_id) return false;
        const parent = allGenres.find(g => g.id === genre.parent_id);
        return parent && parent.parent_id;
      });
      setSubs(allSubs.length > 0 ? allSubs : defaultSubs.map((n, i) => ({ id: String(i + 200), name: n })));
    }
  }, [selectedMain, allGenres]);

  const toggleGenre = (genre: Genre) => {
    const genreName = genre.name;
    const genreId = genre.id;
    
    setSelectedGenres(prev =>
      prev.includes(genreName)
        ? prev.filter(g => g !== genreName)
        : [...prev, genreName]
    );
    
    setSelectedGenreIds(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) {
      console.error("No user logged in - cannot save profile");
      return;
    }

    setLoading(true);
    
    try {
      // Extract genre IDs from selected genres
      // Map selected genre names to their IDs from allGenres
      const genreIdsToSave = selectedGenres
        .map(genreName => {
          const genre = allGenres.find(g => g.name === genreName);
          return genre?.id;
        })
        .filter((id): id is string => !!id);

      // Also include any directly selected genre IDs
      const allGenreIds = [...new Set([...selectedGenreIds, ...genreIdsToSave])];

      // Determine which are families, main genres, and sub-genres
      const genreFamilies: string[] = [];
      const mainGenres: string[] = [];
      const subGenres: string[] = [];

      allGenreIds.forEach(genreId => {
        const genre = allGenres.find(g => g.id === genreId);
        if (genre) {
          if (!genre.parent_id) {
            genreFamilies.push(genreId);
          } else {
            const parent = allGenres.find(g => g.id === genre.parent_id);
            if (parent && !parent.parent_id) {
              mainGenres.push(genreId);
            } else {
              subGenres.push(genreId);
            }
          }
        }
      });

      const response = await fetch('/api/user-genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          genres: selectedGenres, // Keep for backward compatibility
          genreIds: allGenreIds,
          genreFamilies,
          mainGenres,
          subGenres
        })
      });

      const result = await response.json();

      if (result.error) {
        console.error("Error saving profile:", result.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setLoading(false);
    }
  };

  const handleFinishProfile = async () => {
    await handleSaveProfile();
  };

  // If no user yet, show prompt instead of spinning forever
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl">Please log in to continue</h1>
          <Button className="bg-primary" onClick={() => onNavigate("login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
            alt="Gigrilla Logo"
            width={200}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-primary text-4xl">
            {userRole === 'fan' ? 'Discover Music You Love' : 'Pick your favorite genres'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'fan' 
              ? 'Select genres to personalize your experience (optional)'
              : 'Select your favourite genres to get started'
            }
          </p>
          {userRole === 'fan' && (
            <p className="text-sm text-primary">
              ✨ As a Fan, you can skip this step and explore everything!
            </p>
          )}
          {provisioningUser && (
            <p className="text-sm text-purple-600">Setting up your profile...</p>
          )}
        </div>

        {/* Current Selection Display */}
        {(selectedFamily || selectedMain) && (
          <div className="text-sm text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
            {selectedFamily && (
              <span className="mr-2">
                Family: <span className="text-purple-700 font-medium">{selectedFamily.name}</span>
              </span>
            )}
            {selectedMain && (
              <span>
                Main: <span className="text-purple-700 font-medium">{selectedMain.name}</span>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedFamily(null);
                setSelectedMain(null);
              }}
              className="ml-4 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "family"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("family")}
            >
              Genre Family
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "main"
                  ? "bg-purple-900 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("main")}
            >
              Main Genre
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "sub"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("sub")}
            >
              Sub Genre
            </button>
          </div>
        </div>

        {/* Error */}
        {genresError && (
          <div className="text-center text-sm text-red-600">{genresError}</div>
        )}

        {/* Genre Grid */}
        {loadingFamilies ? (
          <div className="text-center text-sm text-gray-500">Loading genres…</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {(activeTab === "family" ? families :
              activeTab === "main" ? mains :
              activeTab === "sub" ? subs : families
            ).map((genre) => (
              <button
                key={genre.id}
                onClick={() => {
                  if (activeTab === "family") {
                    setSelectedFamily(genre);
                    setSelectedMain(null);
                  } else if (activeTab === "main") {
                    setSelectedMain(genre);
                  } else {
                    toggleGenre(genre);
                  }
                }}
                className={`p-3 rounded-lg text-sm transition-colors ${
                  (activeTab === "family" && selectedFamily?.id === genre.id) ||
                  (activeTab === "main" && selectedMain?.id === genre.id) ||
                  (activeTab === "sub" && selectedGenres.includes(genre.name))
                    ? "bg-purple-200 text-purple-900 border border-purple-300"
                    : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        {/* Helper Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Select all sub genres in this <span className="text-purple-600">main genre</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            className="px-8 py-3 border-primary text-primary hover:bg-primary/10"
            onClick={handleFinishProfile}
            disabled={loading || !user}
          >
            {loading ? "Saving..." : userRole === 'fan' 
              ? (selectedGenres.length > 0 ? "SAVE PREFERENCES" : "SKIP FOR NOW")
              : (selectedGenres.length > 0 ? "FINISH SETUP" : "SKIP FOR NOW")
            }
          </Button>
          <Button
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSaveProfile}
            disabled={loading || (userRole !== 'fan' && selectedGenres.length === 0) || !user}
          >
            {loading ? "Saving..." : userRole === 'fan' ? "EXPLORE GIGRILLA" : "COMPLETE PROFILE"}
          </Button>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <button className="hover:text-gray-700">Privacy & Terms</button>
          <button className="hover:text-gray-700">Legal</button>
          <button className="hover:text-gray-700">Contact Us</button>
        </div>
      </div>
    </div>
  );
}
