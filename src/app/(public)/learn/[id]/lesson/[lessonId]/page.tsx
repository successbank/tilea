export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props { params: { id: string; lessonId: string } }

export default async function LessonPlayerPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const enrollment = await prisma.enrollment.findUnique({ where: { courseId_userId: { courseId: params.id, userId: session.user.id } } });
  if (!enrollment) redirect(`/learn/${params.id}`);

  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId }, include: { section: { include: { course: { select: { title: true } }, lessons: { orderBy: { sortOrder: 'asc' }, select: { id: true, title: true, sortOrder: true } } } } } });
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="mb-2 text-sm text-muted">{lesson.section.course.title} &gt; {lesson.section.title}</p>
      <h1 className="mb-6 text-2xl font-bold text-foreground">{lesson.title}</h1>

      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-3">
        <div className="desktop:col-span-2">
          {lesson.videoUrl ? (
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <video controls className="h-full w-full" src={lesson.videoUrl} />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-900 text-white">
              <p>영상이 준비 중입니다</p>
            </div>
          )}

          {lesson.quiz && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h2 className="mb-4 font-semibold text-foreground">퀴즈</h2>
                {(lesson.quiz as Array<{ question: string; options: string[] }>).map((q, i) => (
                  <div key={i} className="mb-4">
                    <p className="mb-2 font-medium">{i + 1}. {q.question}</p>
                    <div className="space-y-1">{q.options.map((opt, j) => (
                      <label key={j} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm hover:bg-gray-50">
                        <input type="radio" name={`q${i}`} /> {opt}
                      </label>
                    ))}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold text-foreground">레슨 목록</h3>
              <div className="space-y-1">{lesson.section.lessons.map((l) => (
                <a key={l.id} href={`/learn/${params.id}/lesson/${l.id}`} className={`block rounded-lg px-3 py-2 text-sm transition-colors ${l.id === lesson.id ? 'bg-primary/10 font-medium text-primary' : 'text-muted hover:bg-gray-50'}`}>{l.title}</a>
              ))}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
