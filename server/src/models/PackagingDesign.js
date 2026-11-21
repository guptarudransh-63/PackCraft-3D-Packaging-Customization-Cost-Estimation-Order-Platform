import mongoose from 'mongoose';

const packagingDesignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackagingProduct',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Custom Packaging Design',
    },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, default: 'mm' },
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    materialThickness: {
      type: String,
      required: true,
    },
    color: {
      name: { type: String, default: 'Natural Kraft' },
      hex: { type: String, default: '#c99e6b' },
    },
    finish: {
      type: String,
      default: 'matte',
    },
    printing: {
      type: String,
      default: 'none',
    },
    additionalFeatures: [
      {
        type: String,
      },
    ],
    artwork: {
      logoUrl: { type: String, default: '' },
      brandText: { type: String, default: '' },
      placement: { type: String, default: 'top' }, // 'top', 'front', 'all_over'
      patternType: { type: String, default: 'none' }, // 'none', 'minimal_dots', 'geo_grid', 'diagonal_stripes'
      artworkColor: { type: String, default: '#18191b' },
      scale: { type: Number, default: 1.0 },
    },
    quantity: {
      type: Number,
      required: true,
      default: 250,
    },
    costEstimateSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PackagingDesign = mongoose.model('PackagingDesign', packagingDesignSchema);
