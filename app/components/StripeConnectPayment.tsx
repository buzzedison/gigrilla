"use client";

import { useState } from "react";
import { CreditCard, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface StripeConnectPaymentProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeConnectPayment({ 
  amount, 
  currency, 
  description, 
  onSuccess, 
  onCancel 
}: StripeConnectPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    postalCode: ''
  });

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.substring(0, 19);
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) value = value.substring(0, 5);
    }
    
    // Format CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) value = value.substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    try {
      console.log('Processing payment...', { amount, currency, description });
      
      // Simulate API call to process payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Always succeed since this is just a simulation
      setPaymentComplete(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-[#4a2c5a] flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of {formatAmount(amount, currency)} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4a2c5a] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complete Your Purchase</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg mb-6 text-center">
          <div className="text-sm opacity-90">Total Amount</div>
          <div className="text-3xl font-bold">{formatAmount(amount, currency)}</div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              className="w-full"
            />
          </div>

          {/* Card Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Information
            </label>
            
            {/* Card Number */}
            <div className="relative mb-2">
              <Input
                type="text"
                placeholder="1234 1234 1234 1234"
                value={formData.cardNumber}
                onChange={handleInputChange('cardNumber')}
                required
                className="w-full pr-10"
              />
              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange('expiryDate')}
                required
              />
              <Input
                type="text"
                placeholder="CVV"
                value={formData.cvv}
                onChange={handleInputChange('cvv')}
                required
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <Input
              type="text"
              placeholder="Full name on card"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              className="w-full"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <Input
              type="text"
              placeholder="SW1A 1AA"
              value={formData.postalCode}
              onChange={handleInputChange('postalCode')}
              required
              className="w-full"
            />
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </div>
            ) : (
              `Pay ${formatAmount(amount, currency)}`
            )}
          </Button>
        </form>

        {/* Powered by Stripe (simulation) */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold">Stripe</span> (Simulation)
          </p>
        </div>
      </div>
    </div>
  );
}
