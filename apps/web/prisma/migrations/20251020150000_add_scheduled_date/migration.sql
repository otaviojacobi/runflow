-- AlterTable
ALTER TABLE "trainings" ADD COLUMN "scheduled_date" DATE NOT NULL DEFAULT CURRENT_DATE;

-- CreateIndex
CREATE INDEX "trainings_scheduled_date_idx" ON "trainings"("scheduled_date");
