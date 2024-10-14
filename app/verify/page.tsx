'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState('Verifying...')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setVerificationStatus('Email verified successfully. You can now log in.')
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setVerificationStatus('Verification failed. Please try again or contact support.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationStatus('An error occurred during verification. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Verification</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{verificationStatus}</p>
        </div>
      </div>
    </div>
  )
}