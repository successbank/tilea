import Link from 'next/link';

const auctions = [
  {
    title: '맞춤 가구 제작',
    desc: '강남구 오피스텔 서재용 월넛 책장 및 책상 세트 제작 건',
    price: '₩ 4,500,000 ~',
    dday: 'D-2',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkL8vX2B4u8Lts7z1Qk5inkuBg_ExQSIjLbfHaezK-OYFLaKFfIoGIa2rkc_d_avgAan6GoGcMRg0dUz4dZhuXbm60S5QNWZh9zTblOwQOl8r7cFDPaCSpuLHQUYJEhKqYQFZT0Vs6Dpngfz1jPo7zF77WsFqRXAKu1vDF_kQrsmbYoXZ6MJwNL7n3jUDf9lDOj3EYnAGFARJ-UHHnqXLdhLL8LeAkfI6pJVUH6n8Y1fPnsS5BwCsCZOgTXqr1VON7tg8clnOySZyA',
  },
  {
    title: '인테리어 목공',
    desc: '한남동 상업 공간 카페 인테리어 벽면 템바보드 시공',
    price: '₩ 12,000,000 ~',
    dday: 'D-5',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS4XMVqGDMAinwH00fgWnCpivSP305sdXCEpqr84Q6gIFC7K-x7YV-5nPvnNdpkCcrC5QsZGNBaMzw8znNvuCWyiH_iDtSsZf9FO6J0q9GIiRq0oMF81uMxLeirpLai51t_gmB-ILsOcyZJoh6uh5Itxb_kn9oTfrY5D5eK38PYzmjv_K3sBWJVXXMM7Jze1tVf8Tw8rgzvV0w_atjQtMtFf4KTPv9bfzN5xCeJKVEFKXQumMHqb440k46wnXn2talTQ_VbpFNse7_',
  },
  {
    title: '재단 가공 서비스',
    desc: 'CNC 정밀 재단 대량 의뢰 - 자작나무 합판 18T 100매',
    price: '₩ 850,000 ~',
    dday: 'D-1',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk3nAyuBlTasYa3uXEHJbTXUarcGHiyrc9yxRytVDumbjscAOIzorOYuBrXEqzX-pZvHxczVZ8UrT5xarJYlIxGH5DFmNT69y8yvZWsap4rTm3c3Cy9P56RO5J7SC1PbqJvaKraGwxyAri9YkVsQAoju1nWcRbMsxlOfhehrKW0d2ZeI_5T6NIl4enbTQQ7-8bftqurK_t2if_OB0mZQaac9hDzZM2rBY90GaoIc0Q8-q7T6UQAkboTSVPBCBylCzHMj5mYlVKSYTO',
  },
  {
    title: '보수/수리',
    desc: '앤티크 다이닝 테이블 상판 샌딩 및 오일 마감 리뉴얼',
    price: '₩ 450,000 ~',
    dday: 'D-3',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ7HFXGixNfMm2_T3_C8Y2avAkYVb0VT9O-BSk7ilIqyVvM9iWXvtAJzVnMN7dmWSN0c77QoVYcDhw_hU7Rz2tx3wO8Jln2cjKFIkaYnhyxzWXMMZ1WQa_JTXjPK1Ln9rypGs74nMw6JydrutcuQJdsdUaSZ5Xq5qPtSHGt1x75si956Xx3-_ehUQNlpHtMgSJ6hhS5IhpoGkCyMVX3YGNF1V2VP_-GgdiyV6RUgX5VgTml-482XAs2l0RD24MNTUDEcRHqsExkl8r',
  },
];

export default function AuctionSection() {
  return (
    <section className="py-24 px-6 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-bold font-headline mb-2">진행 중인 역경매</h2>
          <p className="text-muted">현재 입찰 진행 중인 전문 목공 프로젝트</p>
        </div>
        <Link href="/auction" className="text-primary font-bold flex items-center gap-1 hover:underline">
          전체보기 <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </div>
      <div className="grid tablet:grid-cols-2 desktop:grid-cols-4 gap-6">
        {auctions.map((a) => (
          <div
            key={a.title}
            className="bg-white border border-border/30 rounded-xl overflow-hidden hover:-translate-y-1 transition-transform group"
          >
            <div className="relative h-40">
              <img alt={a.title} className="w-full h-full object-cover" src={a.img} />
              <div className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded">
                {a.dday}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold mb-2 group-hover:text-primary">{a.title}</h3>
              <p className="text-xs text-muted mb-4 line-clamp-2">{a.desc}</p>
              <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                <span className="text-xs font-medium text-muted">입찰 참여</span>
                <span className="text-sm font-bold text-primary">{a.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
