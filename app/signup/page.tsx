import { signUp } from '@/app/auth/actions'
import { AuthForm } from '@/components/auth-form'
import { AuthShell } from '@/components/AuthShell'

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Start the path"
      title="Create your account"
      description="Enter the self-paced course and start building production-minded agent systems."
    >
      <AuthForm
        action={signUp}
        buttonLabel="Create account"
        footerText="Already have an account?"
        footerHref="/login"
        footerLabel="Log in"
      />
    </AuthShell>
  )
}
