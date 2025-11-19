-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('homeowner', 'tradesperson');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'parked', 'deleted');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('none', 'basic', 'premium', 'unlimited_5_year');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('Low', 'Medium', 'High');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "QuoteResponseStatus" AS ENUM ('pending', 'accepted', 'declined');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "avatar" TEXT,
    "location" TEXT,
    "trades" TEXT[],
    "rating" DECIMAL(3,2) DEFAULT 0,
    "reviews" INTEGER DEFAULT 0,
    "verified" BOOLEAN DEFAULT false,
    "credits" DECIMAL(10,2) DEFAULT 0,
    "membership_type" "MembershipType" DEFAULT 'none',
    "membership_expiry" TIMESTAMPTZ,
    "verification_status" "VerificationStatus" DEFAULT 'pending',
    "verification_data" JSONB,
    "account_status" "AccountStatus" DEFAULT 'active',
    "parked_date" TIMESTAMPTZ,
    "reactivated_date" TIMESTAMPTZ,
    "working_area" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_leads" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'Medium',
    "posted_by" UUID NOT NULL,
    "posted_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contact_details" JSONB NOT NULL,
    "purchased_by" UUID[] DEFAULT ARRAY[]::UUID[],
    "max_purchases" INTEGER NOT NULL DEFAULT 6,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 9.99,
    "interests" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "is_active" BOOLEAN DEFAULT true,
    "hired_tradesperson" UUID,
    "dismissed_by" UUID[] DEFAULT ARRAY[]::UUID[],
    "cancelled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" UUID NOT NULL,
    "homeowner_id" UUID NOT NULL,
    "homeowner_name" TEXT NOT NULL,
    "project_title" TEXT NOT NULL,
    "project_description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'Medium',
    "contact_details" JSONB NOT NULL,
    "responses" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "max_responses" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "tradesperson_id" UUID NOT NULL,
    "homeowner_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "sender_name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "job_title" TEXT NOT NULL,
    "homeowner_id" UUID NOT NULL,
    "tradesperson_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_type_idx" ON "users"("type");

-- CreateIndex
CREATE INDEX "users_location_idx" ON "users"("location");

-- CreateIndex
CREATE INDEX "users_account_status_idx" ON "users"("account_status");

-- CreateIndex
CREATE INDEX "users_verification_status_idx" ON "users"("verification_status");

-- CreateIndex
CREATE INDEX "job_leads_posted_by_idx" ON "job_leads"("posted_by");

-- CreateIndex
CREATE INDEX "job_leads_category_idx" ON "job_leads"("category");

-- CreateIndex
CREATE INDEX "job_leads_location_idx" ON "job_leads"("location");

-- CreateIndex
CREATE INDEX "job_leads_urgency_idx" ON "job_leads"("urgency");

-- CreateIndex
CREATE INDEX "job_leads_posted_date_idx" ON "job_leads"("posted_date");

-- CreateIndex
CREATE INDEX "quote_requests_homeowner_id_idx" ON "quote_requests"("homeowner_id");

-- CreateIndex
CREATE INDEX "quote_requests_category_idx" ON "quote_requests"("category");

-- CreateIndex
CREATE INDEX "quote_requests_location_idx" ON "quote_requests"("location");

-- CreateIndex
CREATE INDEX "quote_requests_urgency_idx" ON "quote_requests"("urgency");

-- CreateIndex
CREATE INDEX "quote_requests_created_at_idx" ON "quote_requests"("created_at");

-- CreateIndex
CREATE INDEX "reviews_tradesperson_id_idx" ON "reviews"("tradesperson_id");

-- CreateIndex
CREATE INDEX "reviews_homeowner_id_idx" ON "reviews"("homeowner_id");

-- CreateIndex
CREATE INDEX "reviews_job_id_idx" ON "reviews"("job_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_timestamp_idx" ON "messages"("timestamp");

-- CreateIndex
CREATE INDEX "conversations_homeowner_id_idx" ON "conversations"("homeowner_id");

-- CreateIndex
CREATE INDEX "conversations_tradesperson_id_idx" ON "conversations"("tradesperson_id");

-- CreateIndex
CREATE INDEX "conversations_job_id_idx" ON "conversations"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_job_id_homeowner_id_tradesperson_id_key" ON "conversations"("job_id", "homeowner_id", "tradesperson_id");

-- AddForeignKey
ALTER TABLE "job_leads" ADD CONSTRAINT "job_leads_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_homeowner_id_fkey" FOREIGN KEY ("homeowner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tradesperson_id_fkey" FOREIGN KEY ("tradesperson_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_homeowner_id_fkey" FOREIGN KEY ("homeowner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_homeowner_id_fkey" FOREIGN KEY ("homeowner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tradesperson_id_fkey" FOREIGN KEY ("tradesperson_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
