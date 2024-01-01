/*
  Warnings:

  - You are about to drop the column `favorited` on the `articles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "articles" DROP COLUMN "favorited",
ADD COLUMN     "favoritedUserIdList" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
