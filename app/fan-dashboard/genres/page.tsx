"use client";

import { useAuth } from "../../../lib/auth-context";
import { FanSidebar } from "../components/FanSidebar";
import { FanHeader } from "../components/FanHeader";
import { MusicGenreSelector } from "../components/MusicGenreSelector";
import { StripeConnectPayment } from "../../components/StripeConnectPayment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GenresPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // Only redirect if we're sure there's no user (not during loading)
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handlePaymentSuccess = async () => {
    console.log('GenresPage: Payment successful, upgrading user to full fan');
    
    try {
      // Call API to upgrade user to full fan
      const response = await fetch('/api/upgrade-to-full-fan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.error) {
        console.error('Error upgrading user:', result.error);
        alert('Payment successful but there was an error upgrading your account. Please contact support.');
      } else {
        console.log('User upgraded successfully');
      }
    } catch (error) {
      console.error('Error upgrading user:', error);
      alert('Payment successful but there was an error upgrading your account. Please contact support.');
    }

    // Navigate to dashboard
    router.push('/fan-dashboard');
  };

  const handlePaymentCancel = () => {
    console.log('GenresPage: Payment cancelled');
    setShowPayment(false);
  };

  // Show payment screen if payment flow is active
  if (showPayment) {
    return (
      <StripeConnectPayment
        amount={100} // £1 in pence
        currency="gbp"
        description="Upgrade to Full Fan Account"
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  // Show content immediately, even during loading
  // The middleware will handle auth protection at server level
  return (
    <div className="h-screen bg-[#4a2c5a] flex overflow-hidden">
      {/* Sidebar */}
      <FanSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <FanHeader />
        
        {/* Content Area */}
        <div className="flex-1 flex p-8 gap-8 overflow-auto">
          {/* Genres Form */}
          <div className="flex-1 min-w-0">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Select Your Music Genres</h1>
                <p className="text-gray-300">Choose at least 3 genres that represent your music taste. This helps us personalize your experience.</p>
              </div>
              
              <MusicGenreSelector />
              
              <div className="flex justify-between pt-6">
                <button 
                  onClick={() => window.history.back()}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Back to Profile
                </button>
                <button 
                  onClick={() => {
                    console.log('GenresPage: Proceed to Payment clicked');
                    setShowPayment(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Complete Setup - £1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
