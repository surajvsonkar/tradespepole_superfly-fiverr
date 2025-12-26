/*
  Warnings:

  - A unique constraint covering the columns `[quote_id,homeowner_id,tradesperson_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "quote_id" UUID,
ALTER COLUMN "job_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "conversations_quote_id_idx" ON "conversations"("quote_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_quote_id_homeowner_id_tradesperson_id_key" ON "conversations"("quote_id", "homeowner_id", "tradesperson_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
