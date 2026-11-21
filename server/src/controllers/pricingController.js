import { PackagingProduct } from '../models/PackagingProduct.js';
import { Material } from '../models/Material.js';
import { PricingRule } from '../models/PricingRule.js';
import { calculatePackagingEstimate } from '../services/pricingEngine.js';

export const getEstimate = async (req, res) => {
  try {
    const {
      productId,
      productSlug,
      dimensions,
      materialId,
      materialCode,
      materialThickness,
      finish = 'matte',
      printing = 'none',
      additionalFeatures = [],
      quantity = 250,
    } = req.body;

    // 1. Resolve Product
    let product;
    if (productId) {
      product = await PackagingProduct.findById(productId);
    } else if (productSlug) {
      product = await PackagingProduct.findOne({ slug: productSlug });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Packaging product not found' });
    }

    // 2. Validate Dimensions
    const { length, width, height } = dimensions || {};
    const l = Number(length);
    const w = Number(width);
    const h = Number(height);

    if (!l || !w || !h || l < 10 || w < 10 || h < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dimensions. Length, width, and height must be positive values in mm.',
      });
    }

    // Check bounds
    if (
      l < product.dimensions.minL ||
      l > product.dimensions.maxL ||
      w < product.dimensions.minW ||
      w > product.dimensions.maxW ||
      h < product.dimensions.minH ||
      h > product.dimensions.maxH
    ) {
      return res.status(400).json({
        success: false,
        message: `Dimensions outside supported range. L: [${product.dimensions.minL}-${product.dimensions.maxL}], W: [${product.dimensions.minW}-${product.dimensions.maxW}], H: [${product.dimensions.minH}-${product.dimensions.maxH}] mm.`,
      });
    }

    // 3. Resolve Material
    let material;
    if (materialId) {
      material = await Material.findById(materialId);
    } else if (materialCode) {
      material = await Material.findOne({ code: materialCode });
    } else if (product.supportedMaterials && product.supportedMaterials.length > 0) {
      material = await Material.findById(product.supportedMaterials[0]);
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Specified material option not found' });
    }

    // 4. Validate quantity
    const qty = Math.max(product.minOrderQuantity || 50, Number(quantity) || 100);

    // 5. Look for specific PricingRule or active default
    let rule = await PricingRule.findOne({ product: product._id, isActive: true });
    if (!rule) {
      rule = await PricingRule.findOne({ isActive: true });
    }

    // 6. Compute authoritative estimate
    const estimate = calculatePackagingEstimate({
      product,
      dimensions: { length: l, width: w, height: h },
      material,
      materialThickness: materialThickness || material.thicknessOptions?.[0]?.value,
      finish,
      printing,
      additionalFeatures,
      quantity: qty,
      pricingRule: rule,
    });

    res.json({
      success: true,
      data: {
        ...estimate,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          packagingType: product.packagingType,
        },
        material: {
          _id: material._id,
          name: material.name,
          code: material.code,
        },
      },
    });
  } catch (error) {
    console.error('[Pricing Estimate Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
