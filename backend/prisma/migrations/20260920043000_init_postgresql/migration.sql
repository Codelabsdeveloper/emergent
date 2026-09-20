-- CreateTable
CREATE TABLE "registrations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(32) NOT NULL,
    "age" INTEGER NOT NULL,
    "phone_number" VARCHAR(30) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "occupation" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registrations_created_at_idx" ON "registrations"("created_at" DESC);

-- CreateIndex
CREATE INDEX "registrations_name_idx" ON "registrations"("name");

-- CreateIndex
CREATE INDEX "registrations_phone_number_idx" ON "registrations"("phone_number");

-- CreateIndex
CREATE INDEX "registrations_gender_idx" ON "registrations"("gender");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
