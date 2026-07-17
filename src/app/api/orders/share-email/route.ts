import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsPDF } from 'jspdf';
import nodemailer from 'nodemailer';
import { verifyAdminRequest } from '@/lib/auth-crypto';
import { restaurantInfo } from '@/data/restaurantData';

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize Request
    const isAuthorized = await verifyAdminRequest(req);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Order ID
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // 3. Fetch Order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 4. Parse Items List
    const items = (order.items as any) || [];
    const regularItems = items.filter((i: any) => !i.isAdditive);
    const additives = items.filter((i: any) => i.isAdditive);
    const subtotal = regularItems.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0);

    // 5. Load logo for PDF embedding
    const fs = await import('fs');
    const path = await import('path');
    const logoPath = path.join(process.cwd(), 'public', 'icon.png');
    let logoBase64: string | null = null;
    try {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = logoBuffer.toString('base64');
    } catch {
      logoBase64 = null;
    }

    // 6. Generate Receipt PDF in Memory (A4 format)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ── DARK NAVY HEADER STRIP ───────────────────────────────────────────────
    doc.setFillColor(15, 23, 42);        // dark navy
    doc.rect(0, 0, 210, 38, 'F');

    // Gold accent bar at very top
    doc.setFillColor(197, 168, 92);
    doc.rect(0, 0, 210, 2.5, 'F');

    // Logo (top-left inside header)
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 12, 5, 46, 28);
    }

    // "INVOICE / BILL" badge (top-right)
    doc.setFillColor(197, 168, 92);
    doc.roundedRect(143, 8, 54, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('INVOICE / BILL', 170, 14.5, { align: 'center' });

    // Bill ID subtitle beneath badge
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 160, 100);
    doc.text(`#${order.id.slice(-8).toUpperCase()}`, 170, 23, { align: 'center' });

    // Contact info bottom-right of header
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`${restaurantInfo.contact.phone}  ·  contact@thelondonshakessilchar.com`, 198, 33, { align: 'right' });

    // ── GOLD DIVIDER ─────────────────────────────────────────────────────────
    doc.setDrawColor(197, 168, 92);
    doc.setLineWidth(0.4);
    doc.line(12, 38, 198, 38);

    // ── BILL TO / INVOICE DETAILS BLOCK ─────────────────────────────────────
    const blockY = 44;

    // Left tinted box — BILL TO
    doc.setFillColor(248, 250, 252);
    doc.rect(12, blockY, 86, 38, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(12, blockY, 86, 38, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(197, 168, 92);
    doc.text('BILL TO', 16, blockY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(order.customerName, 16, blockY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(74, 85, 104);
    doc.text(`Phone: ${order.phone}`, 16, blockY + 20);
    doc.text(`Email: ${order.email || 'N/A'}`, 16, blockY + 27);

    // Right tinted box — INVOICE DETAILS
    doc.setFillColor(248, 250, 252);
    doc.rect(110, blockY, 88, 38, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(110, blockY, 88, 38, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(197, 168, 92);
    doc.text('INVOICE DETAILS', 114, blockY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(74, 85, 104);
    doc.text(`Date:    ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 114, blockY + 13);
    doc.text(`Time:    ${new Date(order.createdAt).toLocaleTimeString('en-IN')}`, 114, blockY + 20);
    doc.text(`Cashier: ${order.cashier}`, 114, blockY + 27);
    if (order.tableNumber) {
      doc.text(`Table:   Dine-In (${order.tableNumber})`, 114, blockY + 34);
    }

    // Payment method pill
    const pmText = (order.paymentMethod || 'N/A').toUpperCase();
    const pmColors: Record<string, [number,number,number]> = {
      CASH: [16, 185, 129],
      GPAY: [59, 130, 246],
      PHONEPE: [139, 92, 246],
      CARD: [245, 158, 11],
    };
    const pmKey = Object.keys(pmColors).find(k => pmText.includes(k)) || '';
    const [pr, pg, pb] = pmColors[pmKey] || [113, 128, 150];
    doc.setFillColor(pr, pg, pb);
    doc.roundedRect(12, blockY + 42, 50, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Paid via: ${pmText}`, 37, blockY + 47, { align: 'center' });

    // ── ITEMS TABLE ──────────────────────────────────────────────────────────
    let y = blockY + 56;

    // Table header row
    doc.setFillColor(15, 23, 42);
    doc.rect(12, y, 186, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(197, 168, 92);
    doc.text('ITEM', 16, y + 5.5);
    doc.text('QTY', 112, y + 5.5, { align: 'center' });
    doc.text('UNIT PRICE', 152, y + 5.5, { align: 'right' });
    doc.text('TOTAL', 196, y + 5.5, { align: 'right' });
    y += 10;

    // Item rows
    let rowAlt = false;
    regularItems.forEach((item: any) => {
      if (y > 265) {
        doc.addPage();
        y = 15;
      }
      const itemSize = item.size || '';
      const nameStr = itemSize && !item.name.toLowerCase().includes(`(${itemSize.toLowerCase()})`)
        ? `${item.name} (${itemSize.toUpperCase()})`
        : item.name;
      const splitName = doc.splitTextToSize(nameStr, 82);
      const rowH = Math.max(splitName.length * 5, 7) + 3;

      // Alternating row tint
      if (rowAlt) {
        doc.setFillColor(249, 250, 251);
        doc.rect(12, y - 1, 186, rowH, 'F');
      }
      rowAlt = !rowAlt;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 26, 26);
      doc.text(splitName, 16, y + 3);
      doc.text(String(item.qty), 112, y + 3, { align: 'center' });
      doc.setTextColor(74, 85, 104);
      doc.text(`Rs. ${item.price.toFixed(2)}`, 152, y + 3, { align: 'right' });
      doc.setTextColor(26, 26, 26);
      doc.text(`Rs. ${(item.price * item.qty).toFixed(2)}`, 196, y + 3, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(12, y + rowH - 1, 198, y + rowH - 1);
      y += rowH;
    });

    // ── TOTALS BLOCK ─────────────────────────────────────────────────────────
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(74, 85, 104);
    doc.text('Subtotal:', 152, y, { align: 'right' });
    doc.setTextColor(26, 26, 26);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 196, y, { align: 'right' });

    additives.forEach((add: any) => {
      y += 6;
      const val = add.type === 'percentage' ? (subtotal * (add.value / 100)) : add.value;
      const sign = val < 0 ? '' : '+';
      doc.setTextColor(74, 85, 104);
      doc.text(`${add.name}:`, 152, y, { align: 'right' });
      doc.setTextColor(val < 0 ? 220 : 16, val < 0 ? 53 : 185, val < 0 ? 69 : 129);
      doc.text(`${sign}Rs. ${val.toFixed(2)}`, 196, y, { align: 'right' });
    });

    // Grand Total — full-width gold box
    y += 7;
    doc.setFillColor(197, 168, 92);
    doc.rect(12, y - 1, 186, 11, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('GRAND TOTAL', 16, y + 6.5);
    doc.setFontSize(13);
    doc.text(`Rs. ${order.total.toFixed(2)}`, 196, y + 6.5, { align: 'right' });

    // ── FOOTER ───────────────────────────────────────────────────────────────
    y += 22;
    doc.setDrawColor(197, 168, 92);
    doc.setLineWidth(0.4);
    doc.line(12, y, 198, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Thank you for dining with The London Shakes!', 105, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 128, 150);
    doc.text('Silchar, Assam, India  ·  contact@thelondonshakessilchar.com  ·  This is a system-generated receipt.', 105, y, { align: 'center' });

    // ── TRANSACTION PROOF PHOTO (IF PRESENT) ───────────────────────────────
    if (order.receiptPhoto && order.receiptPhoto.startsWith('data:image/')) {
      try {
        // A4 page height is 297mm.
        // Margin at the bottom is 15mm, so max usable Y is 282mm.
        const maxUsableY = 282;
        const imgW = 90;   // 90mm width
        const imgH = 110;  // 110mm height (optimized smartphone ratio)
        const spaceNeeded = imgH + 15; // Image height + header titles

        const fitsOnCurrentPage = (maxUsableY - y) >= spaceNeeded;

        if (!fitsOnCurrentPage) {
          doc.addPage();
          y = 15; // reset to top of page 2
        } else {
          y += 10; // spacing below invoice footer
        }

        // Section header
        doc.setDrawColor(197, 168, 92);
        doc.setLineWidth(0.35);
        doc.line(12, y, 198, y);
        y += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(197, 168, 92);
        doc.text('PROOF OF PAYMENT (TRANSACTION RECEIPT)', 105, y, { align: 'center' });
        y += 4;

        // Determine image format (e.g. png, jpeg) from data url
        const formatMatch = order.receiptPhoto.match(/^data:image\/([a-zA-Z+]+);base64,/);
        const format = formatMatch ? formatMatch[1].toUpperCase() : 'JPEG';
        
        // Center the image
        const xPos = (210 - imgW) / 2;
        doc.addImage(order.receiptPhoto, format as any, xPos, y, imgW, imgH, undefined, 'FAST');
      } catch (imgError) {
        console.warn('Failed to embed receiptPhoto in PDF:', imgError);
      }
    }

    // Output PDF ArrayBuffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // 6. Build HTML Email Body
    const emailHtmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; background-color: #ffffff; border-top: 4px solid #c5a85c;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #edf2f7; padding-bottom: 20px;">
          <h1 style="color: #1a202c; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 0.05em;">THE LONDON SHAKES</h1>
          <p style="color: #718096; margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Silchar, Assam</p>
        </div>
        
        <p style="font-size: 15px; color: #2d3748; line-height: 1.6;">Dear <strong>${order.customerName}</strong>,</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.6;">
          Thank you for ordering from <strong>The London Shakes</strong>! Below is the summary of your transaction. 
          Your formal receipt is attached as a PDF file to this email.
        </p>
        
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #edf2f7;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4a5568;">
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; width: 45%; color: #718096; text-transform: uppercase; font-size: 11px;">Bill Number</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 15px; color: #1a202c;">#${order.id.slice(-8).toUpperCase()}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #718096; text-transform: uppercase; font-size: 11px;">Date & Time</td>
              <td style="padding: 8px 0; color: #1a202c;">${new Date(order.createdAt).toLocaleString('en-IN')}</td>
            </tr>
            ${order.tableNumber ? `
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #718096; text-transform: uppercase; font-size: 11px;">Table / Mode</td>
              <td style="padding: 8px 0; color: #1a202c;">Dine-In (${order.tableNumber})</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px dashed #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold; color: #718096; text-transform: uppercase; font-size: 11px;">Payment Method</td>
              <td style="padding: 8px 0; text-transform: uppercase; color: #1a202c; font-weight: 500;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0 0 0; font-weight: bold; color: #1a202c; font-size: 14px;">Total Amount</td>
              <td style="padding: 12px 0 0 0; font-weight: bold; color: #c5a85c; font-size: 18px;">₹${order.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #2d3748; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #4a5568;">
          <thead>
            <tr style="border-bottom: 1px solid #edf2f7; text-align: left; color: #718096;">
              <th style="padding: 8px 0; font-weight: bold;">Item Description</th>
              <th style="padding: 8px 0; font-weight: bold; text-align: center; width: 60px;">Qty</th>
              <th style="padding: 8px 0; font-weight: bold; text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${regularItems.map((item: any) => `
              <tr style="border-bottom: 1px dashed #edf2f7;">
                <td style="padding: 10px 0; color: #2d3748;">${item.name}${item.size ? ` (${item.size.toUpperCase()})` : ''}</td>
                <td style="padding: 10px 0; text-align: center; color: #2d3748;">${item.qty}</td>
                <td style="padding: 10px 0; text-align: right; color: #2d3748; font-weight: 500;">₹${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #a0aec0; border-top: 1px solid #edf2f7; padding-top: 20px;">
          <p style="margin: 0; font-weight: bold; color: #718096;">The London Shakes Silchar</p>
          <p style="margin: 4px 0 0 0;">Silchar, Assam, India</p>
          <p style="margin: 10px 0 0 0; color: #cbd5e0;">This is a system-generated secure copy of your table order receipt.</p>
        </div>
      </div>
    `;

    // 7. Setup Nodemailer Transporter
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpSecure = process.env.SMTP_SECURE !== 'false'; // default true
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error('SMTP configuration missing in environment variables.');
      return NextResponse.json({ success: false, error: 'SMTP configuration is not set up on the server.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    // 8. Compile recipient list
    // - If customer email is present: Send To customer, BCC both owner & manager (hidden from customer).
    // - If NO customer email: Send To owner, BCC manager (ensuring both owner & manager receive it).
    const toEmail = order.email && order.email.includes('@') ? order.email : null;
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'The London Shakes'}" <${smtpUser}>`,
      to: toEmail || 'abhik.dhar47@gmail.com',
      bcc: toEmail 
        ? 'abhik.dhar47@gmail.com, deepalisingh98541@gmail.com' 
        : 'deepalisingh98541@gmail.com',
      subject: `TLS Bill - #${order.id.slice(-8).toUpperCase()} ${order.customerName}`,
      html: emailHtmlBody,
      attachments: [
        {
          filename: `TLS_Receipt_${order.id.slice(-8).toUpperCase()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // 9. Dispatch Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Failed to share bill by Gmail:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
