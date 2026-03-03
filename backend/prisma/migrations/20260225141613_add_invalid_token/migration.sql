-- AlterTable
ALTER TABLE "User" ALTER COLUMN "mustChangePassword" SET DEFAULT false;

-- CreateTable
CREATE TABLE "InvalidToken" (
    "jti" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvalidToken_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE INDEX "InvalidToken_expiresAt_idx" ON "InvalidToken"("expiresAt");

-- CreateIndex
CREATE INDEX "InvalidToken_userId_idx" ON "InvalidToken"("userId");

-- AddForeignKey
ALTER TABLE "InvalidToken" ADD CONSTRAINT "InvalidToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
