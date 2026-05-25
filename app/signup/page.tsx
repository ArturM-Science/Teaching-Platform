import Link from 'next/link'
import { signUp } from '@/app/auth/actions'
import { AuthForm } from '@/components/auth-form'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <Link href="/" className="mb-10 text-sm font-medium text-zinc-500 hover:text-zinc-900">
          AI Agents Course
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Start the self-paced path and join live workshops when they open.
            </p>
          </div>

          <AuthForm
            action={signUp}
            buttonLabel="Create account"
            footerText="Already have an account?"
            footerHref="/login"
            footerLabel="Log in"
          />
        </div>
      </div>
    </main>
  )
}
