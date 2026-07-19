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
    const regularItems = items.filter((i: any) => !i.isAdditive && i.id !== 'discount' && i.id !== 'tax-cgst' && i.id !== 'tax-sgst');
    const additives = items.filter((i: any) => i.isAdditive || i.id === 'discount' || i.id === 'tax-cgst' || i.id === 'tax-sgst');
    const subtotal = regularItems.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0);

    // Dynamic extraction of tax and discount
    let cgstVal = 0;
    let sgstVal = 0;
    let couponDiscount = order.discount || 0;
    let itemDiscount = 0;

    additives.forEach((add: any) => {
      const val = add.price !== undefined ? add.price : (add.type === 'percentage' ? (subtotal * (add.value / 100)) : add.value);
      const name = (add.name || '').toLowerCase();
      if (name.includes('cgst')) {
        cgstVal = Math.abs(val);
      } else if (name.includes('sgst')) {
        sgstVal = Math.abs(val);
      } else if (name.includes('gst')) {
        cgstVal = Math.abs(val) / 2;
        sgstVal = Math.abs(val) / 2;
      } else if (name.includes('discount') || name.includes('coupon')) {
        couponDiscount = Math.abs(val);
      }
    });

    if (cgstVal === 0 && sgstVal === 0 && order.tax > 0) {
      cgstVal = order.tax / 2;
      sgstVal = order.tax / 2;
    }

    const grandTotal = order.total;
    const calcTotal = subtotal + cgstVal + sgstVal - couponDiscount - itemDiscount;
    const roundOff = grandTotal - calcTotal;

    // Helper to convert number to words
    const numberToRupeesInWords = (amount: number): string => {
      const numberToWords = (num: number): string => {
        const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        
        if (num === 0) return 'zero';
        
        const translate = (n: number): string => {
          let str = '';
          if (n >= 100) {
            str += a[Math.floor(n / 100)] + ' hundred ';
            n %= 100;
          }
          if (n >= 20) {
            str += b[Math.floor(n / 10)] + ' ';
            n %= 10;
          }
          if (n > 0) {
            str += a[n] + ' ';
          }
          return str.trim();
        };

        let word = '';
        if (Math.floor(num / 10000000) > 0) {
          word += translate(Math.floor(num / 10000000)) + ' crore ';
          num %= 10000000;
        }
        if (Math.floor(num / 100000) > 0) {
          word += translate(Math.floor(num / 100000)) + ' lakh ';
          num %= 100000;
        }
        if (Math.floor(num / 1000) > 0) {
          word += translate(Math.floor(num / 1000)) + ' thousand ';
          num %= 1000;
        }
        if (num > 0) {
          word += translate(num);
        }
        return word.trim();
      };

      const integerPart = Math.floor(amount);
      const words = numberToWords(integerPart);
      if (!words) return 'Zero Rupees Only';
      
      const capitalized = words
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
        
      return `Rupees ${capitalized} Only`;
    };

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

    // Outer frame boundary box (leaves standard professional padding margins)
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(6, 6, 198, 285);

    // ── HEADER ──────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 12, 12, 38, 16);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('The London Shakes', 12, 35);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('T-22, 3rd Floor, near Goldighi Mall Office, Premtala,', 12, 40);
    doc.text('Silchar, Assam — 788001, India', 12, 44);
    doc.text('+91 97063 88102  ·  contact@thelondonshakessilchar.com', 12, 48);
    doc.text('www.thelondonshakessilchar.com', 12, 52);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('TAX INVOICE', 198, 17, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(197, 168, 92); // Gold
    const formattedBillNo = `ORD-${order.id.slice(-8).toUpperCase()}`;
    doc.text(`#${order.id.slice(-8).toUpperCase()}`, 198, 23, { align: 'right' });

    const isPaid = order.paymentStatus === 'paid';
    if (isPaid) {
      doc.setFillColor(236, 253, 245); // Emerald-50 background
      doc.setDrawColor(167, 243, 208); // Emerald-200 border
      doc.setLineWidth(0.25);
      doc.roundedRect(173, 27, 25, 6, 1, 1, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(4, 120, 87); // Emerald-700
      doc.text('• PAID', 185.5, 31.2, { align: 'center' });
    } else {
      doc.setFillColor(254, 226, 226); // Red-50 background
      doc.setDrawColor(252, 165, 165); // Red-200 border
      doc.setLineWidth(0.25);
      doc.roundedRect(173, 27, 25, 6, 1, 1, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(220, 38, 38); // Red-700
      doc.text('• UNPAID', 185.5, 31.2, { align: 'center' });
    }

    // ── METADATA GRID (5 Columns) ───────────────────────────────────────────
    const metaY = 57;
    const colW = 36.8;
    const cols = [
      { label: 'ORDER NO.', val: formattedBillNo },
      { label: 'BILL DATE', val: new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
      { label: 'TIME', val: new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) },
      { label: 'TABLE', val: order.tableNumber ? `Table ${order.tableNumber}` : '—' },
      { label: 'ORDER TYPE', val: order.type === 'dine-in' ? 'Dine In' : order.type === 'pickup' ? 'Take Away' : 'Delivery' }
    ];

    cols.forEach((col, idx) => {
      const colX = 12 + idx * (colW + 0.5);
      doc.setFillColor(248, 250, 252);
      doc.rect(colX, metaY, colW, 11, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(colX, metaY, colW, 11, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(col.label, colX + 3, metaY + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(col.val, colX + 3, metaY + 8.5);
    });

    // ── BILL TO / INVOICE DETAILS Side-by-side Boxes ───────────────────────
    const blockY = 72;
    const boxW = 91;
    const boxH = 26;

    // Left Box — BILL TO
    doc.setFillColor(255, 255, 255);
    doc.rect(12, blockY, boxW, boxH, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(12, blockY, boxW, boxH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(197, 168, 92);
    doc.text('BILL TO', 16, blockY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(order.customerName, 16, blockY + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Phone: ${order.phone}`, 16, blockY + 17);
    doc.text(`Email: ${order.email || '—'}`, 16, blockY + 22.5);

    // Right Box — INVOICE DETAILS
    doc.setFillColor(255, 255, 255);
    doc.rect(107, blockY, boxW, boxH, 'F');
    doc.roundedRect(107, blockY, boxW, boxH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(197, 168, 92);
    doc.text('INVOICE DETAILS', 111, blockY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Place of Supply: Assam (18)`, 111, blockY + 11.5);
    doc.text(`Currency: INR (Rs.)`, 111, blockY + 17);
    const payMethodText = order.paymentMethod === 'upi' ? 'UPI — Google Pay' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment';
    doc.text(`Paid via: ${payMethodText}`, 111, blockY + 22.5);

    // ── ORDER ITEMS TABLE ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ORDER ITEMS', 12, 104);

    const tableHeaderY = 107;
    doc.setFillColor(248, 250, 252);
    doc.rect(12, tableHeaderY, 186, 6, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    
    doc.text('#', 14, tableHeaderY + 4.2);
    doc.text('ITEM', 24, tableHeaderY + 4.2);
    doc.text('QTY', 114, tableHeaderY + 4.2, { align: 'center' });
    doc.text('UNIT PRICE', 144, tableHeaderY + 4.2, { align: 'right' });
    doc.text('DISCOUNT', 170, tableHeaderY + 4.2, { align: 'right' });
    doc.text('TOTAL', 196, tableHeaderY + 4.2, { align: 'right' });

    let y = tableHeaderY + 6;
    regularItems.forEach((item: any, index: number) => {
      if (y > 215) {
        doc.addPage();
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.rect(6, 6, 198, 285);
        y = 15;
      }
      
      const itemIndexStr = String(index + 1).padStart(2, '0');
      const itemSize = item.size || '';
      const nameStr = itemSize && !item.name.toLowerCase().includes(`(${itemSize.toLowerCase()})`)
        ? `${item.name} (${itemSize.toUpperCase()})`
        : item.name;
      
      const splitName = doc.splitTextToSize(nameStr, 80);
      const HSNCode = "HSN 2202";
      const categoryLine = `${item.category || 'Beverages'} · ${itemSize || 'Regular'} · ${HSNCode}`;
      
      const rowH = Math.max(splitName.length * 4.5 + 4, 10);
      
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.15);
      doc.line(12, y + rowH, 198, y + rowH);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(itemIndexStr, 14, y + 4.5);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(splitName, 24, y + 4.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(categoryLine, 24, y + 4.5 + (splitName.length * 4.2));
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.qty), 114, y + 4.5, { align: 'center' });
      doc.text(`Rs. ${item.price.toFixed(2)}`, 144, y + 4.5, { align: 'right' });
      
      doc.setTextColor(148, 163, 184);
      doc.text('—', 170, y + 4.5, { align: 'right' });
      
      doc.setTextColor(15, 23, 42);
      doc.text(`Rs. ${(item.price * item.qty).toFixed(2)}`, 196, y + 4.5, { align: 'right' });
      
      y += rowH + 1;
    });

    // ── PAYMENT DETAILS & BILL SUMMARY ──────────────────────────────────────
    if (y > 215) {
      doc.addPage();
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(6, 6, 198, 285);
      y = 15;
    } else {
      y += 5;
    }

    const summaryH = 38;
    // Left Box - PAYMENT DETAILS
    doc.setFillColor(255, 255, 255);
    doc.rect(12, y, boxW, summaryH, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(12, y, boxW, summaryH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(197, 168, 92);
    doc.text('PAYMENT DETAILS', 16, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 128, 150);
    
    doc.text('Payment Status', 16, y + 11);
    doc.text('Payment Method', 16, y + 16.5);
    doc.text('Amount Paid', 16, y + 22);
    doc.text('Balance Due', 16, y + 27.5);
    doc.text('Invoice Status', 16, y + 33);

    doc.setFont('helvetica', 'bold');
    const alignX = 97;
    
    if (isPaid) {
      doc.setTextColor(4, 120, 87);
      doc.text('Paid', alignX, y + 11, { align: 'right' });
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('Unpaid', alignX, y + 11, { align: 'right' });
    }
    
    doc.setTextColor(15, 23, 42);
    doc.text(order.paymentMethod === 'upi' ? 'UPI — Google Pay' : order.paymentMethod === 'cod' ? 'Cash' : 'Card', alignX, y + 16.5, { align: 'right' });
    doc.text(`Rs. ${order.total.toFixed(2)}`, alignX, y + 22, { align: 'right' });
    doc.text('Rs. 0.00', alignX, y + 27.5, { align: 'right' });
    doc.text('Finalised', alignX, y + 33, { align: 'right' });

    // Right Box - BILL SUMMARY
    doc.setFillColor(255, 255, 255);
    doc.rect(107, y, boxW, summaryH, 'F');
    doc.roundedRect(107, y, boxW, summaryH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(197, 168, 92);
    doc.text('BILL SUMMARY', 111, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(113, 128, 150);
    
    doc.text('Subtotal', 111, y + 11);
    doc.text('Item Discount', 111, y + 15);
    doc.text('Coupon Discount', 111, y + 19);
    doc.text('CGST @ 2.5%', 111, y + 23);
    doc.text('SGST @ 2.5%', 111, y + 27);

    doc.setFont('helvetica', 'bold');
    const valAlignX = 192;
    doc.setTextColor(15, 23, 42);
    
    doc.text(`Rs. ${subtotal.toFixed(2)}`, valAlignX, y + 11, { align: 'right' });
    doc.text('-Rs. 0.00', valAlignX, y + 15, { align: 'right' });
    doc.text(`-Rs. ${couponDiscount.toFixed(2)}`, valAlignX, y + 19, { align: 'right' });
    doc.text(`+Rs. ${cgstVal.toFixed(2)}`, valAlignX, y + 23, { align: 'right' });
    doc.text(`+Rs. ${sgstVal.toFixed(2)}`, valAlignX, y + 27, { align: 'right' });

    // Grand Total Pill
    doc.setFillColor(247, 245, 240); // light cream
    doc.roundedRect(111, y + 33.5, 83, 8, 1, 1, 'F');
    doc.setDrawColor(197, 168, 92);
    doc.setLineWidth(0.2);
    doc.roundedRect(111, y + 33.5, 83, 8, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('GRAND TOTAL', 114, y + 39);
    doc.setFontSize(9);
    doc.setTextColor(197, 168, 92);
    doc.text(`Rs. ${order.total.toFixed(2)}`, 191, y + 39, { align: 'right' });

    // Rupees in Words
    y += summaryH + 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(numberToRupeesInWords(order.total), 198, y, { align: 'right' });

    // ── PAYMENT HISTORY & TERMS & CONDITIONS ──────────────────────────────
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(12, y, boxW, 14, 1, 1, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(197, 168, 92);
    doc.text('PAYMENT HISTORY', 16, y + 4.5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${order.paymentMethod === 'upi' ? 'UPI · Google Pay' : 'Cash on Delivery'}`, 16, y + 10);
    
    const paymentDateStr = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + `, ` + new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    doc.text(paymentDateStr, 44, y + 10);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(`Rs. ${order.total.toFixed(2)}  SUCCESS`, 97, y + 10, { align: 'right' });

    // Terms & Conditions
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(107, y, boxW, 14, 1, 1, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(197, 168, 92);
    doc.text('TERMS & CONDITIONS', 111, y + 4.5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(113, 128, 150);
    doc.text('1. Prices are inclusive of applicable GST unless stated otherwise.', 111, y + 9);
    doc.text('2. Food once served is non-returnable; raise quality concerns within 15 mins.', 111, y + 12);

    // ── FOOTER SIGNATURES ──────────────────────────────────────────────────
    y = Math.max(y + 20, 215);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(197, 168, 92);
    doc.text('Thank you for dining with us!', 12, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(113, 128, 150);
    doc.text("Return Policy: Served food is non-returnable. Replacements for genuine quality issues at manager's discretion.", 12, y + 4);
    doc.text("GST Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars", 12, y + 8);
    doc.text("are true and correct. E.&O.E.", 12, y + 11);

    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('The London Shakes', 198, y + 1, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('.......................................................................', 198, y + 6, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('AUTHORISED SIGNATORY', 198, y + 10, { align: 'right' });

    // Bottom Footer boundary line
    const footerY = 282;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(12, footerY - 4, 198, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This is a system-generated invoice and does not require a physical signature.', 12, footerY);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Powered by ', 172, footerY, { align: 'right' });
    
    doc.setTextColor(197, 168, 92);
    doc.text('TLS SmartPOS', 189, footerY, { align: 'right' });
    
    doc.setTextColor(100, 116, 139);
    doc.text(' · v2.4.1', 198, footerY, { align: 'right' });

    // ── TRANSACTION PROOF PHOTO (IF PRESENT) ───────────────────────────────
    if (order.receiptPhoto && order.receiptPhoto.startsWith('data:image/')) {
      try {
        const maxUsableY = 282;
        const imgW = 90;
        const imgH = 110;
        const spaceNeeded = imgH + 15;

        const fitsOnCurrentPage = (maxUsableY - y) >= spaceNeeded;

        if (!fitsOnCurrentPage) {
          doc.addPage();
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.rect(6, 6, 198, 285);
          y = 15;
        } else {
          y += 15;
        }

        doc.setDrawColor(197, 168, 92);
        doc.setLineWidth(0.35);
        doc.line(12, y, 198, y);
        y += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(197, 168, 92);
        doc.text('PROOF OF PAYMENT (TRANSACTION RECEIPT)', 105, y, { align: 'center' });
        y += 4;

        const formatMatch = order.receiptPhoto.match(/^data:image\/([a-zA-Z+]+);base64,/);
        const format = formatMatch ? formatMatch[1].toUpperCase() : 'JPEG';
        
        const xPos = (210 - imgW) / 2;
        doc.addImage(order.receiptPhoto, format as any, xPos, y, imgW, imgH, undefined, 'FAST');
      } catch (imgError) {
        console.warn('Failed to embed receiptPhoto in PDF:', imgError);
      }
    }

    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // 6. Build HTML Email Body (Beautiful branded design matching the invoice)
    const emailHtmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.05em; font-family: Georgia, serif;">THE LONDON SHAKES</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600;">Tax Invoice Receipt</p>
        </div>
        
        <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 10px;">Dear <strong>${order.customerName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 25px;">
          Thank you for dining with <strong>The London Shakes</strong>! Below is the summary of your transaction. 
          A detailed, print-ready PDF tax invoice has been attached to this email.
        </p>
        
        <div style="background-color: #f8fafc; padding: 22px; border-radius: 6px; margin: 25px 0; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #475569;">
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; font-weight: 700; width: 45%; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Bill Number</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 14px; color: #0f172a; font-weight: 600;">${formattedBillNo}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Date & Time</td>
              <td style="padding: 8px 0; color: #0f172a;">${new Date(order.createdAt).toLocaleString('en-IN')}</td>
            </tr>
            ${order.tableNumber ? `
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Table / Mode</td>
              <td style="padding: 8px 0; color: #0f172a;">Dine-In (Table ${order.tableNumber})</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px dashed #cbd5e1;">
              <td style="padding: 8px 0; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">Payment Method</td>
              <td style="padding: 8px 0; text-transform: uppercase; color: #0f172a; font-weight: 600;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0 0 0; font-weight: 800; color: #0f172a; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.05em;">Grand Total</td>
              <td style="padding: 12px 0 0 0; font-weight: 800; color: #c5a85c; font-size: 18px;">₹${order.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #0f172a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; margin-top: 30px; margin-bottom: 12px; font-weight: 700;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #475569;">
          <thead>
            <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
              <th style="padding: 8px 0; font-weight: 700;">Item Description</th>
              <th style="padding: 8px 0; font-weight: 700; text-align: center; width: 60px;">Qty</th>
              <th style="padding: 8px 0; font-weight: 700; text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${regularItems.map((item: any) => `
              <tr style="border-bottom: 1px dashed #f1f5f9;">
                <td style="padding: 10px 0; color: #334155; font-weight: 500;">
                  ${item.name}${item.size ? ` (${item.size.toUpperCase()})` : ''}
                  <div style="font-size: 11px; color: #94a3b8; font-weight: 400; margin-top: 2px;">HSN 2202</div>
                </td>
                <td style="padding: 10px 0; text-align: center; color: #334155; font-weight: 600;">${item.qty}</td>
                <td style="padding: 10px 0; text-align: right; color: #334155; font-weight: 600;">₹${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            `).join('')}
            
            <tr>
              <td colspan="2" style="padding: 12px 0 6px 0; text-align: right; color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Subtotal:</td>
              <td style="padding: 12px 0 6px 0; text-align: right; color: #334155; font-weight: 700;">₹${subtotal.toFixed(2)}</td>
            </tr>

            ${couponDiscount > 0 ? `
            <tr>
              <td colspan="2" style="padding: 6px 0; text-align: right; color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Coupon Discount:</td>
              <td style="padding: 6px 0; text-align: right; color: #ef4444; font-weight: 700;">-₹${couponDiscount.toFixed(2)}</td>
            </tr>` : ''}

            ${cgstVal > 0 ? `
            <tr>
              <td colspan="2" style="padding: 6px 0; text-align: right; color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">CGST @ 2.5%:</td>
              <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: 700;">+₹${cgstVal.toFixed(2)}</td>
            </tr>` : ''}

            ${sgstVal > 0 ? `
            <tr>
              <td colspan="2" style="padding: 6px 0; text-align: right; color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">SGST @ 2.5%:</td>
              <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: 700;">+₹${sgstVal.toFixed(2)}</td>
            </tr>` : ''}

            ${Math.abs(roundOff) > 0.005 ? `
            <tr>
              <td colspan="2" style="padding: 6px 0; text-align: right; color: #64748b; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Round Off:</td>
              <td style="padding: 6px 0; text-align: right; color: #475569; font-weight: 700;">${roundOff >= 0 ? '+' : ''}₹${roundOff.toFixed(2)}</td>
            </tr>` : ''}

            <tr style="border-top: 2px solid #e2e8f0;">
              <td colspan="2" style="padding: 15px 0 10px 0; text-align: right; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Grand Total:</td>
              <td style="padding: 15px 0 10px 0; text-align: right; font-size: 18px; font-weight: 800; color: #c5a85c;">₹${order.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: center; font-size: 11.5px; color: #94a3b8; border-top: 2px solid #f1f5f9; padding-top: 20px; line-height: 1.5;">
          <p style="margin: 0; font-weight: 700; color: #475569;">The London Shakes Silchar</p>
          <p style="margin: 4px 0 0 0;">T-22, 3rd Floor, near Goldighi Mall Office, Premtala, Silchar, Assam</p>
          <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 10.5px;">This is a system-generated secure copy of your tax invoice receipt.</p>
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
    const ownerEmail = process.env.OWNER_EMAIL;
    const managerEmail = process.env.MANAGER_EMAIL;

    if (!ownerEmail || !managerEmail) {
      console.error('Owner or Manager email configuration missing in environment variables.');
      return NextResponse.json({ success: false, error: 'Owner or Manager email configuration is not set up on the server.' }, { status: 500 });
    }

    const toEmail = order.email && order.email.includes('@') ? order.email : null;
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'The London Shakes'}" <${smtpUser}>`,
      to: toEmail || ownerEmail,
      bcc: toEmail 
        ? `${ownerEmail}, ${managerEmail}` 
        : managerEmail,
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
