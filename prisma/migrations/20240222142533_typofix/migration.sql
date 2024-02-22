/*
  Warnings:

  - You are about to drop the column `group_identifer` on the `Groups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[group_identifier]` on the table `Groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_identifier` to the `Groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Groups_group_identifer_key";

-- AlterTable
ALTER TABLE "Groups" DROP COLUMN "group_identifer",
ADD COLUMN     "group_identifier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Groups_group_identifier_key" ON "Groups"("group_identifier");
