type UserAvatarProps = {
  name: string
}

export default function UserAvatar({ name }: UserAvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || '?'

  return (
    <div className="user-avatar" aria-label={`Profil ${name}`}>
      {initials}
    </div>
  )
}