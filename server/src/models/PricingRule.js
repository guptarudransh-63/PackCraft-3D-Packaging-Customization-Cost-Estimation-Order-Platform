import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Standard Manufacturing Pricing Rule',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackagingProduct',
      default: null,
    },
    baseDieCutSetup: {
      type: Number,
      default: 45.0, // Fixed tooling / die plate setup
    },
    printingSetupFees: {
      none: { type: Number, default: 0 },
      '1_color_outside': { type: Number, default: 35 },
      'full_color_outside': { type: Number, default: 60 },
      'full_color_both': { type: Number, default: 105 },
    },
    printRatePerSqMeter: {
      none: { type: Number, default: 0 },
      '1_color_outside': { type: Number, default: 0.85 },
      'full_color_outside': { type: Number, default: 1.75 },
      'full_color_both': { type: Number, default: 3.10 },
    },
    finishCostPerSqMeter: {
      uncoated: { type: Number, default: 0 },
      matte: { type: Number, default: 0.45 },
      gloss: { type: Number, default: 0.50 },
      soft_touch: { type: Number, default: 0.90 },
      uv_spot: { type: Number, default: 1.25 },
    },
    wasteAllowancePercentage: {
      type: Number,
      default: 8, // 8% industrial scrap / trim allowance
    },
    quantityTiers: [
      {
        minQty: { type: Number, required: true },
        maxQty: { type: Number, required: true },
        discountMultiplier: { type: Number, required: true },
        label: { type: String, required: true },
      },
    ],
    taxRatePercentage: {
      type: Number,
      default: 5.0, // 5% standard manufacturing vat/tax
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      default: 'Automated dynamic estimation rule based on material net surface area, tooling, setup and volume economies of scale.',
    },
  },
  {
    timestamps: true,
  }
);

export const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);
