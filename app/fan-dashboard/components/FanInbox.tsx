'use client'

import { InboxPanel } from '../../components/inbox/InboxPanel'

interface FanInboxProps {
  initialFolderId?: string | null
  onFolderChange?: (folderId: string) => void
  onUnreadCountChange?: (count: number) => void
}

export function FanInbox({ initialFolderId, onFolderChange, onUnreadCountChange }: FanInboxProps) {
  return (
    <InboxPanel
      audience="fan"
      title="Messages"
      subtitle="Your in-app inbox replaces mass email blasts. Check folders for gig, artist, and venue updates."
      initialFolderId={initialFolderId}
      onFolderChange={onFolderChange}
      onUnreadCountChange={onUnreadCountChange}
    />
  )
}
