/*
  Warnings:

  - A unique constraint covering the columns `[group_identifer]` on the table `Groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_identifer` to the `Groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "group_identifer" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Groups_group_identifer_key" ON "Groups"("group_identifer");
