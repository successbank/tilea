import Link from 'next/link';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">tilea</h1>
        <p className="text-muted">목공·목재 산업 종합 플랫폼</p>
      </div>

      <SocialLoginButtons />

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted">또는</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <LoginForm />

      <div className="mt-6 space-y-2 text-center text-sm">
        <Link href="/auth/forgot-password" className="text-muted hover:text-primary">
          비밀번호를 잊으셨나요?
        </Link>
        <p className="text-muted">
          아직 회원이 아니신가요?{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
