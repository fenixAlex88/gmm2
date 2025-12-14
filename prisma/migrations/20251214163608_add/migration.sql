/*
  Warnings:

  - You are about to drop the column `name` on the `sections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type]` on the table `sections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `sections` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('Вобраз', 'Тэкст', 'Падарожжа', 'Падзея');

-- DropIndex
DROP INDEX "sections_name_key";

-- AlterTable
ALTER TABLE "sections" DROP COLUMN "name",
ADD COLUMN     "type" "SectionType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sections_type_key" ON "sections"("type");
