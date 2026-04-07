export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">회원가입</h1>
        <p className="text-muted">tilea에 오신 것을 환영합니다</p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        이미 회원이신가요?{' '}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
