const features = [
  { icon: 'precision_manufacturing', title: '스마트 관리', desc: '클라우드 기반의 프로젝트 관리와 재고 추적 시스템으로 누수 없는 공정을 관리하세요.' },
  { icon: 'gavel', title: '역경매', desc: '전국 단위의 목공 프로젝트 경매 시스템. 최고의 실력을 가치로 인정받으세요.' },
  { icon: 'groups', title: '커뮤니티', desc: '전문 목수들과의 지식 공유와 기술 교류. 함께 성장하는 목공인들의 광장.' },
  { icon: 'storefront', title: '마켓', desc: '엄선된 목재와 전동 공구, 하드웨어를 최저가로 직거래하는 목공 전문 마켓.' },
  { icon: 'newspaper', title: '뉴스', desc: '글로벌 목공 트렌드부터 새로운 자재 정보까지, 가장 빠른 산업 뉴스를 제공합니다.' },
  { icon: 'school', title: '온라인 클래스', desc: '기초부터 심화 과정까지, 거장들의 노하우를 집에서 배우는 고해상도 클래스.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-surface-alt py-24 px-6">
      <div className="max-w-[1200px] mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold font-headline mb-4">정밀 서비스</h2>
        <p className="text-muted max-w-2xl mx-auto">워크숍의 효율을 극대화하는 6가지 핵심 디지털 솔루션</p>
      </div>
      <div className="grid tablet:grid-cols-2 desktop:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
        {features.map((f) => (
          <div key={f.title} className="bg-white p-8 rounded-xl hover:shadow-lg transition-shadow">
            <span className="material-symbols-outlined text-primary text-4xl block mb-6">{f.icon}</span>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
