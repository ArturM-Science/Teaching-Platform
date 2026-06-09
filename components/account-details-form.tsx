'use client'

import { useActionState, useState } from 'react'
import {
  updateAccountEmail,
  updateAccountPassword,
  type AccountFormState,
} from '@/app/account/actions'

type AccountDetailsFormProps = {
  email: string
  role: string
  joinedAt: string
}

const initialState: AccountFormState = {}

export function AccountDetailsForm({ email, role, joinedAt }: AccountDetailsFormProps) {
  const [editing, setEditing] = useState(false)
  const [emailState, emailAction, emailPending] = useActionState(updateAccountEmail, initialState)
  const [passwordState, passwordAction, passwordPending] = useActionState(updateAccountPassword, initialState)

  if (!editing) {
    return (
      <section className="rounded-md border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Profile</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">Account details</h2>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Edit details
          </button>
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
            <dt className="text-zinc-500">Email</dt>
            <dd className="text-right font-medium text-zinc-950">{email}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
            <dt className="text-zinc-500">Role</dt>
            <dd className="font-medium capitalize text-zinc-950">{role}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Joined</dt>
            <dd className="font-medium text-zinc-950">{joinedAt}</dd>
          </div>
        </dl>
      </section>
    )
  }

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Profile</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">Edit account details</h2>
        </div>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
        >
          Done
        </button>
      </div>

      <div className="mt-5 space-y-6">
        <form action={emailAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="account-email" className="text-sm font-medium text-zinc-800">
              Email
            </label>
            <input
              id="account-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={email}
              required
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-teal-600"
            />
          </div>

          {emailState.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {emailState.error}
            </p>
          ) : null}
          {emailState.success ? (
            <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
              {emailState.success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={emailPending}
            className="rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {emailPending ? 'Saving email...' : 'Save email'}
          </button>
        </form>

        <div className="border-t border-zinc-100 pt-6">
          <form action={passwordAction} className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-950">Change password</h3>
              <p className="mt-1 text-sm text-zinc-600">
                Your current password cannot be displayed. Enter a new one to replace it.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="account-password" className="text-sm font-medium text-zinc-800">
                New password
              </label>
              <input
                id="account-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-teal-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="account-confirm" className="text-sm font-medium text-zinc-800">
                Confirm new password
              </label>
              <input
                id="account-confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-teal-600"
              />
            </div>

            {passwordState.error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {passwordState.error}
              </p>
            ) : null}
            {passwordState.success ? (
              <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                {passwordState.success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={passwordPending}
              className="rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {passwordPending ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
