import { PackagingProduct } from '../models/PackagingProduct.js';
import { PackagingDesign } from '../models/PackagingDesign.js';
import { Quotation } from '../models/Quotation.js';
import { Order } from '../models/Order.js';
import { PricingRule } from '../models/PricingRule.js';
import { Material } from '../models/Material.js';

export const getDashboardOverview = async (req, res) => {
  try {
    const [
      totalProducts,
      publishedProducts,
      totalDesigns,
      totalQuotations,
      pendingQuotations,
      acceptedQuotations,
      totalOrders,
      inProductionOrders,
      recentOrders,
      recentQuotations,
    ] = await Promise.all([
      PackagingProduct.countDocuments(),
      PackagingProduct.countDocuments({ isPublished: true }),
      PackagingDesign.countDocuments(),
      Quotation.countDocuments(),
      Quotation.countDocuments({ status: { $in: ['requested', 'under_review', 'revision_requested'] } }),
      Quotation.countDocuments({ status: 'accepted' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['production_scheduled', 'in_production', 'quality_check'] } }),
      Order.find()
        .populate('customer', 'name email companyName')
        .sort({ createdAt: -1 })
        .limit(6),
      Quotation.find()
        .populate('customer', 'name email companyName')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    // Aggregate total revenue from confirmed/paid orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        metrics: {
          totalProducts,
          publishedProducts,
          totalDesigns,
          totalQuotations,
          pendingQuotations,
          acceptedQuotations,
          totalOrders,
          inProductionOrders,
          totalRevenue: Number(totalRevenue.toFixed(2)),
        },
        recentOrders,
        recentQuotations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.slug && productData.name) {
      productData.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const product = await PackagingProduct.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await PackagingProduct.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('supportedMaterials');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await PackagingProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pricing Rules
export const getPricingRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().populate('product');
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Pricing rule not found' });
    }
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
