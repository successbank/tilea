import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    const { redis } = await import('@/lib/redis');
    const pong = await redis.ping();
    checks.redis = pong === 'PONG' ? 'ok' : 'error';
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'tilea.kr',
      version: '1.0.0',
      checks,
      uptime: process.uptime(),
    },
    { status: allOk ? 200 : 503 }
  );
}
