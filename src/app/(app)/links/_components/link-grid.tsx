import type { SerializedLink, LinkFolderOption } from '@/lib/queries'
import { LinkCard } from './link-card'

export function LinkGrid({
  links,
  folders,
  emptyMessage = 'No links yet.',
}: {
  links: SerializedLink[]
  folders: LinkFolderOption[]
  emptyMessage?: string
}) {
  if (links.length === 0) {
    return (
      <p className='rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground'>
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-1 xl:grid-cols-2'>
      {links.map((link) => (
        <LinkCard key={link.id} link={link} folders={folders} />
      ))}
    </div>
  )
}
