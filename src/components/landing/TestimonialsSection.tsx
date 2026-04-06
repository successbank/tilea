const testimonials = [
  {
    quote: 'TILEA의 스마트 재단 계산기 덕분에 버려지는 합판이 20% 가까이 줄었습니다. 목수에게 시간은 곧 돈인데, 설계 시간을 획기적으로 단축시켜줬어요.',
    name: '박준혁 소장',
    company: '우드크래프트 대표',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEMtG6jdV_rRu_K6hkA80OITbUF10GSSJ6dN7rnMt7WEbdSwC-O-PjwSLI5TQ1-XA-izuj39jDR3iqSkFOT0cTKYq2Zx--rFKfgdsSLq2757-LvchFasENX-a7FfWcRtwq17RaKWynSzZHj1cBDNZDVTTiou5SVNsiPTScTtAre7m51K24DQ1TRL96mld3b8nWeeuajkUYLwH4-LAFmH7C5j-SnBLljVpZraL95AyltmBLmG8yKVWZF8zH_MkKzr7qLYnSbKT7tNCm',
  },
  {
    quote: '경매 시스템을 통해 좋은 프로젝트들을 안정적으로 수주하고 있습니다. 고객과의 소통 창구도 일원화되어 업무 스트레스가 훨씬 줄어들었네요.',
    name: '이서연 실장',
    company: '어반우드 인테리어',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo8UVdyHUGzz9ZP6ShYQ9D_b9uaGWLxhXlMUiQ-EVVxXM4kPOlrQhQupoE3YQCRet-YsleLjb6krIXWIzTIiMjynDsnAb58YmE7G62KQiHavi7xeRVjHwvln7c9gjnKhgw12kBVyXEPWKSj8OoJvTypDQpOoWyoSwZmW51r8xLjb2YmUxnZA72npPHNTThSciQUedVL4IlSAUOnGEdBbyYDyWoskSoopnM9puySUMXIKHJ74j0pmBGNb1xQDgwIDa57VBj4QSKP8nn',
  },
  {
    quote: '마켓에서 자재 시세를 실시간으로 확인하고 바로 주문할 수 있어 정말 편리합니다. 특히 소량 구매도 가능한 입점 업체들이 많아 만족스럽습니다.',
    name: '정영식 명장',
    company: '정가구 목공소',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABcJUOvDIGldTgKLD-dLIvU41wMiN5hh69I43PCQD7BfHxtAMaj28su4ZZwHUyax2cwA4OHmiZF3nBAYdLUd3373yRDDlmEIPzNEfIzVaHtK1vLnzLMyAlhjALsnxbr_FV2KFlQXqzpMnW_x0XGKptTzM9atGdHsz2r3RK4T0TKkL3NfsYkBCW_sThVxyZV6EcscD6BK5BdPm26bBZjvWlTX7a2Zef44odCJ2cvTbXaae1IEXinJgDGC1Yu3Gv7mwG_b_6PL16Mic8',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-surface-alt py-24 px-6">
      <div className="max-w-[1200px] mx-auto grid tablet:grid-cols-3 gap-12">
        {testimonials.map((t) => (
          <div key={t.name} className="relative pt-12">
            <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-0 left-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              format_quote
            </span>
            <p className="text-foreground italic leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-3">
              <img alt={t.name} className="w-10 h-10 rounded-full object-cover" src={t.img} />
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-[10px] text-muted">{t.company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
