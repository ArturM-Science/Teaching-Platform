'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import type { AuthFormState } from '@/app/auth/actions'

type AuthFormProps = {
  action: (
    state: AuthFormState,
    formData: FormData
  ) => Promise<AuthFormState>
  buttonLabel: string
  footerHref: string
  footerLabel: string
  footerText: string
}

export function AuthForm({
  action,
  buttonLabel,
  footerHref,
  footerLabel,
  footerText,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
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

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-800">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {pending ? 'Working...' : buttonLabel}
      </button>

      <p className="text-center text-sm text-zinc-500">
        {footerText}{' '}
        <Link href={footerHref} className="font-semibold text-teal-700 hover:text-teal-800">
          {footerLabel}
        </Link>
      </p>
    </form>
  )
}
