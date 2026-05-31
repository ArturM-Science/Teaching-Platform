'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/app/auth/actions'

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, {})

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Must be at least 6 characters.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-800">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium text-zinc-800">
                Confirm password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
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
              {pending ? 'Saving...' : 'Set new password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
