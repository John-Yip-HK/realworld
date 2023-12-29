/*
  Warnings:

  - Made the column `description` on table `articles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `body` on table `articles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `articles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `articles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `favorited` on table `articles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `favoritesCount` on table `articles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `articles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "articles" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "body" SET NOT NULL,
ALTER COLUMN "tagList" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "favorited" SET NOT NULL,
ALTER COLUMN "favoritesCount" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;
