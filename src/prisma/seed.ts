import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPw = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tilea.kr' },
    update: {},
    create: {
      email: 'admin@tilea.kr', name: '관리자', password: adminPw,
      role: 'ADMIN', emailVerified: new Date(), onboardingCompleted: true,
      agreedTerms: true, agreedPrivacy: true,
    },
  });
  console.log(`Admin: ${admin.email} (${admin.id})`);

  const userPw = await bcrypt.hash('Test1234!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@tilea.kr' },
    update: {},
    create: {
      email: 'test@tilea.kr', name: '테스트 회원', password: userPw,
      role: 'GENERAL', emailVerified: new Date(), onboardingCompleted: true,
      agreedTerms: true, agreedPrivacy: true,
    },
  });
  console.log(`User: ${user.email}`);

  const bizPw = await bcrypt.hash('Test1234!', 12);
  const bizUser = await prisma.user.upsert({
    where: { email: 'business@tilea.kr' },
    update: {},
    create: {
      email: 'business@tilea.kr', name: '테스트 사업자', password: bizPw,
      role: 'BUSINESS', emailVerified: new Date(), onboardingCompleted: true,
      agreedTerms: true, agreedPrivacy: true,
    },
  });
  await prisma.businessProfile.upsert({
    where: { userId: bizUser.id },
    update: {},
    create: {
      userId: bizUser.id, businessNumber: '1234567890', businessName: '테스트 목공소',
      ownerName: '홍길동', businessType: '목공', shopName: '길동이네 공방',
      introduction: '20년 경력의 맞춤 가구 제작 전문 공방입니다.',
      specialty: ['가구제작', '인테리어', 'CNC가공'], address: '서울특별시 성동구',
      verificationStatus: 'APPROVED', verifiedAt: new Date(),
    },
  });
  console.log(`Business: ${bizUser.email}`);

  const categories = [
    { name: '전동공구', slug: 'power-tools', children: ['톱', '대패', '라우터', '샌더', '드릴', 'CNC'] },
    { name: '수공구', slug: 'hand-tools', children: ['끌', '대패', '톱', '클램프', '측정'] },
    { name: '목재/판재', slug: 'wood', children: ['원목', '합판/MDF', '집성목', '데크재'] },
    { name: '하드웨어/부자재', slug: 'hardware', children: ['경첩', '레일', '손잡이', '나사', '접착제', '도료'] },
    { name: '안전장비', slug: 'safety', children: ['집진기', '보안경', '보호구'] },
    { name: '소프트웨어/도서', slug: 'software', children: ['CAD/CAM', '도서'] },
  ];

  for (const cat of categories) {
    const parent = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, depth: 0 },
    });
    for (let i = 0; i < cat.children.length; i++) {
      const slug = `${cat.slug}-${i}`;
      await prisma.productCategory.upsert({
        where: { slug },
        update: {},
        create: { name: cat.children[i], slug, parentId: parent.id, depth: 1, sortOrder: i },
      });
    }
  }
  console.log('Product categories seeded');
  console.log('Seeding complete!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
