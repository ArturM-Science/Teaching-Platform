'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset } from '@/app/auth/actions'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {})

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <Link href="/" className="mb-10 text-sm font-medium text-zinc-500 hover:text-zinc-900">
          AI Agents Course
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {state.success ? (
            <div className="space-y-4">
              <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {state.success}
              </p>
              <Link
                href="/login"
                className="block text-center text-sm font-medium text-zinc-900 hover:text-zinc-700"
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
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                />
              </div>

              {state.error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {state.error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {pending ? 'Sending...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm text-zinc-500">
                Remember it?{' '}
                <Link href="/login" className="font-medium text-zinc-900 hover:text-zinc-700">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
