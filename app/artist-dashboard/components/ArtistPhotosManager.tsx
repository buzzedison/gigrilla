"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { useAuth } from '../../../lib/auth-context'
import { Upload, Image, Edit3, Trash2, Plus, Camera, FileImage } from 'lucide-react'
import { cn } from '../../../lib/utils'
import NextImage from 'next/image'

interface ArtistPhoto {
  id: string
  url: string
  caption: string
  type: 'logo' | 'header' | 'photo'
  created_at: string
}

interface ArtistPhotosManagerProps {
  onPhotosUpdate?: (photos: ArtistPhoto[]) => void
  mode?: 'all' | 'branding' | 'photos'
}

export function ArtistPhotosManager({ onPhotosUpdate, mode = 'all' }: ArtistPhotosManagerProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photos, setPhotos] = useState<ArtistPhoto[]>([])
  const [logo, setLogo] = useState<ArtistPhoto | null>(null)
  const [headerImage, setHeaderImage] = useState<ArtistPhoto | null>(null)
  const [profilePhotos, setProfilePhotos] = useState<ArtistPhoto[]>([])
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, visible: boolean } | null>(null)

  const [logoCaption, setLogoCaption] = useState('')
  const [headerCaption, setHeaderCaption] = useState('')
  const [photoCaption, setPhotoCaption] = useState('')
  const [uploadingType, setUploadingType] = useState<'logo' | 'header' | 'photo' | null>(null)

  const fileInputRefs = {
    logo: useRef<HTMLInputElement>(null),
    header: useRef<HTMLInputElement>(null),
    photo: useRef<HTMLInputElement>(null)
  }

  useEffect(() => {
    const loadData = async () => {
      await loadPhotos()
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadPhotos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/artist-photos')
      if (response.ok) {
        const result = await response.json()
        const allPhotos = result.data || []

        const logoPhoto = allPhotos.find((p: ArtistPhoto) => p.type === 'logo')
        const headerPhoto = allPhotos.find((p: ArtistPhoto) => p.type === 'header')
        const photoGallery = allPhotos.filter((p: ArtistPhoto) => p.type === 'photo')

        setLogo(logoPhoto || null)
        setHeaderImage(headerPhoto || null)
        setProfilePhotos(photoGallery)
        setPhotos(allPhotos)
      }
    } catch (error) {
      console.error('Error loading photos:', error)
      showNotification('error', 'Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null)
    }, 5000)
  }

  const handleFileSelect = (type: 'logo' | 'header' | 'photo') => {
    fileInputRefs[type].current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'header' | 'photo') => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showNotification('error', 'Please upload a .jpg, .png, or .webp file')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showNotification('error', 'File size must be less than 5MB')
      return
    }

    await uploadPhoto(file, type)
  }

  const uploadPhoto = async (file: File, type: 'logo' | 'header' | 'photo') => {
    try {
      setSaving(true)
      setUploadingType(type)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const caption = type === 'logo' ? logoCaption : type === 'header' ? headerCaption : photoCaption
      if (caption.trim()) {
        formData.append('caption', caption.trim())
      }

      const response = await fetch('/api/artist-photos', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload photo')
      }

      const result = await response.json()
      const newPhoto = result.data as ArtistPhoto

      if (type === 'logo') {
        setLogo(newPhoto)
        setLogoCaption('')
      } else if (type === 'header') {
        setHeaderImage(newPhoto)
        setHeaderCaption('')
      } else {
        setProfilePhotos(prev => [...prev, newPhoto])
        setPhotoCaption('')
      }

      let nextPhotos: ArtistPhoto[] = []
      setPhotos(prev => {
        nextPhotos = type === 'photo'
          ? [...prev, newPhoto]
          : [...prev.filter(p => p.type !== type), newPhoto]
        return nextPhotos
      })
      onPhotosUpdate?.(nextPhotos)

      showNotification('success', `${type === 'logo' ? 'Logo' : type === 'header' ? 'Header image' : 'Photo'} uploaded successfully!`)
    } catch (error) {
      console.error('Error uploading photo:', error)
      showNotification('error', 'Failed to upload photo')
    } finally {
      setSaving(false)
      setUploadingType(null)
    }
  }

  const deletePhoto = async (photoId: string) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/artist-photos/${photoId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      const deletedPhoto = photos.find(p => p.id === photoId)
      if (deletedPhoto) {
        if (deletedPhoto.type === 'logo') {
          setLogo(null)
        } else if (deletedPhoto.type === 'header') {
          setHeaderImage(null)
        } else {
          setProfilePhotos(prev => prev.filter(p => p.id !== photoId))
        }

        let nextPhotos: ArtistPhoto[] = []
        setPhotos(prev => {
          nextPhotos = prev.filter(p => p.id !== photoId)
          return nextPhotos
        })
        onPhotosUpdate?.(nextPhotos)
      }

      showNotification('success', 'Photo deleted successfully')
    } catch (error) {
      console.error('Error deleting photo:', error)
      showNotification('error', 'Failed to delete photo')
    } finally {
      setSaving(false)
    }
  }

  const updatePhotoCaption = async (photoId: string, newCaption: string) => {
    try {
      const response = await fetch(`/api/artist-photos/${photoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ caption: newCaption })
      })

      if (!response.ok) {
        throw new Error('Failed to update caption')
      }

      const updatePhotoInList = (photoList: ArtistPhoto[]) =>
        photoList.map(p => p.id === photoId ? { ...p, caption: newCaption } : p)

      if (logo?.id === photoId) {
        setLogo(prev => prev ? { ...prev, caption: newCaption } : null)
      }
      if (headerImage?.id === photoId) {
        setHeaderImage(prev => prev ? { ...prev, caption: newCaption } : null)
      }
      setProfilePhotos(prev => updatePhotoInList(prev))

      let nextPhotos: ArtistPhoto[] = []
      setPhotos(prev => {
        nextPhotos = updatePhotoInList(prev)
        return nextPhotos
      })
      onPhotosUpdate?.(nextPhotos)

      showNotification('success', 'Caption updated successfully')
    } catch (error) {
      console.error('Error updating caption:', error)
      showNotification('error', 'Failed to update caption')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const showBranding = mode === 'all' || mode === 'branding'
  const showPhotos = mode === 'all' || mode === 'photos'

  return (
    <div className="space-y-6">
      {notification && notification.visible && (
        <div className={cn(
          "p-4 rounded-lg border transition-all duration-300 transform relative",
          notification.type === 'success' && "bg-green-50 border-green-200 text-green-800",
          notification.type === 'error' && "bg-red-50 border-red-200 text-red-800"
        )}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {showBranding && (
        <>
          <Card id="artist-logo-logo" className="scroll-mt-28">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Camera className="w-5 h-5" />
                Artist Profile Logo
              </CardTitle>
              <p className="text-sm text-gray-600">Add your Artist Logo:</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• This is your Artist Profile Picture across Gigrilla</p>
                <p>• Logo must be .jpg, .png, or .webp</p>
                <p>• Minimum 400x400 pixels, maximum 5MB file size</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!logo ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">Drag & drop your logo here or click to browse</p>
                      <Input
                        ref={fileInputRefs.logo}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'logo')}
                      />
                      <Textarea
                        placeholder="Write a caption for your logo..."
                        value={logoCaption}
                        onChange={(e) => setLogoCaption(e.target.value)}
                        className="mb-4"
                        rows={2}
                      />
                      <Button
                        onClick={() => handleFileSelect('logo')}
                        disabled={saving && uploadingType === 'logo'}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {saving && uploadingType === 'logo' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Logo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="relative">
                        <NextImage
                          src={logo.url}
                          alt="Artist Logo"
                          width={96}
                          height={96}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{logo.caption || 'Artist Logo'}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded {new Date(logo.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCaption = prompt('Edit caption:', logo.caption)
                            if (newCaption !== null) {
                              updatePhotoCaption(logo.id, newCaption)
                            }
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePhoto(logo.id)}
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card id="artist-logo-header" className="scroll-mt-28">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <FileImage className="w-5 h-5" />
                Artist Profile Header Image
              </CardTitle>
              <p className="text-sm text-gray-600">Add your Artist Profile Header Image:</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• This is the image across the top of your Artist Profile</p>
                <p>• Image must be .jpg, .png, or .webp</p>
                <p>• Minimum 1200x400 pixels, maximum 5MB file size</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {!headerImage ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">Drag & drop your header image here or click to browse</p>
                      <Input
                        ref={fileInputRefs.header}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'header')}
                      />
                      <Textarea
                        placeholder="Write a caption for your image..."
                        value={headerCaption}
                        onChange={(e) => setHeaderCaption(e.target.value)}
                        className="mb-4"
                        rows={2}
                      />
                      <Button
                        onClick={() => handleFileSelect('header')}
                        disabled={saving && uploadingType === 'header'}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {saving && uploadingType === 'header' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="relative mb-4">
                        <NextImage
                          src={headerImage.url}
                          alt="Artist Header"
                          width={800}
                          height={192}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{headerImage.caption || 'Header Image'}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(headerImage.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCaption = prompt('Edit caption:', headerImage.caption)
                              if (newCaption !== null) {
                                updatePhotoCaption(headerImage.id, newCaption)
                              }
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePhoto(headerImage.id)}
                            disabled={saving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showPhotos && (
        <Card id="artist-photos-gallery" className="scroll-mt-28">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-5 h-5" aria-hidden="true" />
              Artist Profile Photos
            </CardTitle>
            <p className="text-sm text-gray-600">Add your Artist Profile Photos:</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• These are the images for your Artist Profile carousel</p>
              <p>• Photos must be .jpg, .png, or .webp</p>
              <p>• Minimum 800x800 pixels, maximum 5MB file size</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">Drag & drop your photos here or click to browse</p>
                <Input
                  ref={fileInputRefs.photo}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'photo')}
                />
                <Textarea
                  placeholder="Write a caption for your photo..."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="mb-4"
                  rows={2}
                />
                <Button
                  onClick={() => handleFileSelect('photo')}
                  disabled={saving && uploadingType === 'photo'}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {saving && uploadingType === 'photo' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
              </div>

              {profilePhotos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profilePhotos.map((photo) => (
                    <div key={photo.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="relative mb-3">
                        <NextImage
                          src={photo.url}
                          alt={photo.caption || 'Profile photo'}
                          width={400}
                          height={160}
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                      <p className="font-medium text-gray-900 text-sm mb-1">{photo.caption || 'Profile Photo'}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCaption = prompt('Edit caption:', photo.caption)
                            if (newCaption !== null) {
                              updatePhotoCaption(photo.id, newCaption)
                            }
                          }}
                          className="flex-1"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePhoto(photo.id)}
                          disabled={saving}
                          className="flex-1"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profilePhotos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" aria-hidden="true" />
                  <p>No photos uploaded yet</p>
                  <p className="text-sm">Upload your first photo to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
