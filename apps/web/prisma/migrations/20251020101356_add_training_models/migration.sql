-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('RUNNING', 'STRENGTH');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('TODO', 'COMPLETED', 'MISSED');

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "type" "TrainingType" NOT NULL,
    "status" "TrainingStatus" NOT NULL DEFAULT 'TODO',
    "trainer_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_done_details" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,

    -- Running-specific fields
    "distance_km" DOUBLE PRECISION,
    "pace_min_per_km" DOUBLE PRECISION,
    "elevation_gain_m" DOUBLE PRECISION,
    "route_data" JSONB,

    -- Strength-specific fields
    "exercises" JSONB,
    "total_volume" DOUBLE PRECISION,

    -- Common fields
    "duration_seconds" INTEGER,
    "average_heart_rate" INTEGER,
    "max_heart_rate" INTEGER,
    "calories" INTEGER,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_done_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trainings_organization_id_idx" ON "trainings"("organization_id");

-- CreateIndex
CREATE INDEX "trainings_trainer_id_idx" ON "trainings"("trainer_id");

-- CreateIndex
CREATE INDEX "trainings_member_id_idx" ON "trainings"("member_id");

-- CreateIndex
CREATE INDEX "trainings_status_idx" ON "trainings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "training_done_details_training_id_key" ON "training_done_details"("training_id");

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_done_details" ADD CONSTRAINT "training_done_details_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
