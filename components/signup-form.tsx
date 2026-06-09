'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { AuthFormState } from '@/app/auth/actions'

type SignupFormProps = {
  action: (
    state: AuthFormState,
    formData: FormData
  ) => Promise<AuthFormState>
}

export function SignupForm({ action }: SignupFormProps) {
  const [state, formAction, pending] = useActionState(action, {})
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  function continueToPassword() {
    const trimmed = email.trim()

    if (!trimmed) {
      setEmailError('Email is required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setEmail(trimmed)
    setEmailError('')
    setStep('password')
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <div className={`h-1 rounded-full ${step === 'email' ? 'bg-teal-500' : 'bg-teal-200'}`} />
        <div className={`h-1 rounded-full ${step === 'password' ? 'bg-teal-500' : 'bg-zinc-200'}`} />
      </div>

      {step === 'email' ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="signup-email-step" className="text-sm font-medium text-zinc-800">
              Email
            </label>
            <input
              id="signup-email-step"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (emailError) setEmailError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  continueToPassword()
                }
              }}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-teal-600"
            />
          </div>

          {emailError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {emailError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={continueToPassword}
            className="w-full rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Continue
          </button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Log in
            </Link>
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="email" value={email} />

          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            <span className="font-medium text-zinc-950">{email}</span>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="ml-3 font-semibold text-teal-700 hover:text-teal-800"
            >
              Edit
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium text-zinc-800">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-teal-600"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-confirm" className="text-sm font-medium text-zinc-800">
              Confirm password
            </label>
            <input
              id="signup-confirm"
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
            {pending ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Log in
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
