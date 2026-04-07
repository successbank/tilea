export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({ where: { parentId: null }, include: { children: { include: { children: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(categories);
  } catch (error) { console.error(error); return NextResponse.json({ error: '서버 오류' }, { status: 500 }); }
}
