'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Database, CheckCircle, Loader2 } from 'lucide-react'
// Button import removed - not used

interface AnalyticsSummary {
  gtin: {
    totalLookups: number
    successfulLookups: number
    cacheHits: number
    successRate: number
    cacheHitRate: number
    cacheSize: number
  }
  isrc: {
    totalLookups: number
    successfulLookups: number
    cacheHits: number
    successRate: number
    cacheHitRate: number
    cacheSize: number
  }
  totals: {
    totalLookups: number
    cacheSize: number
  }
}

interface TopGTIN {
  gtin: string
  gtin_type: string
  release_title: string
  artist_name: string
  lookup_count: number
}

interface TopISRC {
  isrc: string
  track_title: string
  artist_name: string
  lookup_count: number
  country_code: string
}

export function MusicAnalyticsDashboard() {
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30')
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [topGTINs, setTopGTINs] = useState<TopGTIN[]>([])
  const [topISRCs, setTopISRCs] = useState<TopISRC[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'gtin' | 'isrc'>('overview')

  useEffect(() => {
    loadAnalytics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      // Load summary
      const summaryRes = await fetch(`/api/music-analytics?type=summary&period=${period}`)
      const summaryData = await summaryRes.json()
      if (summaryData.success) {
        setSummary(summaryData.data)
      }

      // Load top GTINs
      const gtinRes = await fetch(`/api/music-analytics?type=gtin&period=${period}`)
      const gtinData = await gtinRes.json()
      if (gtinData.success) {
        setTopGTINs(gtinData.data.topGTINs)
      }

      // Load top ISRCs
      const isrcRes = await fetch(`/api/music-analytics?type=isrc&period=${period}`)
      const isrcData = await isrcRes.json()
      if (isrcData.success) {
        setTopISRCs(isrcData.data.topISRCs)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl text-white p-6 md:p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-purple-200 font-semibold">Music Codes</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">Analytics Dashboard</h1>
            <p className="text-purple-100 mt-2">Track GTIN and ISRC lookup performance</p>
          </div>
          <BarChart3 className="w-16 h-16 text-purple-300 opacity-50" />
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 border border-gray-200 w-fit">
        {[
          { value: '7' as const, label: 'Last 7 days' },
          { value: '30' as const, label: 'Last 30 days' },
          { value: '90' as const, label: 'Last 90 days' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === option.value
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 border border-gray-200">
        {[
          { value: 'overview' as const, label: 'Overview' },
          { value: 'gtin' as const, label: 'GTIN (UPC/EAN)' },
          { value: 'isrc' as const, label: 'ISRC Codes' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* GTIN Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">GTIN Lookups</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Lookups</span>
                  <span className="text-2xl font-bold text-gray-900">{summary.gtin.totalLookups}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-lg font-semibold text-green-600">{summary.gtin.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache Hit Rate</span>
                  <span className="text-lg font-semibold text-blue-600">{summary.gtin.cacheHitRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cached Items</span>
                  <span className="text-lg font-semibold text-gray-700">{summary.gtin.cacheSize}</span>
                </div>
              </div>
            </div>

            {/* ISRC Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">ISRC Lookups</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Lookups</span>
                  <span className="text-2xl font-bold text-gray-900">{summary.isrc.totalLookups}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-lg font-semibold text-green-600">{summary.isrc.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache Hit Rate</span>
                  <span className="text-lg font-semibold text-blue-600">{summary.isrc.cacheHitRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cached Items</span>
                  <span className="text-lg font-semibold text-gray-700">{summary.isrc.cacheSize}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">Total Lookups</span>
              </div>
              <p className="text-4xl font-bold">{summary.totals.totalLookups}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">Total Cached</span>
              </div>
              <p className="text-4xl font-bold">{summary.totals.cacheSize}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">Cache Efficiency</span>
              </div>
              <p className="text-4xl font-bold">
                {summary.totals.totalLookups > 0
                  ? Math.round(
                      ((summary.gtin.cacheHits + summary.isrc.cacheHits) / summary.totals.totalLookups) * 100
                    )
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GTIN Tab */}
      {activeTab === 'gtin' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Looked Up GTINs</h3>
          {topGTINs.length > 0 ? (
            <div className="space-y-3">
              {topGTINs.map((item, index) => (
                <div
                  key={item.gtin}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.release_title}</p>
                    <p className="text-sm text-gray-600">{item.artist_name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {item.gtin_type.toUpperCase()}: {item.gtin}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{item.lookup_count}</p>
                    <p className="text-xs text-gray-500">lookups</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No GTIN lookups in this period</p>
          )}
        </div>
      )}

      {/* ISRC Tab */}
      {activeTab === 'isrc' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Looked Up ISRCs</h3>
          {topISRCs.length > 0 ? (
            <div className="space-y-3">
              {topISRCs.map((item, index) => (
                <div
                  key={item.isrc}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.track_title}</p>
                    <p className="text-sm text-gray-600">{item.artist_name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {item.isrc} {item.country_code && `(${item.country_code})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{item.lookup_count}</p>
                    <p className="text-xs text-gray-500">lookups</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No ISRC lookups in this period</p>
          )}
        </div>
      )}
    </div>
  )
}
