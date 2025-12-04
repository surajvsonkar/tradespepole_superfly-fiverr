/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebook_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[linkedin_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_expires" TIMESTAMPTZ,
ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedin_id" TEXT,
ADD COLUMN     "password_reset_expires" TIMESTAMPTZ,
ADD COLUMN     "password_reset_token" TEXT,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_id_key" ON "users"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_linkedin_id_key" ON "users"("linkedin_id");
