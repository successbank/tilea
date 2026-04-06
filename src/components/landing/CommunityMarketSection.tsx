const posts = [
  { rank: '01', title: '겨울철 원목 수축 팽창 관리 꿀팁', meta: '관리법/노하우 \u2022 34 comments' },
  { rank: '02', title: '테이블쏘 안전 사고 방지를 위한 5가지 체크리스트', meta: '안전/교육 \u2022 56 comments' },
  { rank: '03', title: '입문자를 위한 필수 수공구 브랜드 추천', meta: '장비리뷰 \u2022 28 comments' },
  { rank: '04', title: '자작나무 합판 가격 변동 추이 공유', meta: '시장정보 \u2022 42 comments' },
];

const products = [
  {
    category: '전동공구',
    title: '18V Brushless Combo Kit',
    price: '₩ 348,000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXH09kRKAQXtN5j9b6clgT9j7riVdJXs4txLok8iB0ZBlR3SXRD7BECUFLna8BjCMz6_gPy4DESM9y7FFK3F6ryM9hroudHZGbt1TaQznd35MZiqXEqX12eU7-NVwJvEl1WZsT3cLKTQ1zf5-22h79RUHqRROx9vpKmxAg_4oxKoCmcwDLNmvBvv6eesoCBj5mZvviySszpHrwjgSzoTSN2lzfG-CVXzXUsIpaXCyX4a8YTCUqDzbEuFWDPKpNor5HTQ3qCzCm10jr',
  },
  {
    category: '합판',
    title: 'Birch Plywood 18T (E0)',
    price: '₩ 72,000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxPvv91EFTgy26GCGTNpQ-aWEUtQf2pn-SdJcr_VDukowpZeKTcGomJ8Gv8U_rJcfZukyF-93mSuvkJr3Xqw4WBYo053HqoOldiiM33cRxfMXtoJVLAAYW6CF3lZYMwOjK224-ScfwckuwesEuei47rjtIYWz5sLwN29nMXu6Ce_xpo0Cp1qLAQy8197BvPe7O4e2Vgd1ogJ597rjux31CIebQybE2Uz3GcBP0VNIPpCK6CsnUeJFuEnfO9fEICO6awiOpjBh5cmF1',
  },
  {
    category: '하드웨어',
    title: 'Solid Brass Pull Handle',
    price: '₩ 12,500',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7QfPRSVBRwCLbJnuzLS_gMQI-et2IEIr6q-NkW1ysDE0f4L1PBUO1u5dsC2VIa2ZQst_BIQC92cljPPRVc7prX4vzu69SgEyBnCdRm8NnRqRoYXZ9mzNb8ufzhCx4nPBQnpfQwVmpLQdSUIJv9TQLDs2JHV2vUed3qGD8RH8eKH9KtNvr6GJ_r808WwEhmNzP8-8P-_mOx0WAmfuupyDYYDlli39-1aGC_B9rGohpioaXzKdkFTukBQWj9B11l_kPivPep6Jo4PnB',
  },
  {
    category: '마감재',
    title: 'Natural Hardwax Oil 1L',
    price: '₩ 54,000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD69GxI4dREMQne7TMOsc6B9uyy9K4lHYVFtBKUebKmXqy7_0JUfoBVBh-4v3BXW8I_Xz36osK_i6ON1y7L24pAbcL85qtxkET1hy7UUCp_XSNAHhBh8mZyCC-jfhxuUfGc0K9JUUv3_GAawZvo6lr1jzR3VxXeC8q74LatuVemYOfepbARn6qlIy0BzlM5PyMPebCIn3zaFb_77n1AdurvZqXmwx1LhemvMGM0g-ujTMeFBoC29SLF5vgGwusr6XZCCoD34Q1-FGE1',
  },
];

export default function CommunityMarketSection() {
  return (
    <section className="bg-surface-alt py-24 px-6">
      <div className="max-w-[1200px] mx-auto grid desktop:grid-cols-2 gap-16">
        {/* Community */}
        <div>
          <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">forum</span> 인기 게시글
          </h2>
          <div className="space-y-4">
            {posts.map((p) => (
              <div
                key={p.rank}
                className="bg-white p-6 rounded-xl flex gap-6 items-center border border-transparent hover:border-border/50 cursor-pointer"
              >
                <span className="text-2xl font-black text-stone-300">{p.rank}</span>
                <div>
                  <h4 className="font-bold mb-1">{p.title}</h4>
                  <p className="text-xs text-muted">{p.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market */}
        <div>
          <h2 className="text-2xl font-bold font-headline mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shopping_basket</span> 마켓 인기 상품
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.title} className="bg-white p-4 rounded-xl border border-border/30 group">
                <img alt={p.title} className="w-full aspect-square object-cover rounded-lg mb-3" src={p.img} />
                <p className="text-[10px] text-muted font-bold uppercase mb-1">{p.category}</p>
                <h4 className="text-sm font-bold mb-2 truncate">{p.title}</h4>
                <p className="text-primary font-bold">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
