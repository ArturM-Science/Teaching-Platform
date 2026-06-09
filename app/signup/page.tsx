import { signUp } from '@/app/auth/actions'
import { AuthShell } from '@/components/AuthShell'
import { SignupForm } from '@/components/signup-form'

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Start the path"
      title="Create your account"
      description="Enter the self-paced course and start building production-minded agent systems."
    >
      <SignupForm action={signUp} />
    </AuthShell>
  )
}
