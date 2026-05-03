interface AvatarProps {
  name: string
  size?: 'sm' | 'md'
  title?: string
}

export function Avatar({ name, size = 'md', title }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <div
      className={`avatar ${sizeClass}`}
      title={title || name}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
