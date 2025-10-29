-- CreateTable
CREATE TABLE "budget_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'real',
    "daily_limit" DECIMAL(10,2),
    "weekly_limit" DECIMAL(10,2),
    "monthly_limit" DECIMAL(10,2),
    "alert_threshold" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budget_settings_user_id_mode_key" ON "budget_settings"("user_id", "mode");

-- AddForeignKey
ALTER TABLE "budget_settings" ADD CONSTRAINT "budget_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
