'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset } from '@/app/auth/actions'
import { AuthShell } from '@/components/AuthShell'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {})

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset password"
      description="Enter your email and we will send you a reset link."
    >
      {state.success ? (
        <div className="space-y-4">
          <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
            {state.success}
          </p>
          <Link
            href="/login"
            className="block text-center text-sm font-semibold text-zinc-900 hover:text-zinc-700"
          >
            Back to log in
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-800">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-teal-600"
            />
          </div>

          {state.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {pending ? 'Sending...' : 'Send reset link'}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Remember it?{' '}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
