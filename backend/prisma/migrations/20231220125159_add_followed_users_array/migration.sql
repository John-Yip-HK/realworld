-- AlterTable
ALTER TABLE "users" ADD COLUMN     "followed_users" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
