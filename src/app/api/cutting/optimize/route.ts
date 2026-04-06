import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { guillotineOptimize } from '@/lib/cutting/guillotine';
import { ffdOptimize } from '@/lib/cutting/ffd';
import { optimizeSchema, linearOptimizeSchema } from '@/lib/validations/cutting';
import { redis } from '@/lib/redis';

const FREE_MONTHLY_LIMIT = 5;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // Redis usage limit check
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageKey = `cutting_usage:${session.user.id}:${monthKey}`;
    const usage = await redis.get(usageKey);
    const currentUsage = usage ? parseInt(usage) : 0;

    if (currentUsage >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          error: '무료 플랜 월 사용 횟수를 초과했습니다 (5회/월)',
          usage: currentUsage,
          limit: FREE_MONTHLY_LIMIT,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type } = body;

    if (type === '1d') {
      const parsed = linearOptimizeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { stockLength, parts, kerf, stockPrice } = parsed.data;
      const result = ffdOptimize(stockLength, parts, kerf, stockPrice ?? undefined);

      await redis.incr(usageKey);
      await redis.expire(usageKey, 60 * 60 * 24 * 31);

      return NextResponse.json({ ...result, usage: currentUsage + 1, limit: FREE_MONTHLY_LIMIT });
    }

    // Default: 2D
    const parsed = optimizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sheetWidth, sheetHeight, parts, kerf, sheetPrice } = parsed.data;
    const result = guillotineOptimize(
      sheetWidth,
      sheetHeight,
      parts,
      kerf,
      sheetPrice ?? undefined
    );

    await redis.incr(usageKey);
    await redis.expire(usageKey, 60 * 60 * 24 * 31);

    return NextResponse.json({ ...result, usage: currentUsage + 1, limit: FREE_MONTHLY_LIMIT });
  } catch (error) {
    console.error('Cutting optimize error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
