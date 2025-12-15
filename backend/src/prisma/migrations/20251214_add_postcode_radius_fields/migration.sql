-- AlterTable: Add postcode field to job_leads
ALTER TABLE "job_leads" ADD COLUMN IF NOT EXISTS "postcode" TEXT DEFAULT 'W1K 3DE';

-- AlterTable: Add job_radius and work_postcode fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_radius" INTEGER DEFAULT 15;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "work_postcode" TEXT DEFAULT 'W1K 3DE';

-- CreateIndex: Add index on postcode for faster lookups
CREATE INDEX IF NOT EXISTS "job_leads_postcode_idx" ON "job_leads"("postcode");
