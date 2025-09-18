"use client";

import { useState, useEffect } from "react";
import { ProfileUpgrade } from "../components/ProfileUpgrade";
import { FullFanUpgrade } from "../components/FullFanUpgrade";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

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
        
        // For now, skip database queries that are timing out
        // Default to guest and let the user upgrade if needed
        console.log('UpgradePage: Skipping database queries due to timeout issues, defaulting to guest');
        
        const accountType = 'guest'; // Safe default

        // Check URL params for specific upgrade type
        const type = searchParams.get('type');
        const role = searchParams.get('role');
        
        console.log('UpgradePage: URL params - type:', type, 'role:', role);
        
        let finalUpgradeType: 'full-fan' | 'industry';
        
        if (type === 'full-fan') {
          finalUpgradeType = 'full-fan';
        } else if (type === 'industry') {
          finalUpgradeType = 'industry';
        } else {
          // Default to full-fan upgrade for new/guest users
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
    return <FullFanUpgrade onClose={() => router.push('/dashboard')} />;
  }

  const role = searchParams.get('role');
  
  return (
    <ProfileUpgrade 
      preSelectedRole={role}
      onClose={() => router.push('/dashboard')}
    />
  );
}
