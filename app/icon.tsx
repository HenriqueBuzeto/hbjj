import Image from 'next/image'

export const runtime = 'nodejs'

export const size = { width: 32, height: 32 }

const icon = () => {
  return (
    <Image
      src="/logo.png"
      alt="HBJJ Logo"
      width={32}
      height={32}
      className="rounded-lg"
    />
  )
}

export default icon
