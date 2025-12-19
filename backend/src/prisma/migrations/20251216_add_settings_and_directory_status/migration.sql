-- CreateEnum
CREATE TYPE "DirectoryStatus" AS ENUM ('active', 'paused', 'suspended', 'deleted');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "directory_status" "DirectoryStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_key_idx" ON "settings"("key");

-- Insert default settings
INSERT INTO "settings" ("id", "key", "value", "created_at", "updated_at") VALUES
    (gen_random_uuid(), 'default_lead_price', '9.99', NOW(), NOW()),
    (gen_random_uuid(), 'max_lead_purchases', '6', NOW(), NOW()),
    (gen_random_uuid(), 'directory_price', '0.99', NOW(), NOW()),
    (gen_random_uuid(), 'boost_plan_prices', '{"1_week_boost":{"name":"1 Week Boost","price":19.99,"duration":7},"1_month_boost":{"name":"1 Month Boost","price":49.99,"duration":30},"3_month_boost":{"name":"3 Month Boost","price":99.99,"duration":90},"5_year_unlimited":{"name":"5 Year Unlimited Leads","price":995.00,"duration":1825}}', NOW(), NOW()),
    (gen_random_uuid(), 'social_media_links', '{"facebook":"","instagram":"","twitter":"","linkedin":""}', NOW(), NOW());
