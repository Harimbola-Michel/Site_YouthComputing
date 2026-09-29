-- AlterTable
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "partners_displayOrder_idx" ON "partners"("displayOrder");
