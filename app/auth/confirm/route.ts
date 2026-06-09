import type { EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getSafeNextPath(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') ?? '/account'

  if (!next.startsWith('/') || next.startsWith('//')) {
    return '/account'
  }

  return next
}

function getRedirectUrl(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = pathname
  redirectUrl.search = ''

  return redirectUrl
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null
  const code = request.nextUrl.searchParams.get('code')
  const supabase = await createClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })

    if (!error) {
      return NextResponse.redirect(getRedirectUrl(request, getSafeNextPath(request)))
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(getRedirectUrl(request, getSafeNextPath(request)))
    }
  }

  return NextResponse.redirect(getRedirectUrl(request, '/login'))
}
