import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getArticles() {
  return await prisma.article.findMany({
    include: {
      user: true,
    }
  });
}
