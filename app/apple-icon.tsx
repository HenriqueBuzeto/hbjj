import Image from 'next/image'

export const runtime = 'nodejs'

export const size = { width: 180, height: 180 }

const appleIcon = () => {
  return (
    <Image
      src="/logo.png"
      alt="HBJJ Logo"
      width={180}
      height={180}
      className="rounded-lg"
    />
  )
}

export default appleIcon
