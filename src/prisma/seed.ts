import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tilea.kr' },
    update: {},
    create: {
      email: 'admin@tilea.kr',
      name: '관리자',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.id);
  console.log('Seeding complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
