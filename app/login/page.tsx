import Link from 'next/link'
import { logIn } from '@/app/auth/actions'
import { AuthForm } from '@/components/auth-form'
import { AuthShell } from '@/components/AuthShell'

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Learner access"
      title="Log in"
      description="Continue your agent engineering course from the cockpit."
    >
      <AuthForm
        action={logIn}
        buttonLabel="Log in"
        footerText="New here?"
        footerHref="/signup"
        footerLabel="Create an account"
      />

      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
          Forgot your password?
        </Link>
      </div>
    </AuthShell>
  )
}
