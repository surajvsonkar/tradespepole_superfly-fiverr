-- AlterTable
ALTER TABLE "users" ADD COLUMN     "boost_expires_at" TIMESTAMPTZ,
ADD COLUMN     "is_suspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reference_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_views" (
    "id" UUID NOT NULL,
    "tradesperson_id" UUID NOT NULL,
    "viewer_id" UUID,
    "ip_address" TEXT,
    "viewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boost_analytics" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "purchases" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "dropOffs" INTEGER NOT NULL DEFAULT 0,
    "weekly_purchases" INTEGER NOT NULL DEFAULT 0,
    "monthly_purchases" INTEGER NOT NULL DEFAULT 0,
    "quarterly_purchases" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "boost_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "profile_views_tradesperson_id_idx" ON "profile_views"("tradesperson_id");

-- CreateIndex
CREATE INDEX "profile_views_viewed_at_idx" ON "profile_views"("viewed_at");

-- CreateIndex
CREATE INDEX "boost_analytics_date_idx" ON "boost_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "boost_analytics_date_key" ON "boost_analytics"("date");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_tradesperson_id_fkey" FOREIGN KEY ("tradesperson_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
