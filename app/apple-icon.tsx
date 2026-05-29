import Image from 'next/image'

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
