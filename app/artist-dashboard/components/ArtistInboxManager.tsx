'use client'

import { InboxPanel } from '../../components/inbox/InboxPanel'

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
    <InboxPanel
      audience="artist"
      title="Artist Messages"
      subtitle="Manage inbox updates without mass-email workflows. Use folders to track invites, requests, and release updates."
      initialFolderId={initialFolderId}
      onFolderChange={onFolderChange}
      onUnreadCountChange={onUnreadCountChange}
    />
  )
}
