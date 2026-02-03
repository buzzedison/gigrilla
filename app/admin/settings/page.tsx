'use client'

import { useEffect, useState } from 'react'
import {
    Settings, Save, ToggleLeft, ToggleRight, Shield,
    Music, FileCheck, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'

interface PlatformSettings {
    approval_mode: {
        mode: 'auto' | 'manual'
        beta_phase: boolean
    }
    automated_verification_enabled: boolean
    moderation_settings: {
        auto_flag_explicit: boolean
        require_isrc: boolean
        require_iswc: boolean
    }
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/settings')
            const data = await response.json()
            if (data.success) {
                setSettings(data.settings)
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateSetting = async (key: string, value: any) => {
        setSaving(key)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setting_key: key, setting_value: value })
            })

            if (response.ok) {
                // Update local state
                if (key === 'approval_mode') {
                    setSettings(prev => prev ? { ...prev, approval_mode: value } : null)
                } else if (key === 'moderation_settings') {
                    setSettings(prev => prev ? { ...prev, moderation_settings: value } : null)
                } else if (key === 'automated_verification_enabled') {
                    setSettings(prev => prev ? { ...prev, automated_verification_enabled: value } : null)
                }

                setSaveSuccess(key)
                setTimeout(() => setSaveSuccess(null), 2000)
            }
        } catch (error) {
            console.error('Failed to update setting:', error)
        } finally {
            setSaving(null)
        }
    }

    const toggleApprovalMode = () => {
        if (!settings) return
        const newMode = settings.approval_mode.mode === 'auto' ? 'manual' : 'auto'
        updateSetting('approval_mode', { ...settings.approval_mode, mode: newMode })
    }

    const toggleModerationSetting = (field: keyof PlatformSettings['moderation_settings']) => {
        if (!settings) return
        const newSettings = {
            ...settings.moderation_settings,
            [field]: !settings.moderation_settings[field]
        }
        updateSetting('moderation_settings', newSettings)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <Settings className="w-8 h-8 text-purple-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                            <p className="mt-1 text-gray-500">Configure platform-wide moderation and approval settings</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Approval Mode */}
                <Card className="border-2 border-purple-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FileCheck className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle>Content Approval Mode</CardTitle>
                                    <CardDescription>
                                        Control how new releases are approved on the platform
                                    </CardDescription>
                                </div>
                            </div>
                            {saveSuccess === 'approval_mode' && (
                                <span className="flex items-center gap-1 text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Saved
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {settings?.approval_mode.mode === 'auto' ? 'Auto-Approve Mode' : 'Manual Review Mode'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {settings?.approval_mode.mode === 'auto'
                                        ? 'Releases are automatically published after submission (Beta phase)'
                                        : 'All releases require manual review before publishing'}
                                </p>
                            </div>
                            <button
                                onClick={toggleApprovalMode}
                                disabled={saving === 'approval_mode'}
                                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${settings?.approval_mode.mode === 'auto'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                    : 'bg-gray-300'
                                    }`}
                            >
                                {saving === 'approval_mode' ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin mx-auto" />
                                ) : (
                                    <span
                                        className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${settings?.approval_mode.mode === 'auto'
                                            ? 'translate-x-11'
                                            : 'translate-x-1'
                                            }`}
                                    />
                                )}
                            </button>
                        </div>

                        {settings?.approval_mode.beta_phase && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Beta Phase Active</p>
                                    <p className="text-sm text-amber-700">
                                        Auto-approve is enabled for beta testing. Switch to manual mode before public launch.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Moderation Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Moderation Settings</CardTitle>
                                <CardDescription>
                                    Configure automatic content moderation rules
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ToggleSetting
                            title="Auto-Flag Explicit Content"
                            description="Automatically flag releases marked as explicit for review"
                            enabled={settings?.moderation_settings?.auto_flag_explicit || false}
                            onToggle={() => toggleModerationSetting('auto_flag_explicit')}
                            saving={saving === 'moderation_settings'}
                            saved={saveSuccess === 'moderation_settings'}
                        />

                        <ToggleSetting
                            title="Require ISRC Code"
                            description="Make ISRC code mandatory for all track submissions"
                            enabled={settings?.moderation_settings?.require_isrc || false}
                            onToggle={() => toggleModerationSetting('require_isrc')}
                            saving={saving === 'moderation_settings'}
                            saved={saveSuccess === 'moderation_settings'}
                        />

                        <ToggleSetting
                            title="Require ISWC Code"
                            description="Make ISWC code mandatory for all musical works"
                            enabled={settings?.moderation_settings?.require_iswc || false}
                            onToggle={() => toggleModerationSetting('require_iswc')}
                            saving={saving === 'moderation_settings'}
                            saved={saveSuccess === 'moderation_settings'}
                        />
                    </CardContent>
                </Card>

                {/* Verification Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Music className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <CardTitle>Automated Verification</CardTitle>
                                <CardDescription>
                                    Enable automatic verification against music industry databases
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ToggleSetting
                            title="Enable Automated Verification"
                            description="Automatically verify ISRC/ISWC codes against MusicBrainz and other databases"
                            enabled={settings?.automated_verification_enabled || false}
                            onToggle={() => updateSetting('automated_verification_enabled', !settings?.automated_verification_enabled)}
                            saving={saving === 'automated_verification_enabled'}
                            saved={saveSuccess === 'automated_verification_enabled'}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

interface ToggleSettingProps {
    title: string
    description: string
    enabled: boolean
    onToggle: () => void
    saving?: boolean
    saved?: boolean
}

function ToggleSetting({ title, description, enabled, onToggle, saving, saved }: ToggleSettingProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div>
                <p className="font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                {saved && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                    </span>
                )}
                <button
                    onClick={onToggle}
                    disabled={saving}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${enabled ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin mx-auto" />
                    ) : (
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    )}
                </button>
            </div>
        </div>
    )
}
