/*
  Warnings:

  - A unique constraint covering the columns `[priority]` on the table `articles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "priority" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "articles_priority_key" ON "articles"("priority");
