"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from './supabase/client'

type AccountType = 'guest' | 'full'

type FanSignupData = {
  firstName: string
  lastName: string
  userRole: string
  accountType?: AccountType
  artistType?: string
  username?: string
  dateOfBirth?: string
  address?: string
  phoneNumber?: string
  // paymentDetails moved to settings/Stripe Connect
}

type FanContactDetails = {
  phoneNumber?: string | null
  // paymentDetails handled separately via Stripe Connect
  [key: string]: unknown
}

type FanLocationDetails = {
  address?: string | null
  [key: string]: unknown
}

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: FanSignupData) => Promise<{ error: unknown; needsEmailVerification?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signOut: () => Promise<void>
  updateProfile: (profileData: Record<string, unknown>) => Promise<{ error: unknown }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to convert artist type strings to IDs
const getArtistTypeId = (artistType: string): number => {
  const artistTypeMap: { [key: string]: number } = {
    'live-gig-original-recording': 1,  // Live Gig & Original Recording Artist
    'original-recording': 2,           // Original Recording Artist
    'live-gig': 3,                     // Live Gig Artist (Cover/Tribute/Classical)
    'vocalist-hire': 4,                // Vocalist for Hire
    'instrumentalist-hire': 5,         // Instrumentalist for Hire
    'songwriter-hire': 6,              // Songwriter for Hire
    'lyricist-hire': 7,                // Lyricist for Hire
    'composer-hire': 8,                // Composer for Hire
    // Specific instrument categories
    'string-instrumentalist': 5,       // Map to general instrumentalist
    'wind-instrumentalist': 5,         // Map to general instrumentalist
    'percussion-instrumentalist': 5,   // Map to general instrumentalist
    'keyboard-instrumentalist': 5,     // Map to general instrumentalist
    'electronic-instrumentalist': 5,   // Map to general instrumentalist
  }

  return artistTypeMap[artistType] || 1 // Default to first type if not found
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Provision user rows in DB (runs only when authenticated JWT is present)
  const provisionUser = async (currentUser: User, userData?: FanSignupData) => {
    const supabase = createClient()

    const firstName: string | null = (currentUser.user_metadata?.first_name as string) ?? userData?.firstName ?? null
    const lastName: string | null = (currentUser.user_metadata?.last_name as string) ?? userData?.lastName ?? null
    const userRole = userData?.userRole || 'fan' // Default to fan
    const accountType: AccountType = (userData?.accountType as AccountType) ?? (currentUser.user_metadata?.account_type as AccountType) ?? 'guest'

    const fanDetails = {
      username: userData?.username ?? (currentUser.user_metadata?.username as string | undefined),
      dateOfBirth: userData?.dateOfBirth ?? (currentUser.user_metadata?.date_of_birth as string | undefined),
      address: userData?.address ?? (currentUser.user_metadata?.address as string | undefined),
      phoneNumber: userData?.phoneNumber ?? (currentUser.user_metadata?.phone_number as string | undefined),
      // paymentDetails: handled separately via Stripe Connect
    }

    const userUpsert: Record<string, unknown> = {
      id: currentUser.id,
      email: currentUser.email ?? '',
      first_name: firstName,
      last_name: lastName,
      user_role: userRole,
    }

    if (fanDetails.username) {
      userUpsert.username = fanDetails.username
      userUpsert.display_name = fanDetails.username
    } else if (firstName || lastName) {
      userUpsert.display_name = [firstName, lastName].filter(Boolean).join(' ') || null
    }

    if (fanDetails.address) {
      userUpsert.location = fanDetails.address
    }

    // Upsert into users (conflict on id)
    const { error: usersError } = await supabase
      .from('users')
      .upsert(userUpsert, { onConflict: 'id' })

    if (usersError) {
      console.error('Error provisioning users row:', usersError)
      return { error: usersError }
    }

    // Create basic fan profile for all fan users (guest or full)
    // This ensures all fans have a profile record for future upgrades
    const fanProfileUpsert: {
      user_id: string
      profile_type: 'fan'
      contact_details?: FanContactDetails | null
      location_details?: FanLocationDetails | null
    } = {
      user_id: currentUser.id,
      profile_type: 'fan',
      contact_details:
        accountType === 'full'
          ? {
              phoneNumber: fanDetails.phoneNumber,
              // paymentDetails handled separately via Stripe Connect
            }
          : null,
      location_details:
        accountType === 'full' && fanDetails.address
          ? { address: fanDetails.address }
          : null,
    }

    const { error: fanProfileError } = await supabase
      .from('user_profiles')
      .upsert(fanProfileUpsert, { onConflict: 'user_id,profile_type' })

    if (fanProfileError) {
      console.error('Error provisioning fan profile row:', fanProfileError)
    }

    // Only create user_profiles for non-fan roles
    if (userRole !== 'fan') {
      const roleProfileUpsert: {
        user_id: string
        profile_type: string
        artist_type_id?: number
      } = {
        user_id: currentUser.id,
        profile_type: userRole,
        artist_type_id:
          userRole === 'artist' && userData?.artistType
            ? getArtistTypeId(userData.artistType)
            : undefined,
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(roleProfileUpsert, { onConflict: 'user_id,profile_type' })

      if (profileError) {
        console.error('Error provisioning user profile row:', profileError)
        return { error: profileError }
      }
    }

    return { error: null }
  }

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("AuthContext: Getting initial session...")
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("AuthContext: Session error:", error)
          setSession(null)
          setUser(null)
        } else if (session) {
          console.log("AuthContext: Session found:", {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            userMetadata: session?.user?.user_metadata
          })
          setSession(session)
          setUser(session?.user ?? null)
        } else {
          console.log("AuthContext: No session found")
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error("AuthContext: Exception getting session:", error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log("Auth state change:", event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userMetadata: session?.user?.user_metadata
      });
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // When the user signs in (including right after signUp with auto-confirm), provision rows
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("Auth state: SIGNED_IN event, provisioning user...");
        await provisionUser(session.user)
        console.log("Auth state: Provisioning complete, user state should be updated");
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: FanSignupData) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            account_type: userData.accountType ?? 'guest',
            user_role: userData.userRole ?? 'fan',
            username: userData.username ?? null,
            date_of_birth: userData.dateOfBirth ?? null,
            address: userData.address ?? null,
            phone_number: userData.phoneNumber ?? null,
            // payment_details: handled separately via Stripe Connect
            full_fan_profile: (userData.accountType ?? 'guest') === 'full',
          }
        }
      })

      if (error) return { error }

      // If a session exists immediately (auto-confirm), provision now
      if (data.session && data.user) {
        const { error: provisionError } = await provisionUser(data.user, userData)
        if (provisionError) return { error: provisionError }
        return { error: null }
      }

      // No session yet: email confirmation likely required. Defer provisioning until first login
      return { error: null, needsEmailVerification: true }
    } catch (error: unknown) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Auth context: Starting sign in for", email);
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Auth context: Sign in response", { data: !!data, error, hasUser: !!data?.user });

      if (!error && data?.user) {
        console.log("Auth context: Provisioning user...");
        // Ensure DB rows exist after authentication
        await provisionUser(data.user)
        console.log("Auth context: User provisioned");
      }

      return { error }
    } catch (error: unknown) {
      console.error("Auth context: Sign in error", error);
      return { error }
    }
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  const updateProfile = async (profileData: Record<string, unknown>) => {
    try {
      console.log('Auth context: updateProfile called with:', profileData);

      if (!user) {
        console.error('Auth context: No user logged in');
        return { error: 'No user logged in' };
      }

      const supabase = createClient();

      const normalizeJson = <T extends Record<string, unknown>>(input: unknown): T | null => {
        if (!input || typeof input !== 'object') return null;
        const entries = Object.entries(input).reduce<Record<string, unknown>>((acc, [key, value]) => {
          if (value === undefined) return acc;
          if (value === '') {
            acc[key] = null;
            return acc;
          }
          acc[key] = value;
          return acc;
        }, {});

        const filtered = Object.entries(entries).filter(([, value]) => value !== undefined);
        if (filtered.length === 0) {
          return null;
        }

        return Object.fromEntries(filtered) as T;
      };

      const contactDetailsInput = profileData.contact_details ?? {
        phoneNumber: profileData.phoneNumber,
        // paymentDetails handled separately via Stripe Connect
      };
      const locationDetailsInput = profileData.location_details ?? {
        address: profileData.address,
      };

      const contactDetails = normalizeJson<FanContactDetails>(contactDetailsInput);
      
      // Remove any paymentDetails that might still be in the data
      if (contactDetails && 'paymentDetails' in contactDetails) {
        delete contactDetails.paymentDetails;
        console.log('Auth context: Removed paymentDetails from contactDetails');
      }
      const locationDetails = normalizeJson<FanLocationDetails>(locationDetailsInput);

      const dateOfBirthRaw =
        profileData.date_of_birth ?? profileData.dateOfBirth ?? profileData?.dateOfBirth ?? null;
      const dateOfBirth =
        typeof dateOfBirthRaw === 'string' && dateOfBirthRaw ? new Date(dateOfBirthRaw).toISOString().slice(0, 10) : null;

      const accountType = (profileData.account_type as string | undefined) ?? 'guest';
      const username = profileData.username ?? null;
      const displayName = profileData.display_name ?? username ?? null;
      const addressFromProfile =
        (locationDetails?.address as string | undefined) ?? (profileData.address as string | undefined) ?? null;

      console.log('Auth context: Using direct database update instead of RPC to avoid timeout');
      console.log('Auth context: Update data:', {
        user_id: user.id,
        contact_details: contactDetails,
        location_details: locationDetails,
        date_of_birth: dateOfBirth,
        account_type: accountType,
      });
      
      // Use RPC function to handle profile update with proper RLS context
      try {
        console.log('Auth context: About to execute profile update via RPC...');
        
        // Build profile data for RPC function
        const profileData: Record<string, unknown> = {};
        
        // Add all the fields that need to be updated
        if (contactDetails) profileData.contact_details = contactDetails;
        if (locationDetails) profileData.location_details = locationDetails;
        if (accountType) profileData.account_type = accountType;
        if (dateOfBirth) profileData.date_of_birth = dateOfBirth;
        if (username) profileData.username = username;
        if (displayName) profileData.display_name = displayName;
        
        console.log('Auth context: Profile data for RPC:', profileData);
        
        // Call the RPC function
        console.log('Auth context: Calling update_fan_profile RPC...');
        const { data, error: profileRpcError } = await supabase
          .rpc('update_fan_profile', { profile_data: profileData });
        
        console.log('Auth context: RPC result:', { data, error: profileRpcError });
        
        if (profileRpcError) {
          console.error('Auth context: RPC update error:', profileRpcError);
          return { error: profileRpcError };
        }
      } catch (error) {
        console.error('Auth context: Exception during database update:', error);
        return { error: error as Error };
      }

      console.log('Auth context: Direct database update complete');

      const userUpdate: Record<string, unknown> = {};
      if (username) {
        userUpdate.username = username;
      }
      if (displayName) {
        userUpdate.display_name = displayName;
      }
      if (addressFromProfile) {
        userUpdate.location = addressFromProfile;
      }

      if (Object.keys(userUpdate).length > 0) {
        console.log('Auth context: Updating users table with:', userUpdate);
        const { error: userUpdateError } = await supabase
          .from('users')
          .update(userUpdate)
          .eq('id', user.id);

        if (userUpdateError) {
          console.error('Auth context: Error updating users table:', userUpdateError);
          return { error: userUpdateError };
        }
      }

      const metadataUpdate: Record<string, unknown> = {
        account_type: accountType,
        full_fan_profile: accountType === 'full',
      };

      if (displayName) {
        metadataUpdate.display_name = displayName;
      }
      if (username) {
        metadataUpdate.username = username;
      }
      if (dateOfBirth) {
        metadataUpdate.date_of_birth = dateOfBirth;
      }
      if (addressFromProfile) {
        metadataUpdate.address = addressFromProfile;
      }
      if (contactDetails?.phoneNumber) {
        metadataUpdate.phone_number = contactDetails.phoneNumber;
      }
      // paymentDetails handled separately via Stripe Connect

      console.log('Auth context: Updating local auth state with metadata:', metadataUpdate);

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            ...metadataUpdate,
          },
        } as User;
      });

      setSession((prev) => {
        if (!prev || !prev.user) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            user_metadata: {
              ...prev.user.user_metadata,
              ...metadataUpdate,
            },
          },
        } as Session;
      });

      console.log('Auth context: Profile updated successfully via RPC');
      return { error: null };
    } catch (error: unknown) {
      console.error('Auth context: Caught exception in updateProfile:', error);
      return { error };
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
