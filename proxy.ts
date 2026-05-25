import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutePrefixes = ['/dashboard', '/modules', '/workshops', '/instructor']
const guestRoutePrefixes = ['/login', '/signup']

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function redirectWithSupabaseCookies(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse
) {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = pathname
  redirectUrl.search = ''

  const response = NextResponse.redirect(redirectUrl)
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie)
  })

  return response
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = protectedRoutePrefixes.some((route) =>
    matchesRoute(pathname, route)
  )

  if (isProtected && !user) {
    return redirectWithSupabaseCookies(request, '/login', supabaseResponse)
  }

  const isGuestRoute =
    pathname === '/' ||
    guestRoutePrefixes.some((route) => matchesRoute(pathname, route))

  if (isGuestRoute && user) {
    return redirectWithSupabaseCookies(request, '/dashboard', supabaseResponse)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
