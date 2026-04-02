import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateInvoicePDF(invoice: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = 750

  // Header
  page.drawText('INVOICE', { x: 50, y, size: 28, font: boldFont, color: rgb(0.2, 0.3, 0.8) })
  page.drawText(`#${invoice.number}`, { x: 50, y: y - 30, size: 12, font })

  // Company Info
  page.drawText('InvoiceMaster Inc.', { x: 50, y: y - 70, size: 10, font: boldFont })
  page.drawText('123 Business Street', { x: 50, y: y - 85, size: 10, font })
  page.drawText('Suite 100', { x: 50, y: y - 100, size: 10, font })
  page.drawText('New York, NY 10001', { x: 50, y: y - 115, size: 10, font })
  page.drawText('contact@invoicemaster.com', { x: 50, y: y - 130, size: 10, font })

  // Client Info
  page.drawText('Bill To:', { x: 350, y: y - 70, size: 12, font: boldFont })
  page.drawText(invoice.clientName, { x: 350, y: y - 85, size: 10, font })
  page.drawText(invoice.clientEmail, { x: 350, y: y - 100, size: 10, font })
  if (invoice.clientAddress) {
    page.drawText(invoice.clientAddress, { x: 350, y: y - 115, size: 10, font })
  }

  // Invoice Details
  y = 540
  page.drawText(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, {
    x: 50,
    y,
    size: 10,
    font,
  })
  page.drawText(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
    x: 50,
    y: y - 15,
    size: 10,
    font,
  })

  // Table Header
  y = 480
  // Draw header background
  page.drawRectangle({
    x: 45,
    y: y - 5,
    width: 510,
    height: 25,
    color: rgb(0.9, 0.95, 1),
  })

  page.drawText('Description', { x: 50, y, size: 11, font: boldFont })
  page.drawText('Qty', { x: 300, y, size: 11, font: boldFont })
  page.drawText('Unit Price', { x: 380, y, size: 11, font: boldFont })
  page.drawText('Total', { x: 480, y, size: 11, font: boldFont })

  // Table Rows
  y = 440
  invoice.items.forEach((item: any) => {
    page.drawText(item.description, { x: 50, y, size: 10, font })
    page.drawText(item.quantity.toString(), { x: 300, y, size: 10, font })
    page.drawText(`$${item.unitPrice.toFixed(2)}`, { x: 380, y, size: 10, font })
    page.drawText(`$${item.total.toFixed(2)}`, { x: 480, y, size: 10, font })
    y -= 20
  })

  // Totals
  y -= 20
  page.drawLine({
    start: { x: 350, y: y + 15 },
    end: { x: 545, y: y + 15 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })

  const taxAmount = (invoice.subtotal * invoice.tax) / 100
  const discountAmount = (invoice.subtotal * invoice.discount) / 100

  page.drawText(`Subtotal:`, { x: 380, y: y + 5, size: 10, font })
  page.drawText(`$${invoice.subtotal.toFixed(2)}`, { x: 480, y: y + 5, size: 10, font })

  page.drawText(`Tax (${invoice.tax}%):`, { x: 380, y: y - 10, size: 10, font })
  page.drawText(`$${taxAmount.toFixed(2)}`, { x: 480, y: y - 10, size: 10, font })

  if (invoice.discount > 0) {
    page.drawText(`Discount (${invoice.discount}%):`, { x: 380, y: y - 25, size: 10, font })
    page.drawText(`-$${discountAmount.toFixed(2)}`, { x: 480, y: y - 25, size: 10, font })
  }

  page.drawLine({
    start: { x: 350, y: y - 35 },
    end: { x: 545, y: y - 35 },
    thickness: 2,
    color: rgb(0.2, 0.3, 0.8),
  })

  page.drawText(`Total:`, { x: 380, y: y - 45, size: 14, font: boldFont })
  page.drawText(`$${invoice.total.toFixed(2)}`, { x: 480, y: y - 45, size: 14, font: boldFont })

  // Notes
  if (invoice.notes) {
    y -= 80
    page.drawText('Notes:', { x: 50, y, size: 11, font: boldFont })
    page.drawText(invoice.notes, { x: 50, y: y - 15, size: 9, font })
  }

  // Footer
  page.drawText('Thank you for your business!', {
    x: 50,
    y: 50,
    size: 10,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText('Payment is due within 30 days', {
    x: 50,
    y: 35,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}