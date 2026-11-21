import { Quotation } from '../models/Quotation.js';
import { PackagingDesign } from '../models/PackagingDesign.js';
import { PackagingProduct } from '../models/PackagingProduct.js';
import { Material } from '../models/Material.js';
import { PricingRule } from '../models/PricingRule.js';
import { calculatePackagingEstimate } from '../services/pricingEngine.js';

const generateQuoteNumber = async () => {
  const count = await Quotation.countDocuments();
  const year = new Date().getFullYear();
  return `PC-QT-${year}-${String(count + 1001).padStart(5, '0')}`;
};

export const createQuotationRequest = async (req, res) => {
  try {
    const {
      designId,
      customerDetails,
      quantity,
    } = req.body;

    if (!designId) {
      return res.status(400).json({ success: false, message: 'Design reference is required' });
    }

    const design = await PackagingDesign.findById(designId)
      .populate('product')
      .populate('material');

    if (!design) {
      return res.status(404).json({ success: false, message: 'Referenced design not found' });
    }

    // Verify ownership
    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this design' });
    }

    const requestedQty = Number(quantity) || design.quantity || 250;

    // Calculate authoritative pricing snapshot
    const product = await PackagingProduct.findById(design.product._id);
    const material = await Material.findById(design.material._id);
    const rule = await PricingRule.findOne({ product: product._id, isActive: true }) || await PricingRule.findOne({ isActive: true });

    const estimate = calculatePackagingEstimate({
      product,
      dimensions: design.dimensions,
      material,
      materialThickness: design.materialThickness,
      finish: design.finish,
      printing: design.printing,
      additionalFeatures: design.additionalFeatures,
      quantity: requestedQty,
      pricingRule: rule,
    });

    const quoteNumber = await generateQuoteNumber();

    const quotation = await Quotation.create({
      quotationNumber: quoteNumber,
      customer: req.user._id,
      design: design._id,
      customerDetails: {
        name: customerDetails?.name || req.user.name,
        businessName: customerDetails?.businessName || req.user.companyName || '',
        email: customerDetails?.email || req.user.email,
        phone: customerDetails?.phone || req.user.phone || '',
        deliveryLocation: customerDetails?.deliveryLocation || {
          address: '',
          city: '',
          postalCode: '',
          country: 'USA',
        },
        expectedTimelineWeeks: customerDetails?.expectedTimelineWeeks || 2,
        specialRequirements: customerDetails?.specialRequirements || '',
      },
      quantity: requestedQty,
      configurationSnapshot: {
        productName: product.name,
        productSlug: product.slug,
        packagingType: product.packagingType,
        dimensions: design.dimensions,
        materialName: material.name,
        materialCode: material.code,
        materialThickness: design.materialThickness,
        color: design.color,
        finish: design.finish,
        printing: design.printing,
        additionalFeatures: design.additionalFeatures,
        artwork: design.artwork,
      },
      pricingSnapshot: {
        unitCost: estimate.breakdown.estimatedUnitPrice,
        materialCostTotal: Number((estimate.breakdown.unitMaterialCost * requestedQty).toFixed(2)),
        printingCostTotal: Number((estimate.breakdown.unitPrintingCost * requestedQty).toFixed(2)),
        finishingCostTotal: Number((estimate.breakdown.unitFinishCost * requestedQty).toFixed(2)),
        featuresCostTotal: Number((estimate.breakdown.unitFeaturesCost * requestedQty).toFixed(2)),
        setupChargesTotal: estimate.breakdown.totalSetupCharges,
        quantityDiscountPercent: estimate.discountPercent,
        subtotal: estimate.breakdown.subtotal,
        taxAmount: estimate.breakdown.taxAmount,
        shippingEstimate: estimate.breakdown.shippingEstimate,
        totalAmount: estimate.breakdown.estimatedTotal,
        currency: 'USD',
      },
      status: 'requested',
      validityDate: new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ customer: req.user._id })
      .populate({
        path: 'design',
        populate: [{ path: 'product' }, { path: 'material' }],
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customer', 'name email companyName phone')
      .populate({
        path: 'design',
        populate: [{ path: 'product' }, { path: 'material' }],
      });

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (quotation.status === 'expired' || quotation.status === 'declined') {
      return res.status(400).json({ success: false, message: `Cannot accept quotation in '${quotation.status}' status.` });
    }

    quotation.status = 'accepted';
    await quotation.save();

    res.json({ success: true, data: quotation, message: 'Quotation successfully accepted. You can now place your order.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestQuotationRevision = async (req, res) => {
  try {
    const { revisionNotes } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    quotation.status = 'revision_requested';
    quotation.revisionNotes = revisionNotes || 'Customer requested specifications or pricing review.';
    await quotation.save();

    res.json({ success: true, data: quotation, message: 'Revision request submitted to engineering team.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const declineQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    quotation.status = 'declined';
    await quotation.save();

    res.json({ success: true, data: quotation, message: 'Quotation marked as declined.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: List all quotations
export const adminGetQuotations = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.businessName': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } },
      ];
    }

    const quotations = await Quotation.find(query)
      .populate('customer', 'name email companyName phone')
      .populate('design')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update quotation
export const adminUpdateQuotation = async (req, res) => {
  try {
    const { status, adminNotes, customAdjustmentAmount, adjustedShipping, validityDate } = req.body;

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (status) quotation.status = status;
    if (adminNotes !== undefined) quotation.adminAdjustments.adminNotes = adminNotes;
    if (customAdjustmentAmount !== undefined) quotation.adminAdjustments.customAdjustmentAmount = Number(customAdjustmentAmount);
    if (adjustedShipping !== undefined) quotation.adminAdjustments.adjustedShipping = Number(adjustedShipping);
    if (validityDate) quotation.validityDate = new Date(validityDate);

    // If admin adjusted amounts, recompute total amount cleanly
    if (customAdjustmentAmount !== undefined || adjustedShipping !== undefined) {
      const origSub = quotation.pricingSnapshot.subtotal;
      const origTax = quotation.pricingSnapshot.taxAmount;
      const finalShip = quotation.adminAdjustments.adjustedShipping || quotation.pricingSnapshot.shippingEstimate;
      const adjustment = quotation.adminAdjustments.customAdjustmentAmount || 0;
      
      quotation.pricingSnapshot.totalAmount = Number((origSub + origTax + finalShip + adjustment).toFixed(2));
      quotation.pricingSnapshot.unitCost = Number((quotation.pricingSnapshot.totalAmount / quotation.quantity).toFixed(2));
    }

    await quotation.save();

    const updated = await Quotation.findById(quotation._id)
      .populate('customer', 'name email companyName phone')
      .populate('design');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
