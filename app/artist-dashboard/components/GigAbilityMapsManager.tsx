"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Save, Plus, MapPin, Globe, ExternalLink, Settings } from "lucide-react";
import { InteractiveMap } from "./InteractiveMap";

export function GigAbilityMapsManager() {
  const [zipCode, setZipCode] = useState("");
  const [localGigFee, setLocalGigFee] = useState("XXXX");
  const [localGigDuration, setLocalGigDuration] = useState("30 mins");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedWiderCountry, setSelectedWiderCountry] = useState("");

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Italy", "Spain", "Netherlands", "Belgium", "Switzerland",
    "Austria", "Sweden", "Norway", "Denmark", "Finland", "Ireland"
  ];

  const durations = [
    "30 mins", "45 mins", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours"
  ];

  const handleLocalGigFeeChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setLocalGigFee(numericValue);
  };

  return (
    <div className="space-y-8">
      {/* ZIP/Postal Code Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Home ZIP/Postal Code</h2>
          <p className="text-gray-600 text-sm">for Gig Location Calculations</p>
        </div>

        <div className="flex items-center space-x-3">
          <Input
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="ZIP / Postal Code"
            className="max-w-xs"
          />
          <div className="text-sm text-gray-500">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Location detected
            </span>
          </div>
        </div>
      </div>

      {/* Local Gig Area Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Local Gig Area</h2>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              Active Zone
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Where you&apos;ll perform a Gig for a set-fee, without charging additional fees (such as transport, accommodation)
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-3">Would you like to create a radius, or draw a zone on a map?</p>

          <div className="flex items-center space-x-4">
            <Select>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Draw Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="radius">Create Radius</SelectItem>
                <SelectItem value="draw">Draw Zone on Map</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Interactive
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">Interactive Gig Area Map</h4>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Live Map
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <MapPin className="w-3 h-3 mr-1" />
                OpenStreetMap
              </span>
            </div>
          </div>
          
          <InteractiveMap 
            zipCode={zipCode || "90266"} 
            localRadius={5000} 
            widerRadius={50000} 
          />
          
          <div className="mt-3 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
              <div>
                <strong className="text-blue-900">Local Area (5km radius)</strong> - Standard rate applies
              </div>
            </div>
            <div className="flex items-start space-x-2 mt-2">
              <div className="w-4 h-4 border-2 border-yellow-500 border-dashed rounded-full mt-0.5 flex-shrink-0"></div>
              <div>
                <strong className="text-yellow-900">Extended Area (50km radius)</strong> - Travel surcharge may apply
              </div>
            </div>
          </div>
        </div>


        {/* Local Gig Fee */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">Local Gig Set Fee</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                  Standard Rate
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">£ {localGigFee}</span>
                <span className="text-gray-600">for</span>
                <Select value={localGigDuration} onValueChange={setLocalGigDuration}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 mins">30 mins</SelectItem>
                    <SelectItem value="45 mins">45 mins</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              + Add Local Gig Fee
            </Button>
          </div>
        </div>
      </div>

      {/* Wider Gig Area Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Wider Gig Area</h2>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
              Extended Coverage
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Where you&apos;ll perform a Gig for a set-fee plus additional fees to be negotiated on a Gig-by-Gig basis to cover your costs
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-4">
            Would you like to create a radius, draw a zone on a map, or select a country?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="usa">🇺🇸 United States</SelectItem>
                  <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                  <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                  <SelectItem value="germany">🇩🇪 Germany</SelectItem>
                  <SelectItem value="france">🇫🇷 France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedWiderCountry} onValueChange={setSelectedWiderCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="usa">🇺🇸 United States</SelectItem>
                  <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                  <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                  <SelectItem value="germany">🇩🇪 Germany</SelectItem>
                  <SelectItem value="france">🇫🇷 France</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Wider Area Map Placeholder */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">Global Gig Area Map</h4>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                World Map
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                <Globe className="w-3 h-3 mr-1" />
                Global Reach
              </span>
            </div>
          </div>
          
          <InteractiveMap 
            zipCode="Global"
            localRadius={0}
            widerRadius={0}
            isWorldView={true}
          />
          
          <div className="mt-3 text-sm text-gray-600 bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-start space-x-2 mb-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full mt-0.5 flex-shrink-0"></div>
              <div>
                <strong className="text-purple-900">Selected Countries</strong> - Countries you&apos;re willing to perform in
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-dashed rounded-full mt-0.5 flex-shrink-0"></div>
              <div>
                <strong className="text-orange-900">International Rates</strong> - Special pricing for international gigs
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-4">
        <Button variant="outline" className="px-8 py-3 shadow-sm hover:shadow-md transition-shadow">
          <Save className="w-4 h-4 mr-2" />
          Save GigAbility Maps
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 shadow-md hover:shadow-lg transition-shadow">
          Publish GigAbility Maps
        </Button>
      </div>
    </div>
  );
}
