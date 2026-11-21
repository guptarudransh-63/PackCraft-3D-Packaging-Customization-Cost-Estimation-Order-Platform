import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
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
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackagingDesign',
      required: true,
    },
    configurationSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    confirmedUnitPrice: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    shippingAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      fullName: { type: String, default: '' },
      company: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
      phone: { type: String, default: '' },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'invoiced', 'net30', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: [
        'order_placed',
        'confirmed',
        'artwork_approval_pending',
        'artwork_approved',
        'production_scheduled',
        'in_production',
        'quality_check',
        'dispatched',
        'delivered',
        'cancelled',
      ],
      default: 'order_placed',
      index: true,
    },
    estimatedShipDate: {
      type: Date,
      default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000), // 14 business days default
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    carrier: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
