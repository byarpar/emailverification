import { Suspense } from 'react'
import VerifyEmailForm from './verify-email-form'
import { Skeleton } from "@/components/ui/skeleton"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Email Verification</h1>
      <Suspense fallback={<Skeleton className="w-[300px] h-[200px]" />}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  )
}

