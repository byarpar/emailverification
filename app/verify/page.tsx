import VerificationForm from '@/components/VerificationForm'

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Verify Your Email</h1>
      <VerificationForm />
    </div>
  )
}

