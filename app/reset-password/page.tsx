'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/app/auth/actions'
import { AuthShell } from '@/components/AuthShell'

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, {})

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Use at least 6 characters. After saving, return to the learner cockpit."
    >
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
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-teal-600"
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
          {pending ? 'Saving...' : 'Set new password'}
        </button>
      </form>
    </AuthShell>
  )
}
