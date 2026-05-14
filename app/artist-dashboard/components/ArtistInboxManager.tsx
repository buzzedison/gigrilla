'use client'

import { DirectMessagesPanel } from '../../components/messages/DirectMessagesPanel'

interface ArtistInboxManagerProps {
  initialFolderId?: string | null
  onFolderChange?: (folderId: string) => void
  onUnreadCountChange?: (count: number) => void
}

export function ArtistInboxManager({
  initialFolderId,
  onFolderChange,
  onUnreadCountChange,
}: ArtistInboxManagerProps) {
  return (
    <DirectMessagesPanel
      audience="artist"
      title="Artist Messages"
      subtitle="Real direct-message threads for gigs, users, and system conversations."
      initialFolderId={initialFolderId}
      onFolderChange={onFolderChange}
      onUnreadCountChange={onUnreadCountChange}
    />
  )
}
