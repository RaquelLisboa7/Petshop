-- CreateEnum
CREATE TYPE "PagamentoStatus" AS ENUM ('pendente', 'pago', 'cancelado', 'recusado');

-- CreateEnum
CREATE TYPE "HistoricoAtendimentoTipo" AS ENUM ('status', 'pagamento', 'observacao');

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" SERIAL NOT NULL,
    "atendimentoId" INTEGER NOT NULL,
    "status" "PagamentoStatus" NOT NULL DEFAULT 'pendente',
    "valor" DOUBLE PRECISION NOT NULL,
    "metodo" TEXT,
    "transacaoId" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoAtendimento" (
    "id" SERIAL NOT NULL,
    "atendimentoId" INTEGER NOT NULL,
    "tipo" "HistoricoAtendimentoTipo" NOT NULL,
    "descricao" TEXT NOT NULL,
    "deStatus" "AtendimentoStatus",
    "paraStatus" "AtendimentoStatus",
    "actorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoAtendimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_atendimentoId_key" ON "Pagamento"("atendimentoId");

-- CreateIndex
CREATE INDEX "Pagamento_status_idx" ON "Pagamento"("status");

-- CreateIndex
CREATE INDEX "HistoricoAtendimento_atendimentoId_createdAt_idx" ON "HistoricoAtendimento"("atendimentoId", "createdAt");

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAtendimento" ADD CONSTRAINT "HistoricoAtendimento_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAtendimento" ADD CONSTRAINT "HistoricoAtendimento_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
