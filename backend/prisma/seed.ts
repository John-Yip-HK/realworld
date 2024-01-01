import { PrismaClient } from '@prisma/client';

import { hashPassword } from '../utils/passwordUtils';
import { DEFAULT_IMAGE_URL } from '../constants/users';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  try {
    await prisma.user.upsert({
      where: { email: '123@123.io' },
      update: {},
      create: {
        email: '123@123.io',
        username: '123123',
        hashedPassword: await hashPassword('123123'),
        image: DEFAULT_IMAGE_URL,
        articles: {
          create: [
            {
              slug: 'my-article-1',
              title: 'My Article',
              description: 'This is my article',
              body: 'Lorem ipsum dolor sit amet.',
              tagList: generateRandomTags(),
            },
            {
              slug: 'another-article-1',
              title: 'Another Article',
              description: 'This is another article',
              body: 'Lorem ipsum dolor sit amet something different.',
              tagList: generateRandomTags(),
            },
            {
              slug: 'random-article-1',
              title: 'Random Article',
              description: 'This is a random article',
              body: 'Lorem ipsum dolor sit amet random.',
              tagList: generateRandomTags(),
            }
          ],
        },
      },
    });
    
    await prisma.user.upsert({
      where: { email: '123@123.com' },
      update: {},
      create: {
        email: '123@123.com',
        username: '123-123',
        hashedPassword: await hashPassword('123-123'),
        image: DEFAULT_IMAGE_URL,
        articles: {
          create: [
            {
              slug: 'random-article-2-2',
              title: 'Random Article 2',
              description: 'This is another random article',
              body: 'Lorem ipsum dolor sit amet random 2.',
              tagList: generateRandomTags(),
            },
            {
              slug: 'random-article-3-2',
              title: 'Random Article 3',
              description: 'This is yet another random article',
              body: 'Lorem ipsum dolor sit amet random 3.',
              tagList: generateRandomTags(),
            },
            {
              slug: 'random-article-4-2',
              title: 'Random Article 4',
              description: 'This is a different random article',
              body: 'Lorem ipsum dolor sit amet random 4.',
              tagList: generateRandomTags(),
            }
          ],
        },
      },
    });

    console.log('Seeding finished.');
  } catch (error) {
    console.log('Error occured');
    console.error(error);
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Disconnected prisma client.');
    } catch (error) {
      console.log('Problem occured when disconnecting prisma client.');

      console.error(error);
      process.exit(1);
    }
  }
}

function generateRandomTags() {
  const tags = ['technology', 'programming', 'web', 'mobile', 'design', 'data', 'security'];
  const tagList = new Set<string>();
  const numTags = Math.floor(Math.random() * 4) + 1; // Random number of tags between 1 and 4

  while (tagList.size < numTags) {
    const randomIndex = Math.floor(Math.random() * tags.length);
    tagList.add(tags[randomIndex]);
  }

  return Array.from(tagList);
}

await main();
