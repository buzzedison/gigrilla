"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { useAuth } from '../../../lib/auth-context'
import { Banknote, CreditCard, Building2, CheckCircle, X, Info } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface PaymentDetails {
  use_fan_banking?: boolean
  payment_out_method?: 'direct_debit' | 'card'
  payment_out_bank_name?: string
  payment_out_account_holder?: string
  payment_out_sort_code?: string
  payment_out_account_number?: string
  payment_out_card_name?: string
  payment_out_card_number?: string
  payment_out_card_expiry?: string
  payment_out_card_cvv?: string
  payment_in_same_as_out?: boolean
  payment_in_method?: 'direct_debit' | 'card'
  payment_in_bank_name?: string
  payment_in_account_holder?: string
  payment_in_sort_code?: string
  payment_in_account_number?: string
  payment_in_card_name?: string
  payment_in_card_number?: string
  payment_in_card_expiry?: string
  payment_in_card_cvv?: string
}

interface Notification {
  type: 'success' | 'error'
  message: string
  visible: boolean
}

export function ArtistPaymentsManager() {
  const { user } = useAuth()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    use_fan_banking: false,
    payment_out_method: 'direct_debit',
    payment_in_same_as_out: true,
    payment_in_method: 'direct_debit'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    loadPaymentDetails()
  }, [user])

  const loadPaymentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/artist-payments')
      const result = await response.json()

      if (result.data) {
        setPaymentDetails({
          use_fan_banking: result.data.use_fan_banking ?? false,
          payment_out_method: result.data.payment_out_method ?? 'direct_debit',
          payment_out_bank_name: result.data.payment_out_bank_name ?? '',
          payment_out_account_holder: result.data.payment_out_account_holder ?? '',
          payment_out_sort_code: result.data.payment_out_sort_code ?? '',
          payment_out_account_number: result.data.payment_out_account_number ?? '',
          payment_out_card_name: result.data.payment_out_card_name ?? '',
          payment_out_card_number: result.data.payment_out_card_number ?? '',
          payment_out_card_expiry: result.data.payment_out_card_expiry ?? '',
          payment_out_card_cvv: result.data.payment_out_card_cvv ?? '',
          payment_in_same_as_out: result.data.payment_in_same_as_out ?? true,
          payment_in_method: result.data.payment_in_method ?? 'direct_debit',
          payment_in_bank_name: result.data.payment_in_bank_name ?? '',
          payment_in_account_holder: result.data.payment_in_account_holder ?? '',
          payment_in_sort_code: result.data.payment_in_sort_code ?? '',
          payment_in_account_number: result.data.payment_in_account_number ?? '',
          payment_in_card_name: result.data.payment_in_card_name ?? '',
          payment_in_card_number: result.data.payment_in_card_number ?? '',
          payment_in_card_expiry: result.data.payment_in_card_expiry ?? '',
          payment_in_card_cvv: result.data.payment_in_card_cvv ?? ''
        })
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
      showNotification('error', 'Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/artist-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDetails)
      })

      if (!response.ok) {
        throw new Error('Failed to save payment details')
      }

      showNotification('success', 'Payment details saved successfully')
    } catch (error) {
      console.error('Error saving payment details:', error)
      showNotification('error', 'Failed to save payment details')
    } finally {
      setSaving(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null)
    }, 3000)
  }

  const updatePaymentDetails = (field: keyof PaymentDetails, value: any) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading payment details...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300",
            notification.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            notification.type === 'success' ? "bg-green-500" : "bg-red-500"
          )}
        >
          <div className="flex items-center space-x-2 text-white">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Banknote className="w-5 h-5" />
            <span>Banking Details Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Should we use the same Banking Details for this Artist Profile payments as your Fan Profile?
            </Label>
            <RadioGroup
              value={paymentDetails.use_fan_banking ? 'same' : 'different'}
              onValueChange={(value) => updatePaymentDetails('use_fan_banking', value === 'same')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="same" id="same-banking" />
                <Label htmlFor="same-banking" className="font-normal cursor-pointer">
                  Use the same Banking Details as Fan Profile for Artist Profile
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="different" id="different-banking" />
                <Label htmlFor="different-banking" className="font-normal cursor-pointer">
                  Use different Banking Details for Artist Profile
                </Label>
              </div>
            </RadioGroup>
          </div>

          {!paymentDetails.use_fan_banking && (
            <div className="space-y-6 pt-4 border-t">
              {/* Payments Out Section */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Banking details for payments you make (e.g., paying crew members, vendors)</p>
                </div>

                <h3 className="text-lg font-semibold">Banking Details for Payments Out</h3>

                <RadioGroup
                  value={paymentDetails.payment_out_method}
                  onValueChange={(value: 'direct_debit' | 'card') => updatePaymentDetails('payment_out_method', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct_debit" id="out-direct-debit" />
                    <Label htmlFor="out-direct-debit" className="font-normal cursor-pointer flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Use Direct Debit Transfers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="out-card" />
                    <Label htmlFor="out-card" className="font-normal cursor-pointer flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Use Bank Card
                    </Label>
                  </div>
                </RadioGroup>

                {paymentDetails.payment_out_method === 'direct_debit' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="out-bank-name">Bank Name</Label>
                      <Input
                        id="out-bank-name"
                        value={paymentDetails.payment_out_bank_name}
                        onChange={(e) => updatePaymentDetails('payment_out_bank_name', e.target.value)}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="out-account-holder">Name of Account Holder</Label>
                      <Input
                        id="out-account-holder"
                        value={paymentDetails.payment_out_account_holder}
                        onChange={(e) => updatePaymentDetails('payment_out_account_holder', e.target.value)}
                        placeholder="Enter account holder name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="out-sort-code">Sort Code</Label>
                      <Input
                        id="out-sort-code"
                        value={paymentDetails.payment_out_sort_code}
                        onChange={(e) => updatePaymentDetails('payment_out_sort_code', e.target.value)}
                        placeholder="00-00-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="out-account-number">Bank Account Number</Label>
                      <Input
                        id="out-account-number"
                        value={paymentDetails.payment_out_account_number}
                        onChange={(e) => updatePaymentDetails('payment_out_account_number', e.target.value)}
                        placeholder="Enter account number"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="out-card-name">Name On Card</Label>
                      <Input
                        id="out-card-name"
                        value={paymentDetails.payment_out_card_name}
                        onChange={(e) => updatePaymentDetails('payment_out_card_name', e.target.value)}
                        placeholder="Enter name as shown on card"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="out-card-number">Long Card Number</Label>
                      <Input
                        id="out-card-number"
                        value={paymentDetails.payment_out_card_number}
                        onChange={(e) => updatePaymentDetails('payment_out_card_number', e.target.value)}
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="out-card-expiry">Expiry Date</Label>
                      <Input
                        id="out-card-expiry"
                        value={paymentDetails.payment_out_card_expiry}
                        onChange={(e) => updatePaymentDetails('payment_out_card_expiry', e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="out-card-cvv">Security Code</Label>
                      <Input
                        id="out-card-cvv"
                        value={paymentDetails.payment_out_card_cvv}
                        onChange={(e) => updatePaymentDetails('payment_out_card_cvv', e.target.value)}
                        placeholder="CVV"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payments In Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Banking details to receive payments (e.g., gig fees, royalties)</p>
                </div>

                <h3 className="text-lg font-semibold">Banking Details to Receive Payments</h3>

                <RadioGroup
                  value={paymentDetails.payment_in_same_as_out ? 'same' : 'different'}
                  onValueChange={(value) => updatePaymentDetails('payment_in_same_as_out', value === 'same')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same" id="in-same" />
                    <Label htmlFor="in-same" className="font-normal cursor-pointer">
                      Same as Payments Out
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="different" id="in-different" />
                    <Label htmlFor="in-different" className="font-normal cursor-pointer">
                      Different to Payments Out
                    </Label>
                  </div>
                </RadioGroup>

                {!paymentDetails.payment_in_same_as_out && (
                  <>
                    <RadioGroup
                      value={paymentDetails.payment_in_method}
                      onValueChange={(value: 'direct_debit' | 'card') => updatePaymentDetails('payment_in_method', value)}
                      className="pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="direct_debit" id="in-direct-debit" />
                        <Label htmlFor="in-direct-debit" className="font-normal cursor-pointer flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          Use Direct Debit Transfers
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="in-card" />
                        <Label htmlFor="in-card" className="font-normal cursor-pointer flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Use Bank Card
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentDetails.payment_in_method === 'direct_debit' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="in-bank-name">Bank Name</Label>
                          <Input
                            id="in-bank-name"
                            value={paymentDetails.payment_in_bank_name}
                            onChange={(e) => updatePaymentDetails('payment_in_bank_name', e.target.value)}
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="in-account-holder">Name of Account Holder</Label>
                          <Input
                            id="in-account-holder"
                            value={paymentDetails.payment_in_account_holder}
                            onChange={(e) => updatePaymentDetails('payment_in_account_holder', e.target.value)}
                            placeholder="Enter account holder name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="in-sort-code">Sort Code</Label>
                          <Input
                            id="in-sort-code"
                            value={paymentDetails.payment_in_sort_code}
                            onChange={(e) => updatePaymentDetails('payment_in_sort_code', e.target.value)}
                            placeholder="00-00-00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="in-account-number">Bank Account Number</Label>
                          <Input
                            id="in-account-number"
                            value={paymentDetails.payment_in_account_number}
                            onChange={(e) => updatePaymentDetails('payment_in_account_number', e.target.value)}
                            placeholder="Enter account number"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="in-card-name">Name On Card</Label>
                          <Input
                            id="in-card-name"
                            value={paymentDetails.payment_in_card_name}
                            onChange={(e) => updatePaymentDetails('payment_in_card_name', e.target.value)}
                            placeholder="Enter name as shown on card"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="in-card-number">Long Card Number</Label>
                          <Input
                            id="in-card-number"
                            value={paymentDetails.payment_in_card_number}
                            onChange={(e) => updatePaymentDetails('payment_in_card_number', e.target.value)}
                            placeholder="0000 0000 0000 0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="in-card-expiry">Expiry Date</Label>
                          <Input
                            id="in-card-expiry"
                            value={paymentDetails.payment_in_card_expiry}
                            onChange={(e) => updatePaymentDetails('payment_in_card_expiry', e.target.value)}
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="in-card-cvv">Security Code</Label>
                          <Input
                            id="in-card-cvv"
                            value={paymentDetails.payment_in_card_cvv}
                            onChange={(e) => updatePaymentDetails('payment_in_card_cvv', e.target.value)}
                            placeholder="CVV"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {saving ? 'Saving...' : 'Save Payment Details'}
        </Button>
      </div>
    </div>
  )
}
