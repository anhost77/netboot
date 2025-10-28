/*
  Warnings:

  - A unique constraint covering the columns `[api_key]` on the table `user_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "api_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_api_key_key" ON "user_settings"("api_key");
