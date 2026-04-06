export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">대시보드</h1>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
        {[
          { title: '재단 계산기', desc: 'prd3에서 구현', status: 'Phase 1' },
          { title: '견적 관리', desc: 'prd4에서 구현', status: 'Phase 1' },
          { title: '재고 관리', desc: 'prd5에서 구현', status: 'Phase 2' },
          { title: '프로젝트 관리', desc: 'prd6에서 구현', status: 'Phase 2' },
          { title: 'CRM', desc: 'prd7에서 구현', status: 'Phase 2' },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-white p-6 opacity-60"
          >
            <div className="mb-1 text-xs text-muted">{item.status}</div>
            <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
