import mongoose from 'mongoose';

const orderActivitySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    actor: {
      name: { type: String, default: 'System' },
      role: { type: String, default: 'admin' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    notes: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderActivity = mongoose.model('OrderActivity', orderActivitySchema);
