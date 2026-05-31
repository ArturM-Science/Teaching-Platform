'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthFormState = {
  error?: string
  success?: string
}

function getAppUrl() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000'
  const url = appUrl.startsWith('http') ? appUrl : `https://${appUrl}`

  return url.replace(/\/$/, '')
}

function getCredentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  return { email, password }
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const credentials = getCredentials(formData)

  if ('error' in credentials) {
    return { error: credentials.error }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logIn(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const credentials = getCredentials(formData)

  if ('error' in credentials) {
    return { error: credentials.error }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/confirm?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Check your email for a password reset link.' }
}

export async function updatePassword(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
