import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['kraft', 'corrugated', 'paperboard', 'rigid', 'bag_kraft', 'specialty'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    thicknessOptions: [
      {
        label: { type: String, required: true }, // e.g. "E-Flute (1.5mm / 350 GSM)"
        value: { type: String, required: true }, // e.g. "e_flute_15"
        caliperMm: { type: Number, default: 1.5 },
        gsm: { type: Number, default: 350 },
        costMultiplier: { type: Number, default: 1.0 },
      },
    ],
    baseCostPerSqMeter: {
      type: Number,
      required: true,
      default: 1.5,
    },
    supportedPackagingTypes: [
      {
        type: String,
        enum: ['mailer', 'folding_carton', 'rigid_box', 'shipping_box', 'paper_bag', 'sleeve'],
      },
    ],
    colorPresets: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
        description: { type: String, default: '' },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ecoCertifications: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Material = mongoose.model('Material', materialSchema);
