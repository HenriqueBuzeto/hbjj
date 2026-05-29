import Image from 'next/image'

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
