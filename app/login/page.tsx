import Link from 'next/link'
import { logIn } from '@/app/auth/actions'
import { AuthForm } from '@/components/auth-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <Link href="/" className="mb-10 text-sm font-medium text-zinc-500 hover:text-zinc-900">
          AI Agents Course
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Continue your agent engineering course.
            </p>
          </div>

          <AuthForm
            action={logIn}
            buttonLabel="Log in"
            footerText="New here?"
            footerHref="/signup"
            footerLabel="Create an account"
          />

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm text-zinc-500 hover:text-zinc-900">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
