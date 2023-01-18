/*
  Warnings:

  - Made the column `isArchived` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isFinished` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "isArchived" SET NOT NULL,
ALTER COLUMN "isFinished" SET NOT NULL;
