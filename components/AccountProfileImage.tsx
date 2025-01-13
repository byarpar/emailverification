import Image from 'next/image'
import { User } from 'lucide-react'
import { useState } from 'react'

interface AccountProfileImageProps {
  src: string | null
  alt: string
  size?: number
}

export function AccountProfileImage({ src, alt, size = 64 }: AccountProfileImageProps) {
  const [imageError, setImageError] = useState(false)

  if (!src || imageError) {
    return (
      <div 
        className="bg-gray-200 rounded-full flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <User className="text-gray-500" size={size * 0.5} />
      </div>
    )
  }

  return (
    <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        onError={() => setImageError(true)}
      />
    </div>
  )
}

