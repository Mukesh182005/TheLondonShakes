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

    // 5. Generate Receipt PDF in Memory (A4 format)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top gold brand banner
    doc.setFillColor(197, 168, 92);
    doc.rect(20, 15, 170, 3, 'F');

    // Title Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(26, 26, 26);
    doc.text('THE LONDON SHAKES', 20, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(113, 128, 150);
    doc.text('Silchar, Assam, India', 20, 38);
    doc.text(`Phone: ${restaurantInfo.contact.phone}`, 20, 43);
    doc.text('Email: contact@thelondonshakessilchar.com', 20, 48);

    // Right-aligned Invoice Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(197, 168, 92);
    doc.text('INVOICE / BILL', 190, 32, { align: 'right' });

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 53, 190, 53);

    // Metadata Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(74, 85, 104);
    doc.text('BILL TO:', 20, 61);
    doc.text('INVOICE DETAILS:', 120, 61);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(26, 26, 26);
    doc.text(order.customerName, 20, 67);
    doc.text(`Phone: ${order.phone}`, 20, 72);
    doc.text(`Email: ${order.email || 'N/A'}`, 20, 77);

    doc.text(`Bill ID: #${order.id.slice(-8).toUpperCase()}`, 120, 67);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 120, 72);
    doc.text(`Time: ${new Date(order.createdAt).toLocaleTimeString('en-IN')}`, 120, 77);
    doc.text(`Cashier: ${order.cashier}`, 120, 82);
    if (order.tableNumber) {
      doc.text(`Table Number: Dine-In (${order.tableNumber})`, 120, 87);
    }

    // Divider
    doc.line(20, 93, 190, 93);

    // Table Header Grid
    doc.setFillColor(248, 245, 237);
    doc.rect(20, 99, 170, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(197, 168, 92);
    doc.text('Item Description', 24, 104.5);
    doc.text('Qty', 110, 104.5, { align: 'center' });
    doc.text('Unit Price', 145, 104.5, { align: 'right' });
    doc.text('Total Price', 186, 104.5, { align: 'right' });

    // Render Items
    let y = 113;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 26, 26);

    regularItems.forEach((item: any) => {
      // Check page overflow
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const itemSize = item.size || '';
      const nameStr = itemSize && !item.name.toLowerCase().includes(`(${itemSize.toLowerCase()})`)
        ? `${item.name} (${itemSize.toUpperCase()})`
        : item.name;
      const splitName = doc.splitTextToSize(nameStr, 70);
      
      doc.text(splitName, 24, y);
      doc.text(String(item.qty), 110, y, { align: 'center' });
      doc.text(`Rs. ${item.price.toFixed(2)}`, 145, y, { align: 'right' });
      doc.text(`Rs. ${(item.price * item.qty).toFixed(2)}`, 186, y, { align: 'right' });

      // Draw subtle row divider line
      doc.setDrawColor(241, 245, 249);
      doc.line(20, y + 4, 190, y + 4);

      y += Math.max(splitName.length * 5, 8);
    });

    // Subtotal
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y - 2, 190, y - 2);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(74, 85, 104);
    doc.text('Subtotal:', 140, y, { align: 'right' });
    doc.setTextColor(26, 26, 26);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 186, y, { align: 'right' });

    // Render Additives
    additives.forEach((add: any) => {
      y += 6;
      doc.setTextColor(74, 85, 104);
      doc.text(`${add.name}:`, 140, y, { align: 'right' });
      
      const val = add.type === 'percentage' ? (subtotal * (add.value / 100)) : add.value;
      const sign = val < 0 ? '-' : '';
      doc.setTextColor(val < 0 ? 239 : 26, val < 0 ? 68 : 26, val < 0 ? 68 : 26); // red for discounts
      doc.text(`${sign}Rs. ${Math.abs(val).toFixed(2)}`, 186, y, { align: 'right' });
    });

    // Grand Total (Highlighted Gold Box)
    y += 8;
    doc.setFillColor(248, 245, 237);
    doc.rect(115, y - 5, 75, 8.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text('GRAND TOTAL:', 140, y, { align: 'right' });
    doc.setTextColor(197, 168, 92);
    doc.text(`Rs. ${order.total.toFixed(2)}`, 186, y, { align: 'right' });

    // Footer
    y += 20;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(113, 128, 150);
    doc.text('Thank you for dining with us! Visit again.', 105, y, { align: 'center' });

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
