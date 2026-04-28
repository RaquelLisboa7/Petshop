-- CreateEnum
CREATE TYPE "AtendimentoStatus" AS ENUM ('agendado', 'confirmado', 'em_atendimento', 'finalizado', 'cancelado');

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" SERIAL NOT NULL,
    "status" "AtendimentoStatus" NOT NULL DEFAULT 'agendado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);
