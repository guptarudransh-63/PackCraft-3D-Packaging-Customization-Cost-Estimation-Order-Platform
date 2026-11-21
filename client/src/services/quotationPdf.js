import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateQuotationPDF(quotation) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const quoteNum = quotation.quotationNumber || 'PC-QT-DEMO';
  const customer = quotation.customerDetails || {};
  const config = quotation.configurationSnapshot || {};
  const pricing = quotation.pricingSnapshot || {};

  // Header background
  doc.setFillColor(24, 25, 27); // charcoal-900
  doc.rect(0, 0, 210, 42, 'F');

  // Company Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PACKCRAFT', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(201, 158, 107); // kraft-400
  doc.text('INDUSTRIAL 3D PACKAGING & PRECISION MANUFACTURING', 14, 25);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  doc.text('orders@packcraft.com | +1 (555) 019-2834 | www.packcraft.com', 14, 32);

  // Document Title & Number
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FORMAL QUOTATION', 210 - 14, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(201, 158, 107);
  doc.text(`Ref: ${quoteNum}`, 210 - 14, 25, { align: 'right' });
  doc.setTextColor(200, 200, 200);
  doc.text(`Date: ${new Date(quotation.createdAt || Date.now()).toLocaleDateString()}`, 210 - 14, 32, { align: 'right' });

  // Two columns: Customer Info & Production Timeline
  let y = 52;
  doc.setFontSize(10);
  doc.setTextColor(24, 25, 27);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT SPECIFICATIONS', 14, y);
  doc.text('PRODUCTION & LOGISTICS', 120, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  y += 6;
  doc.text(`Contact: ${customer.name || 'Valued Client'}`, 14, y);
  doc.text(`Estimated Turnaround: ${customer.expectedTimelineWeeks || 2} Weeks`, 120, y);

  y += 5;
  doc.text(`Business: ${customer.businessName || 'D2C Merchant'}`, 14, y);
  doc.text(`Delivery Location: ${customer.deliveryLocation?.city || 'Austin'}, ${customer.deliveryLocation?.country || 'USA'}`, 120, y);

  y += 5;
  doc.text(`Email: ${customer.email || '-'}`, 14, y);
  doc.text(`Quotation Validity: 30 Calendar Days`, 120, y);

  // Technical Specification Table
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 25, 27);
  doc.text('ENGINEERED PACKAGING CONFIGURATION', 14, y);

  y += 4;
  const specData = [
    ['Product Structure', config.productName || 'Custom Packaging Box'],
    ['Dimensions (L × W × H)', `${config.dimensions?.length || 260} × ${config.dimensions?.width || 200} × ${config.dimensions?.height || 80} mm`],
    ['Material Substrate', config.materialName || 'Natural Kraft Corrugated Board'],
    ['Board Caliper / Thickness', config.materialThickness || 'E-Flute (1.5mm / 350 GSM)'],
    ['Finish & Coating', (config.finish || 'Matte').toUpperCase()],
    ['Printing Method', (config.printing || 'Full Color').replace(/_/g, ' ').toUpperCase()],
    ['Additional Custom Features', Array.isArray(config.additionalFeatures) && config.additionalFeatures.length ? config.additionalFeatures.join(', ').replace(/_/g, ' ') : 'None'],
    ['Branding / Artwork', config.artwork?.brandText ? `Text: "${config.artwork.brandText}"` : 'Custom Uploaded Artwork'],
  ];

  doc.autoTable({
    startY: y,
    head: [['Parameter', 'Manufacturing Specification']],
    body: specData,
    theme: 'grid',
    headStyles: { fillColor: [232, 215, 193], textColor: [40, 40, 40], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  // Cost Breakdown Table
  y = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 25, 27);
  doc.text('COMMERCIAL PRICING BREAKDOWN', 14, y);

  y += 4;
  const qty = quotation.quantity || 250;
  const unitCost = pricing.unitCost || (pricing.subtotal / qty);

  const costData = [
    ['Base Substrate & Die-Cut Forming', `${qty} Units`, `$${(pricing.materialCostTotal || (unitCost * qty * 0.5)).toFixed(2)}`],
    ['High-Definition Inks & Printing Passes', `${qty} Units`, `$${(pricing.printingCostTotal || (unitCost * qty * 0.25)).toFixed(2)}`],
    ['Surface Protective Coating & Finishing', `${qty} Units`, `$${(pricing.finishingCostTotal || (unitCost * qty * 0.15)).toFixed(2)}`],
    ['Fixed Tooling & Die Plate Setup Amortization', 'Fixed Charge', `$${(pricing.setupChargesTotal || 80).toFixed(2)}`],
    ['Volume Tier Scale Savings', `${pricing.quantityDiscountPercent || 0}% Discount`, `Included`],
    ['Subtotal (Excluding Tax & Freight)', '', `$${(pricing.subtotal || 0).toFixed(2)}`],
    ['Standard Manufacturing Tax (5%)', '', `$${(pricing.taxAmount || 0).toFixed(2)}`],
    ['Estimated Freight / Pallet Courier', '', `$${(pricing.shippingEstimate || 0).toFixed(2)}`],
    ['TOTAL ESTIMATED INVESTMENT', `${qty} Units @ $${Number(unitCost).toFixed(2)} / Unit`, `$${(pricing.totalAmount || 0).toFixed(2)}`],
  ];

  doc.autoTable({
    startY: y,
    head: [['Line Item Description', 'Quantity / Basis', 'Amount (USD)']],
    body: costData,
    theme: 'striped',
    headStyles: { fillColor: [24, 25, 27], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 45 },
      2: { cellWidth: 37, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // Terms and Footer
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 25, 27);
  doc.text('MANUFACTURING TERMS & CONDITIONS:', 14, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('1. Quotation prices are guaranteed for 30 calendar days from issue date.', 14, y);
  y += 3.5;
  doc.text('2. Production commences upon electronic artwork signoff and confirmed order submission.', 14, y);
  y += 3.5;
  doc.text('3. Tolerances for physical dimensions are ±1.0mm per FEFCO international standards.', 14, y);

  // Save PDF
  doc.save(`${quoteNum}.pdf`);
}
