/*
  Warnings:

  - You are about to drop the column `activo` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `usuarios` table. All the data in the column will be lost.
  - Changed the type of `rol` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "configuracion_empresa" DROP CONSTRAINT "configuracion_empresa_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "cuotas" DROP CONSTRAINT "cuotas_prestamoId_fkey";

-- DropForeignKey
ALTER TABLE "notificaciones" DROP CONSTRAINT "notificaciones_usuarioId_fkey";

-- DropIndex
DROP INDEX "caja_movimientos_empresaId_idx";

-- DropIndex
DROP INDEX "caja_movimientos_fecha_idx";

-- DropIndex
DROP INDEX "clientes_empresaId_idx";

-- DropIndex
DROP INDEX "clientes_estado_idx";

-- DropIndex
DROP INDEX "pagos_fechaPago_idx";

-- DropIndex
DROP INDEX "pagos_prestamoId_idx";

-- DropIndex
DROP INDEX "prestamos_clienteId_idx";

-- DropIndex
DROP INDEX "prestamos_empresaId_idx";

-- DropIndex
DROP INDEX "prestamos_estado_idx";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "activo",
DROP COLUMN "avatar",
DROP COLUMN "telefono",
DROP COLUMN "updatedAt",
DROP COLUMN "rol",
ADD COLUMN     "rol" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ubicaciones_vendedor" (
    "id" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ubicaciones_vendedor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "configuracion_empresa" ADD CONSTRAINT "configuracion_empresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones_vendedor" ADD CONSTRAINT "ubicaciones_vendedor_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "prestamos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "prestamos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
