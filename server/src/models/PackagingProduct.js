import mongoose from 'mongoose';

const packagingProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    packagingType: {
      type: String,
      enum: ['mailer', 'folding_carton', 'rigid_box', 'shipping_box', 'paper_bag', 'sleeve'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    dimensions: {
      minL: { type: Number, required: true },
      maxL: { type: Number, required: true },
      defaultL: { type: Number, required: true },
      minW: { type: Number, required: true },
      maxW: { type: Number, required: true },
      defaultW: { type: Number, required: true },
      minH: { type: Number, required: true },
      maxH: { type: Number, required: true },
      defaultH: { type: Number, required: true },
      unit: { type: String, default: 'mm' },
    },
    supportedMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    supportedFinishes: [
      {
        code: { type: String, required: true }, // 'matte', 'gloss', 'soft_touch', 'uncoated', 'uv_spot'
        name: { type: String, required: true },
        description: { type: String, default: '' },
        surchargePerUnit: { type: Number, default: 0 },
      },
    ],
    printingOptions: [
      {
        code: { type: String, required: true }, // 'none', '1_color_outside', 'full_color_outside', 'full_color_both'
        name: { type: String, required: true },
        description: { type: String, default: '' },
        sides: { type: String, enum: ['none', 'outside', 'inside', 'both'], default: 'outside' },
      },
    ],
    additionalFeatures: [
      {
        code: { type: String, required: true }, // 'window_cutout', 'custom_insert', 'magnetic_closure', 'tear_strip', 'rope_handle'
        name: { type: String, required: true },
        description: { type: String, default: '' },
        unitCost: { type: Number, default: 0 },
        setupCost: { type: Number, default: 0 },
      },
    ],
    minOrderQuantity: {
      type: Number,
      default: 50,
    },
    maxOrderQuantity: {
      type: Number,
      default: 100000,
    },
    leadTimeDays: {
      type: Number,
      default: 8,
    },
    baseStartingPrice: {
      type: Number,
      default: 1.25,
    },
    images: [
      {
        type: String,
      },
    ],
    modelType: {
      type: String,
      required: true,
      default: 'mailer',
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    targetIndustries: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const PackagingProduct = mongoose.model('PackagingProduct', packagingProductSchema);
