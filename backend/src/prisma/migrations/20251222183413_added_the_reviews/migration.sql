/*
  Warnings:

  - A unique constraint covering the columns `[stripe_customer_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'disputed');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('job_lead_purchase', 'interest_fee', 'directory_subscription', 'membership_purchase', 'credits_topup');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'cancelled', 'expired', 'past_due');

-- AlterTable
ALTER TABLE "job_leads" ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "longitude" DECIMAL(11,8);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "completed_jobs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "directory_listing_expiry" TIMESTAMPTZ,
ADD COLUMN     "has_directory_listing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hourly_rate" DECIMAL(10,2),
ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "longitude" DECIMAL(11,8),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "stripe_customer_id" TEXT;

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "stripe_payment_id" TEXT,
    "stripe_customer_id" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "refunded_amount" DECIMAL(10,2),
    "refund_reason" TEXT,
    "failure_reason" TEXT,
    "receipt_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "stripe_price_id" TEXT,
    "current_period_start" TIMESTAMPTZ,
    "current_period_end" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "trial_end" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_customers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "default_payment_method_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_id_key" ON "payments"("stripe_payment_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_stripe_payment_id_idx" ON "payments"("stripe_payment_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_type_idx" ON "payments"("type");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_type_idx" ON "subscriptions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_user_id_key" ON "stripe_customers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_stripe_customer_id_key" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "stripe_customers_user_id_idx" ON "stripe_customers"("user_id");

-- CreateIndex
CREATE INDEX "stripe_customers_stripe_customer_id_idx" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "job_leads_latitude_longitude_idx" ON "job_leads"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "users_latitude_longitude_idx" ON "users"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "users_stripe_customer_id_idx" ON "users"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
