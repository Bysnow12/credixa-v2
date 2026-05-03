// src/utils/pdf.ts
// Generación de recibos y reportes en PDF usando jsPDF

import type { Pago, Prestamo, Empresa } from '@/types'

interface ReciboData {
  pago: Pago & { prestamo: Prestamo & { cliente: any } }
  empresa: Empresa
  reciboConfig?: { encabezado?: string; pie?: string; logoActivo?: boolean }
}

export async function generarReciboPago({ pago, empresa, reciboConfig }: ReciboData): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 140] })

  // 🔥 NORMALIZAMOS EMPRESA (esto evita TODOS los errores de TS)
  const emp = empresa as Empresa & {
    rnc?: string
    telefono?: string
    direccion?: string
    simboloMoneda?: string
  }

  const formatC = (n: number) =>
    `${emp.simboloMoneda || 'RD$'} ${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`

  const W = 80
  let y = 8

  const line = (text: string, size = 8, align: 'left' | 'center' | 'right' = 'left', bold = false) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.text(text, align === 'center' ? W / 2 : align === 'right' ? W - 4 : 4, y, { align })
    y += size * 0.4 + 1
  }

  const divider = (dashed = false) => {
    doc.setLineDashPattern(dashed ? [1, 1] : [], 0)
    doc.setLineWidth(0.3)
    doc.line(4, y, W - 4, y)
    y += 3
  }

  // ── Encabezado ─────────────────────────
  line(emp.nombre, 11, 'center', true)

  if (emp.rnc) line(`RNC: ${emp.rnc}`, 7, 'center')
  if (emp.telefono) line(emp.telefono, 7, 'center')

  if (emp.direccion) {
    const dir = doc.splitTextToSize(emp.direccion, W - 8)
    dir.forEach((l: string) => line(l, 7, 'center'))
  }

  y += 1
  divider()

  line('RECIBO DE PAGO', 10, 'center', true)
  y += 1
  divider(true)

  // ── Datos ─────────────────────────
  const rows1 = [
    ['Recibo #:', pago.codigo],
    ['Préstamo:', pago.prestamo?.codigo || ''],
    ['Fecha:', new Date(pago.fechaPago).toLocaleDateString('es-DO')],
  ]

  rows1.forEach(([lbl, val]) => {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text(lbl, 4, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(val), 28, y)
    y += 4
  })

  y += 1
  divider(true)

  // ── Cliente ─────────────────────────
  line('CLIENTE', 7.5, 'left', true)
  const cliente = pago.prestamo?.cliente

  if (cliente) {
    line(`${cliente.nombre} ${cliente.apellido}`, 8, 'left')
    if (cliente.cedula) line(`Cédula: ${cliente.cedula}`, 7)
    if (cliente.telefono) line(`Tel: ${cliente.telefono}`, 7)
  }

  y += 1
  divider(true)

  // ── Desglose ─────────────────────────
  line('DESGLOSE DEL PAGO', 7.5, 'left', true)
  y += 1

  const items = [
    { label: 'Capital', val: pago.montoCapital },
    { label: 'Interés', val: pago.montoInteres },
  ]

  if (pago.montoMora > 0) {
    items.push({ label: 'Mora', val: pago.montoMora })
  }

  items.forEach(({ label, val }) => {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(label, 4, y)
    doc.text(formatC(val), W - 4, y, { align: 'right' })
    y += 4
  })

  divider()

  // ── Total ─────────────────────────
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL PAGADO', 4, y)
  doc.text(formatC(pago.monto), W - 4, y, { align: 'right' })
  y += 5

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Método: ${pago.metodoPago}`, 4, y)

  if (pago.referencia) {
    y += 3.5
    doc.text(`Ref: ${pago.referencia}`, 4, y)
  }

  y += 5
  divider(true)

  // ── Saldo ─────────────────────────
  const saldoRestante = pago.prestamo?.saldoPendiente || 0

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Saldo pendiente:', 4, y)
  doc.text(formatC(saldoRestante), W - 4, y, { align: 'right' })
  y += 5

  divider()

  // ── Pie ─────────────────────────
  if (reciboConfig?.pie) {
    const pie = doc.splitTextToSize(reciboConfig.pie, W - 8)
    pie.forEach((l: string) => line(l, 6.5, 'center'))
    y += 1
  }

  line('¡Gracias por su pago puntual!', 7, 'center', true)
  line('Conserve este comprobante', 6.5, 'center')
  y += 2
  line(`Generado: ${new Date().toLocaleString('es-DO')}`, 6, 'center')

  return doc.output('blob')
}