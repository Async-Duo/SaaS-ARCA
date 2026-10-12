-- CreateTable
CREATE TABLE "Comprobante" (
    "id" TEXT NOT NULL,
    "cuitEmisor" TEXT NOT NULL,
    "puntoVenta" INTEGER NOT NULL,
    "tipoComprobante" INTEGER NOT NULL,
    "numeroComprobante" INTEGER NOT NULL,
    "concepto" INTEGER NOT NULL,
    "docTipo" INTEGER NOT NULL,
    "docNro" TEXT NOT NULL,
    "clienteNombre" TEXT NOT NULL DEFAULT 'Consumidor Final',
    "importeTotal" DOUBLE PRECISION NOT NULL,
    "cae" TEXT,
    "caeVencimiento" TEXT,
    "resultado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comprobante_cuitEmisor_puntoVenta_tipoComprobante_idx" ON "Comprobante"("cuitEmisor", "puntoVenta", "tipoComprobante");
