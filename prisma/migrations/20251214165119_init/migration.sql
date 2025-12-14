/*
  Warnings:

  - You are about to drop the column `type` on the `sections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `sections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `sections` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "sections_type_key";

-- AlterTable
ALTER TABLE "sections" DROP COLUMN "type",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SectionType";

-- CreateIndex
CREATE UNIQUE INDEX "sections_name_key" ON "sections"("name");
