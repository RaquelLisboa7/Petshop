-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "canceledBy" INTEGER,
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER;
