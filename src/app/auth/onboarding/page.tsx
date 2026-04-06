import { OnboardingForm } from '@/components/auth/onboarding-form';

export default function OnboardingPage() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-primary">추가 정보 입력</h1>
        <p className="text-muted">
          tilea 서비스 이용을 위해 아래 정보를 입력해주세요.
        </p>
      </div>

      <OnboardingForm />
    </div>
  );
}
