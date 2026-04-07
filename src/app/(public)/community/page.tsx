export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const BOARDS = [
  { slug: 'free', name: '자유게시판', desc: '자유로운 소통 공간', emoji: '💬' },
  { slug: 'tech', name: '기술/노하우', desc: '목공 기술과 팁 공유', emoji: '🔧' },
  { slug: 'qna', name: '질문/답변', desc: '궁금한 것을 물어보세요', emoji: '❓' },
  { slug: 'gallery', name: '작품갤러리', desc: '내 작품을 자랑하세요', emoji: '🖼' },
  { slug: 'jobs', name: '구인/구직', desc: '일자리 정보', emoji: '💼' },
  { slug: 'promo', name: '업체홍보', desc: '우리 공방을 알려보세요', emoji: '📢' },
  { slug: 'notice', name: '공지사항', desc: '서비스 공지', emoji: '📌' },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">커뮤니티</h1>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {BOARDS.map((b) => (
          <Link key={b.slug} href={`/community/${b.slug}`}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <span className="mb-2 block text-2xl">{b.emoji}</span>
                <h2 className="mb-1 text-lg font-semibold text-foreground">{b.name}</h2>
                <p className="text-sm text-muted">{b.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
