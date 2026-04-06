import { VerifyBusinessForm } from '@/components/business/verify-business-form';

export default function VerifyBusinessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-primary">사업자 인증</h1>
          <p className="text-muted">
            사업자등록번호를 입력하여 사업자 회원으로 전환하세요.
            <br />
            인증 후 업무관리 도구를 이용할 수 있습니다.
          </p>
        </div>

        <VerifyBusinessForm />
      </div>
    </div>
  );
}
