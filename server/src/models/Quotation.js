import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackagingDesign',
      required: true,
    },
    customerDetails: {
      name: { type: String, required: true },
      businessName: { type: String, default: '' },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      deliveryLocation: {
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: 'USA' },
      },
      expectedTimelineWeeks: { type: Number, default: 2 },
      specialRequirements: { type: String, default: '' },
    },
    quantity: {
      type: Number,
      required: true,
    },
    configurationSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    pricingSnapshot: {
      unitCost: { type: Number, required: true },
      materialCostTotal: { type: Number, default: 0 },
      printingCostTotal: { type: Number, default: 0 },
      finishingCostTotal: { type: Number, default: 0 },
      featuresCostTotal: { type: Number, default: 0 },
      setupChargesTotal: { type: Number, default: 0 },
      quantityDiscountPercent: { type: Number, default: 0 },
      subtotal: { type: Number, required: true },
      taxAmount: { type: Number, default: 0 },
      shippingEstimate: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    adminAdjustments: {
      customAdjustmentAmount: { type: Number, default: 0 },
      adjustedShipping: { type: Number, default: 0 },
      adminNotes: { type: String, default: '' },
      internalCostEstimate: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: [
        'draft',
        'requested',
        'under_review',
        'quotation_prepared',
        'sent',
        'accepted',
        'revision_requested',
        'declined',
        'expired',
      ],
      default: 'requested',
      index: true,
    },
    validityDate: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    },
    revisionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Quotation = mongoose.model('Quotation', quotationSchema);
