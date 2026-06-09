'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AccountFormState = {
  error?: string
  success?: string
}

export async function updateAccountEmail(
  _state: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const email = String(formData.get('email') ?? '').trim()

  if (!email) {
    return { error: 'Email is required.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You need to log in again before editing account details.' }
  }

  if (user.email?.toLowerCase() === email.toLowerCase()) {
    return { success: 'This email is already on your account.' }
  }

  const { error } = await supabase.auth.updateUser({ email })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account')
  return { success: 'Check your new email address to confirm the change.' }
}

export async function updateAccountPassword(
  _state: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
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

  return { success: 'Password updated.' }
}
