/*
  Warnings:

  - Added the required column `image` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" VARCHAR(128),
ADD COLUMN     "image" TEXT NOT NULL;