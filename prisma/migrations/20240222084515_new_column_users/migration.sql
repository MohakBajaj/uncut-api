/*
  Warnings:

  - Added the required column `group_affiliation` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "group_affiliation" TEXT NOT NULL;
