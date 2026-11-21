import { PackagingProduct } from '../models/PackagingProduct.js';
import { Material } from '../models/Material.js';

export const getPackagingList = async (req, res) => {
  try {
    const { category, packagingType, search, material, sort = 'featured', limit = 20, page = 1 } = req.query;

    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (packagingType && packagingType !== 'all') {
      query.packagingType = packagingType;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { targetIndustries: { $regex: search, $options: 'i' } },
      ];
    }

    if (material) {
      const mat = await Material.findOne({ code: material });
      if (mat) {
        query.supportedMaterials = mat._id;
      }
    }

    let sortOption = { featured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { baseStartingPrice: 1 };
    if (sort === 'price_desc') sortOption = { baseStartingPrice: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      PackagingProduct.find(query)
        .populate('supportedMaterials')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      PackagingProduct.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPackagingBySlug = async (req, res) => {
  try {
    const product = await PackagingProduct.findOne({ slug: req.params.slug })
      .populate('supportedMaterials');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Packaging product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ isAvailable: true });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPackagingCategories = async (req, res) => {
  try {
    const categories = await PackagingProduct.distinct('category', { isPublished: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
