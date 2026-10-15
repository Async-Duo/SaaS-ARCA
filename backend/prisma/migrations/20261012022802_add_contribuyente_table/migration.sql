-- CreateTable
CREATE TABLE "Contribuyente" (
    "id" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "categoriaMonotributo" TEXT NOT NULL DEFAULT 'C',
    "condicionIva" TEXT NOT NULL DEFAULT 'Monotributo',
    "ultimaSincronizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribuyente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contribuyente_cuit_key" ON "Contribuyente"("cuit");
