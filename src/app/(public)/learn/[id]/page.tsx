export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props { params: { id: string } }

export default async function CourseDetailPage({ params }: Props) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, include: { sections: { include: { lessons: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 } } });
  if (!course || !course.isPublished) notFound();

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-3">
        <div className="tablet:col-span-2">
          {course.coverImage && <img src={course.coverImage} alt={course.title} className="mb-6 w-full rounded-lg" />}
          <div className="mb-3 flex items-center gap-2"><Badge>{course.category}</Badge>{course.level && <Badge variant="outline">{course.level}</Badge>}</div>
          <h1 className="mb-4 text-3xl font-bold text-foreground">{course.title}</h1>
          <div className="mb-6 flex items-center gap-4 text-sm text-muted"><span>⭐ {course.averageRating.toFixed(1)} ({course.reviewCount})</span><span>{course.enrollCount}명 수강</span><span>{totalLessons}개 레슨</span></div>
          <div className="mb-8 whitespace-pre-wrap text-foreground">{course.description}</div>

          <Card>
            <CardHeader><CardTitle>커리큘럼</CardTitle></CardHeader>
            <CardContent>{course.sections.map((section, si) => (
              <div key={section.id} className="mb-4">
                <h3 className="mb-2 font-semibold text-foreground">섹션 {si + 1}: {section.title}</h3>
                <div className="space-y-1">{section.lessons.map((lesson, li) => (
                  <div key={lesson.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span>{li + 1}. {lesson.title}</span>
                    <div className="flex items-center gap-2">
                      {lesson.duration && <span className="text-xs text-muted">{Math.floor(lesson.duration / 60)}분</span>}
                      {lesson.isFree && <Badge variant="success" className="text-xs">미리보기</Badge>}
                    </div>
                  </div>
                ))}</div>
              </div>
            ))}</CardContent>
          </Card>

          {course.reviews.length > 0 && (
            <Card className="mt-6">
              <CardHeader><CardTitle>수강 후기 ({course.reviewCount})</CardTitle></CardHeader>
              <CardContent><div className="space-y-3">{course.reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-3"><p className="text-sm"><span className="font-medium">{r.user?.name}</span> <span className="text-muted">⭐ {r.rating}</span></p>{r.content && <p className="mt-1 text-sm text-muted">{r.content}</p>}</div>
              ))}</div></CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-8">
            <CardContent className="pt-6 text-center">
              <p className="mb-4 text-3xl font-bold text-primary">{course.price === 0 ? '무료' : `₩${(course.salePrice || course.price).toLocaleString()}`}</p>
              {course.salePrice && <p className="mb-2 text-sm text-muted line-through">₩{course.price.toLocaleString()}</p>}
              <form action={`/api/courses/${course.id}/enroll`} method="POST"><button type="submit" className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90">{course.price === 0 ? '무료 수강하기' : '수강 등록'}</button></form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
