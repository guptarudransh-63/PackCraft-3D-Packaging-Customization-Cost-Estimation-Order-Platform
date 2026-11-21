/**
 * Dynamic Authoritative Packaging Cost Estimation Engine
 * Calculates precise manufacturing cost estimates based on packaging type blank geometry,
 * substrate grade/thickness, printing surfaces, finishing, feature add-ons, setup amortization,
 * and quantity volume discount tiers.
 */

// Calculate physical sheet blank area in square meters (including folds, tucks, flaps, and seams)
export function calculateBlankSurfaceArea(type, l_mm, w_mm, h_mm) {
  const L = Math.max(10, Number(l_mm));
  const W = Math.max(10, Number(w_mm));
  const H = Math.max(10, Number(h_mm));

  let blankAreaMm2 = 0;

  switch (type) {
    case 'mailer':
      // Roll-End Tuck Front (RETF) mailer blank
      // Lengthwise: 2*H (lid+bottom sides) + 2*W (lid + base) + 1.2*H (tuck front flap & locks)
      // Widthwise: L + 4*H (double rollover side walls for structural crush resistance)
      const mailerLength = 2.5 * H + 2 * W;
      const mailerWidth = L + 4 * H;
      blankAreaMm2 = mailerLength * mailerWidth;
      break;

    case 'folding_carton':
      // Reverse or Straight Tuck-End carton
      // Blank perimeter: 2*(L + W) + 15mm glue flap
      // Blank height: H + 2*(W * 0.75) + 30mm tuck flaps
      const cartonPerimeter = 2 * (L + W) + 15;
      const cartonHeight = H + 1.5 * W + 30;
      blankAreaMm2 = cartonPerimeter * cartonHeight;
      break;

    case 'rigid_box':
      // 2-Piece rigid setup box: Base tray + lift-off lid + wrap paper
      // Base blank: (L + 2*H) * (W + 2*H)
      const lidH = Math.min(H * 0.7, 45);
      const baseArea = (L + 2 * H) * (W + 2 * H);
      const lidArea = (L + 6 + 2 * lidH) * (W + 6 + 2 * lidH);
      // Greyboard core + laminated art paper wrapping factor
      blankAreaMm2 = (baseArea + lidArea) * 1.25;
      break;

    case 'shipping_box':
      // Regular Slotted Container (RSC)
      // Length: 2 * (L + W) + 35mm manufacturer's joint
      // Width: H + W (top and bottom flaps each meet in middle = W/2 + W/2)
      const rscLength = 2 * (L + W) + 35;
      const rscWidth = H + W;
      blankAreaMm2 = rscLength * rscWidth;
      break;

    case 'paper_bag':
      // Gusseted paper shopping bag
      // Perimeter: 2*L + 2*W + 25mm seam
      // Height: H + 0.6*W (envelope bottom fold) + 40mm (reinforced top fold)
      const bagPerimeter = 2 * L + 2 * W + 25;
      const bagHeight = H + 0.6 * W + 40;
      blankAreaMm2 = bagPerimeter * bagHeight;
      break;

    case 'sleeve':
      // Slide band sleeve with glue seam
      // Perimeter: 2*W + 2*H + 20mm glue flap
      // Length: L
      blankAreaMm2 = (2 * W + 2 * H + 20) * L;
      break;

    default:
      // Generic standard 6-sided prism surface area + 30% flap allowance
      blankAreaMm2 = 2 * (L * W + L * H + W * H) * 1.3;
      break;
  }

  // Convert mm² to m²
  const sqMeters = blankAreaMm2 / 1000000;
  return Math.max(0.015, Number(sqMeters.toFixed(4)));
}

/**
 * Core estimation function
 */
export function calculatePackagingEstimate({
  product,
  dimensions,
  material,
  materialThickness,
  finish = 'matte',
  printing = 'none',
  additionalFeatures = [],
  quantity = 250,
  pricingRule = null,
}) {
  const qty = Math.max(1, Number(quantity) || 100);
  const l = Number(dimensions.length);
  const w = Number(dimensions.width);
  const h = Number(dimensions.height);

  if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0) {
    throw new Error('Valid positive dimensions (length, width, height) are required.');
  }

  const packagingType = product.packagingType || 'mailer';
  const sqMetersPerUnit = calculateBlankSurfaceArea(packagingType, l, w, h);

  // 1. Material Calculation
  const wasteAllowancePct = pricingRule?.wasteAllowancePercentage ?? 8;
  const wasteFactor = 1 + wasteAllowancePct / 100;
  const grossSqMeters = sqMetersPerUnit * wasteFactor;

  // Material thickness multiplier
  let thicknessMultiplier = 1.0;
  if (material?.thicknessOptions?.length > 0 && materialThickness) {
    const matched = material.thicknessOptions.find(
      (t) => t.value === materialThickness || t.label === materialThickness
    );
    if (matched && matched.costMultiplier) {
      thicknessMultiplier = matched.costMultiplier;
    }
  }

  const baseCostPerSqM = material?.baseCostPerSqMeter ?? 1.6;
  const unitMaterialCost = grossSqMeters * baseCostPerSqM * thicknessMultiplier;

  // 2. Printing Calculation
  const printRates = pricingRule?.printRatePerSqMeter || {
    none: 0,
    '1_color_outside': 0.85,
    'full_color_outside': 1.75,
    'full_color_both': 3.10,
  };
  const printRateSqM = printRates[printing] ?? 0;
  const unitPrintingCost = sqMetersPerUnit * printRateSqM;

  // 3. Finishing Calculation
  const finishRates = pricingRule?.finishCostPerSqMeter || {
    uncoated: 0,
    matte: 0.45,
    gloss: 0.50,
    soft_touch: 0.90,
    uv_spot: 1.25,
  };
  const finishRateSqM = finishRates[finish] ?? 0.45;
  const unitFinishCost = sqMetersPerUnit * finishRateSqM;

  // 4. Additional Features
  let unitFeaturesCost = 0;
  let featuresSetupCost = 0;

  if (Array.isArray(additionalFeatures) && additionalFeatures.length > 0) {
    for (const featCode of additionalFeatures) {
      const featConfig = product.additionalFeatures?.find((f) => f.code === featCode);
      if (featConfig) {
        unitFeaturesCost += featConfig.unitCost || 0;
        featuresSetupCost += featConfig.setupCost || 0;
      } else {
        // Fallback realistic feature pricing
        if (featCode === 'window_cutout') {
          unitFeaturesCost += 0.12;
          featuresSetupCost += 25;
        } else if (featCode === 'custom_insert' || featCode === 'foam_insert') {
          unitFeaturesCost += 0.45;
          featuresSetupCost += 40;
        } else if (featCode === 'magnetic_closure') {
          unitFeaturesCost += 0.35;
          featuresSetupCost += 30;
        } else if (featCode === 'rope_handle') {
          unitFeaturesCost += 0.22;
          featuresSetupCost += 15;
        } else if (featCode === 'tear_strip') {
          unitFeaturesCost += 0.08;
          featuresSetupCost += 10;
        }
      }
    }
  }

  // 5. Fixed Machine Tooling & Setup Charges
  const baseDieCutSetup = pricingRule?.baseDieCutSetup ?? 45.0;
  const printSetups = pricingRule?.printingSetupFees || {
    none: 0,
    '1_color_outside': 35,
    'full_color_outside': 60,
    'full_color_both': 105,
  };
  const printSetupFee = printSetups[printing] ?? 0;
  const totalSetupCharges = baseDieCutSetup + printSetupFee + featuresSetupCost;

  // 6. Quantity Volume Scaling / Tier Discount
  const quantityTiers = pricingRule?.quantityTiers || [
    { minQty: 50, maxQty: 249, discountMultiplier: 1.0, label: 'Pilot Run (50-249)' },
    { minQty: 250, maxQty: 499, discountMultiplier: 0.88, label: 'Small Batch (250-499)' },
    { minQty: 500, maxQty: 999, discountMultiplier: 0.76, label: 'Mid Batch (500-999)' },
    { minQty: 1000, maxQty: 2499, discountMultiplier: 0.64, label: 'Standard Production (1000-2499)' },
    { minQty: 2500, maxQty: 9999, discountMultiplier: 0.52, label: 'High Volume (2500-9999)' },
    { minQty: 10000, maxQty: 100000, discountMultiplier: 0.40, label: 'Enterprise Bulk (10000+)' },
  ];

  let activeTier = quantityTiers[0];
  for (const tier of quantityTiers) {
    if (qty >= tier.minQty && qty <= tier.maxQty) {
      activeTier = tier;
      break;
    }
  }
  if (qty > quantityTiers[quantityTiers.length - 1].maxQty) {
    activeTier = quantityTiers[quantityTiers.length - 1];
  }

  const volumeDiscountMultiplier = activeTier.discountMultiplier;
  const discountPercent = Math.round((1 - volumeDiscountMultiplier) * 100);

  // Unit running production cost before volume discount
  const rawUnitProductionCost = unitMaterialCost + unitPrintingCost + unitFinishCost + unitFeaturesCost;
  // Apply volume discount to unit production cost
  const discountedUnitProductionCost = rawUnitProductionCost * volumeDiscountMultiplier;

  // Setup cost amortized per unit for transparent display
  const setupCostPerUnit = totalSetupCharges / qty;

  // Subtotal unit price
  const finalUnitPrice = Number((discountedUnitProductionCost + setupCostPerUnit).toFixed(2));

  // Totals
  const subtotal = Number((finalUnitPrice * qty).toFixed(2));
  const taxRatePct = pricingRule?.taxRatePercentage ?? 5.0;
  const taxAmount = Number(((subtotal * taxRatePct) / 100).toFixed(2));
  
  // Approximate standard ground shipping estimate based on weight / volume
  const cubicMeters = (l * w * h * qty) / 1000000000;
  const estimatedShipping = Math.max(15, Math.round(cubicMeters * 38 + 12));
  
  const estimatedTotal = Number((subtotal + taxAmount + estimatedShipping).toFixed(2));

  return {
    dimensions: { length: l, width: w, height: h, unit: 'mm' },
    sqMetersPerUnit,
    quantity: qty,
    tierLabel: activeTier.label,
    discountPercent,
    breakdown: {
      unitMaterialCost: Number(unitMaterialCost.toFixed(3)),
      unitPrintingCost: Number(unitPrintingCost.toFixed(3)),
      unitFinishCost: Number(unitFinishCost.toFixed(3)),
      unitFeaturesCost: Number(unitFeaturesCost.toFixed(3)),
      unitProductionCost: Number(discountedUnitProductionCost.toFixed(3)),
      setupCostPerUnit: Number(setupCostPerUnit.toFixed(3)),
      totalSetupCharges: Number(totalSetupCharges.toFixed(2)),
      subtotal: subtotal,
      taxRatePercentage: taxRatePct,
      taxAmount: taxAmount,
      shippingEstimate: estimatedShipping,
      estimatedTotal: estimatedTotal,
      estimatedUnitPrice: finalUnitPrice,
    },
    currency: 'USD',
    timestamp: new Date().toISOString(),
  };
}
