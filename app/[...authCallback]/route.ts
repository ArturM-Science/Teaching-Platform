import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getRedirectUrl(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = pathname
  redirectUrl.search = ''

  return redirectUrl
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  // Defensive handler for misconfigured Supabase callback URLs such as /**?code=...
  // The normal path is /auth/confirm, but this prevents email confirmation from 404ing.
  if (!code) {
    return new NextResponse('This page could not be found.', { status: 404 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(getRedirectUrl(request, '/login'))
  }

  return NextResponse.redirect(getRedirectUrl(request, '/account'))
}
