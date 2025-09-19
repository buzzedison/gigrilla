"use client";

import { useState, useEffect } from "react";
import { ProfileUpgrade } from "../components/ProfileUpgrade";
import { FullFanUpgrade } from "../components/FullFanUpgrade";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { createClient } from "../../lib/supabase/client";

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [upgradeType, setUpgradeType] = useState<'full-fan' | 'industry' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      console.log('UpgradePage: checkUserStatus called, user:', user?.id, 'authLoading:', authLoading);

      // Wait for auth to resolve before making any decisions
      if (authLoading) {
        console.log('UpgradePage: Auth is still loading, deferring check');
        return;
      }
      
      // If URL specifies the upgrade type, note it but still allow profile checks below
      const urlType = searchParams.get('type');
      const urlRole = searchParams.get('role');
      if (urlType === 'full-fan' || urlType === 'industry') {
        console.log('UpgradePage: URL specifies type:', urlType, 'role:', urlRole);
        setUpgradeType(urlType);
      }

      if (!user) {
        console.log('UpgradePage: No user after auth resolved, redirecting to login');
        setLoading(false);
        router.push('/login');
        return;
      }

      try {
        console.log('UpgradePage: Checking user status for:', user.id);
        
        // Create Supabase client
        const supabase = createClient();
        
        // Use RPC function to get user status with timeout
        console.log('UpgradePage: About to call get_user_account_status RPC...');
        
        const rpcPromise = supabase.rpc('get_user_account_type');
        const timeoutPromise = new Promise(resolve => 
          setTimeout(() => resolve({ data: null, error: new Error('RPC timeout') }), 3000)
        );
        
        try {
          const result = await Promise.race([rpcPromise, timeoutPromise]) as { data: { account_type?: string } | null; error: Error | null };
          const { data: userStatus, error: statusError } = result;
          
          if (statusError) {
            if (statusError.message !== 'RPC timeout') {
              console.error('UpgradePage: Error getting user status:', statusError);
            }
            console.log('UpgradePage: Defaulting to guest due to error');
          } else {
            console.log('UpgradePage: User status from RPC:', userStatus);
            console.log('UpgradePage: Account type:', userStatus?.account_type || 'guest');
          }
        } catch (timeoutError) {
          console.error('UpgradePage: RPC timed out:', timeoutError);
          console.log('UpgradePage: Falling back to direct table query...');
          
          // Fallback to direct table query
          console.log('UpgradePage: Executing direct query...');
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('account_type')
            .eq('user_id', user.id)
            .eq('profile_type', 'fan')
            .single();
            
          console.log('UpgradePage: Direct query completed:', { profile, error: profileError });
            
          if (profileError) {
            console.error('UpgradePage: Direct query error:', profileError);
            console.log('UpgradePage: Defaulting to guest due to direct query error');
          } else {
            console.log('UpgradePage: Direct query result - account_type:', profile?.account_type);
            console.log('UpgradePage: Final accountType from direct query:', profile?.account_type || 'guest');
          }
        }

        // Check URL params for specific upgrade type
        const type = searchParams.get('type');
        const role = searchParams.get('role');
        
        console.log('UpgradePage: URL params - type:', type, 'role:', role);
        
        let finalUpgradeType: 'full-fan' | 'industry';
        
        if (type === 'full-fan') {
          // Skip account type check for now - let the upgrade flow handle it
          console.log('UpgradePage: Processing full-fan upgrade request');
          finalUpgradeType = 'full-fan';
        } else if (type === 'industry') {
          finalUpgradeType = 'industry';
        } else {
          // Default to full-fan upgrade if no specific type is provided
          console.log('UpgradePage: No specific upgrade type provided, defaulting to full-fan');
          finalUpgradeType = 'full-fan';
        }

        console.log('UpgradePage: Final upgrade type:', finalUpgradeType);
        setUpgradeType(finalUpgradeType);
        
      } catch (error) {
        console.error('UpgradePage: Error in checkUserStatus:', error);
        setUpgradeType('full-fan');
      } finally {
        console.log('UpgradePage: Setting loading to false');
        setLoading(false);
        // Ensure upgradeType is set even if there was an error
        if (!upgradeType) {
          console.log('UpgradePage: No upgradeType set, defaulting to full-fan');
          setUpgradeType('full-fan');
        }
      }
    };

    checkUserStatus();
  }, [user, authLoading, router, searchParams]);

  console.log('UpgradePage: Render check - upgradeType:', upgradeType, 'loading:', loading, 'authLoading:', authLoading);

  if (!upgradeType && (loading || authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading upgrade options...</p>
        </div>
      </div>
    );
  }

  if (upgradeType === 'full-fan') {
    return <FullFanUpgrade onClose={() => router.push('/fan-dashboard')} />;
  }

  const role = searchParams.get('role');
  
  return (
    <ProfileUpgrade 
      preSelectedRole={role}
      onClose={() => router.push('/fan-dashboard')}
    />
  );
}
