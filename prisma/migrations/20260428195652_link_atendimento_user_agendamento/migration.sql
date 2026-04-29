/*
  Warnings:

  - A unique constraint covering the columns `[agendamentoId]` on the table `Atendimento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agendamentoId` to the `Atendimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Atendimento` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgendamentoStatus" AS ENUM ('criado', 'confirmado', 'cancelado');

-- AlterTable
ALTER TABLE "Atendimento" ADD COLUMN     "agendamentoId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" "AgendamentoStatus" NOT NULL DEFAULT 'criado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Atendimento_agendamentoId_key" ON "Atendimento"("agendamentoId");

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
