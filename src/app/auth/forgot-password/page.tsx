import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">비밀번호 찾기</h1>
        <p className="text-muted">가입한 이메일로 재설정 링크를 보내드립니다</p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/auth/login" className="text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
