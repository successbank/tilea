const classes = [
  {
    level: '중급',
    title: '전통 짜맞춤 가구 제작의 기초',
    desc: '도부테일, 장부 맞춤 등 결구법의 모든 것',
    instructor: '강사: 김목수 명장 \u2022 12 Modules',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqfr0bFRSWpAXxai6seMAo12Fa3ZGYP6qYrzoJ8kZXTnBkQkbZXKp1j4cPiCsgIZIuWI6pIfFd4zBakPKve0s-bEhGWtkYlZ1pJF7YhqTQyKKji8nwvwDKKuGdf3WlAWlhGBGd87JjAR9nxQZq9MTVDV9IAHXZHZaFeSu6fVPhWGo9NflVrksBFMrVHVg78d17UI80eVOEoi9fADbobPCWUB-5wmRRNSzHsa0usdt_Y9FikFBQ65zbpxBeX-hEUAj4VOQqUgSHytBb',
  },
  {
    level: '중급',
    title: '전문 목수를 위한 완벽 마감 가이드',
    desc: '오일 마감부터 락커, 우레탄 도장까지',
    instructor: '강사: 최아티스트 \u2022 8 Modules',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA32bxEL8yPipr21uF4eEoYU9bJvkLmWzl6EazclQi5rIB4LWU0qVFTdy6dc5Lcro4e0XUcpbk_CXI_aA4M3vQ5PKGitxSQDnDvT9I_vMh_nrYZWlLKe18X9WSaEHitDPeUSrIcV5jwwyAm5HPlyIvyW7iNBsdX6e1N081ygThEifMN_cbjl5rOUDemMSOUq_ZSCronfe-T_i5VLWXkLTZ-rndWqOA8SF8z1b0wtSt1XXzNlXylHb9RUUtH0v5u02xHb9ggirXGfhEs',
  },
];

const news = [
  {
    tag: 'Market Trend',
    date: '2024.03.15',
    title: '2024년 2분기 글로벌 활엽수 가격 상승 전망',
    desc: '북미 지역 목재 수급 불균형으로 인한 가격 변동성 증대...',
  },
  {
    tag: 'Innovation',
    date: '2024.03.12',
    title: '독일 신형 5축 CNC 조각기 국내 출시 예정',
    desc: '소규모 공방을 위한 콤팩트형 디자인과 향상된 정밀도 탑재...',
  },
  {
    tag: 'Policy',
    date: '2024.03.10',
    title: '탄소중립 시대, 국산 목재 이용 확대 법안 통과',
    desc: '친환경 건축 자재로서 목재 사용에 대한 정부 보조금 지원...',
  },
];

export default function ClassNewsSection() {
  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto">
      <div className="grid desktop:grid-cols-2 gap-16">
        {/* Classes */}
        <div>
          <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">play_circle</span> 마스터 온라인 클래스
          </h2>
          <div className="space-y-6">
            {classes.map((c) => (
              <div key={c.title} className="flex gap-6 group cursor-pointer">
                <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-xl">
                  <img
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    src={c.img}
                  />
                </div>
                <div className="flex-grow py-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">{c.level}</span>
                  <h4 className="font-bold text-lg mt-2 group-hover:text-primary">{c.title}</h4>
                  <p className="text-sm text-muted line-clamp-1 mt-1">{c.desc}</p>
                  <p className="text-xs text-muted mt-3">{c.instructor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News */}
        <div>
          <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">feed</span> 업계 뉴스
          </h2>
          <div className="space-y-4">
            {news.map((n) => (
              <div key={n.title} className="p-5 bg-surface-alt rounded-xl relative">
                <span className="absolute top-5 right-5 text-[10px] font-bold text-muted">{n.date}</span>
                <span className="text-[10px] font-black tracking-widest text-primary uppercase">{n.tag}</span>
                <h4 className="font-bold mt-2 hover:underline cursor-pointer">{n.title}</h4>
                <p className="text-xs text-muted mt-2">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
