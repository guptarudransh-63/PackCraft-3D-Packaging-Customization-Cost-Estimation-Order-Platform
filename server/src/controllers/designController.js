import { PackagingDesign } from '../models/PackagingDesign.js';
import { PackagingProduct } from '../models/PackagingProduct.js';
import { Material } from '../models/Material.js';
import { PricingRule } from '../models/PricingRule.js';
import { calculatePackagingEstimate } from '../services/pricingEngine.js';

export const getUserDesigns = async (req, res) => {
  try {
    const designs = await PackagingDesign.find({ user: req.user._id })
      .populate('product')
      .populate('material')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: designs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDesignById = async (req, res) => {
  try {
    const design = await PackagingDesign.findById(req.params.id)
      .populate('product')
      .populate('material');

    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    // Ownership check (or admin)
    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this design' });
    }

    res.json({ success: true, data: design });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDesign = async (req, res) => {
  try {
    const {
      productId,
      name,
      dimensions,
      materialId,
      materialThickness,
      color,
      finish,
      printing,
      additionalFeatures,
      artwork,
      quantity = 250,
    } = req.body;

    const product = await PackagingProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Packaging product not found' });
    }

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Authoritative estimate calculation for snapshot
    let rule = await PricingRule.findOne({ product: product._id, isActive: true }) || await PricingRule.findOne({ isActive: true });
    const estimate = calculatePackagingEstimate({
      product,
      dimensions,
      material,
      materialThickness,
      finish,
      printing,
      additionalFeatures,
      quantity,
      pricingRule: rule,
    });

    const newDesign = await PackagingDesign.create({
      user: req.user._id,
      product: product._id,
      name: name || `${product.name} Customization`,
      dimensions,
      material: material._id,
      materialThickness,
      color: color || { name: 'Natural Kraft', hex: '#c99e6b' },
      finish: finish || 'matte',
      printing: printing || 'none',
      additionalFeatures: additionalFeatures || [],
      artwork: artwork || {},
      quantity,
      costEstimateSnapshot: estimate,
    });

    const populated = await PackagingDesign.findById(newDesign._id)
      .populate('product')
      .populate('material');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDesign = async (req, res) => {
  try {
    const design = await PackagingDesign.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const {
      name,
      dimensions,
      materialId,
      materialThickness,
      color,
      finish,
      printing,
      additionalFeatures,
      artwork,
      quantity,
    } = req.body;

    if (name) design.name = name;
    if (dimensions) design.dimensions = dimensions;
    if (materialId) design.material = materialId;
    if (materialThickness) design.materialThickness = materialThickness;
    if (color) design.color = color;
    if (finish) design.finish = finish;
    if (printing) design.printing = printing;
    if (additionalFeatures) design.additionalFeatures = additionalFeatures;
    if (artwork) design.artwork = artwork;
    if (quantity) design.quantity = quantity;

    // Recalculate authoritative estimate snapshot
    const product = await PackagingProduct.findById(design.product);
    const material = await Material.findById(design.material);
    const rule = await PricingRule.findOne({ product: product._id, isActive: true }) || await PricingRule.findOne({ isActive: true });

    design.costEstimateSnapshot = calculatePackagingEstimate({
      product,
      dimensions: design.dimensions,
      material,
      materialThickness: design.materialThickness,
      finish: design.finish,
      printing: design.printing,
      additionalFeatures: design.additionalFeatures,
      quantity: design.quantity,
      pricingRule: rule,
    });

    await design.save();

    const populated = await PackagingDesign.findById(design._id)
      .populate('product')
      .populate('material');

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateDesign = async (req, res) => {
  try {
    const original = await PackagingDesign.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original design not found' });
    }

    if (original.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const duplicate = await PackagingDesign.create({
      user: req.user._id,
      product: original.product,
      name: `Copy of ${original.name}`,
      dimensions: original.dimensions,
      material: original.material,
      materialThickness: original.materialThickness,
      color: original.color,
      finish: original.finish,
      printing: original.printing,
      additionalFeatures: original.additionalFeatures,
      artwork: original.artwork,
      quantity: original.quantity,
      costEstimateSnapshot: original.costEstimateSnapshot,
    });

    const populated = await PackagingDesign.findById(duplicate._id)
      .populate('product')
      .populate('material');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDesign = async (req, res) => {
  try {
    const design = await PackagingDesign.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await design.deleteOne();
    res.json({ success: true, message: 'Design deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
