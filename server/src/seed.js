import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Material } from './models/Material.js';
import { PackagingProduct } from './models/PackagingProduct.js';
import { PricingRule } from './models/PricingRule.js';
import { PackagingDesign } from './models/PackagingDesign.js';
import { Quotation } from './models/Quotation.js';
import { Order } from './models/Order.js';
import { OrderActivity } from './models/OrderActivity.js';
import { calculatePackagingEstimate } from './services/pricingEngine.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/packcraft';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed]: Connected to MongoDB. Resetting collections...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Material.deleteMany({}),
      PackagingProduct.deleteMany({}),
      PricingRule.deleteMany({}),
      PackagingDesign.deleteMany({}),
      Quotation.deleteMany({}),
      Order.deleteMany({}),
      OrderActivity.deleteMany({}),
    ]);

    console.log('[Seed]: Cleared existing records.');

    // -------------------------------------------------------------
    // 1. Create Users
    // -------------------------------------------------------------
    const adminUser = await User.create({
      name: 'PackCraft Industrial Admin',
      email: 'admin@packcraft.com',
      password: 'admin123',
      companyName: 'PackCraft Manufacturing HQ',
      phone: '+1 (555) 019-2834',
      role: 'admin',
    });

    const elenaCustomer = await User.create({
      name: 'Elena Rostova',
      email: 'elena@luminarybotanicals.com',
      password: 'customer123',
      companyName: 'Luminary Botanicals D2C',
      phone: '+1 (555) 782-9011',
      role: 'customer',
    });

    const marcusCustomer = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@apexroasters.com',
      password: 'customer123',
      companyName: 'Apex Artisan Coffee Roasters',
      phone: '+1 (555) 438-1920',
      role: 'customer',
    });

    const sarahCustomer = await User.create({
      name: 'Sarah Lin',
      email: 'sarah@aetheraudio.io',
      password: 'customer123',
      companyName: 'Aether Acoustics Labs',
      phone: '+1 (555) 621-8840',
      role: 'customer',
    });

    const devonCustomer = await User.create({
      name: 'Devon Reed',
      email: 'devon@solariaglow.co',
      password: 'customer123',
      companyName: 'Solaria Clean Skincare',
      phone: '+1 (555) 902-3371',
      role: 'customer',
    });

    console.log('[Seed]: Created Admin and 4 Customer accounts.');

    // -------------------------------------------------------------
    // 2. Create Materials
    // -------------------------------------------------------------
    const materialsData = [
      {
        name: 'Natural Kraft Corrugated Board',
        code: 'kraft_natural_flute',
        category: 'corrugated',
        description: 'Eco-friendly unbleached natural brown kraft with fluted structural core. Superb crush resistance and sustainable rustic presentation.',
        thicknessOptions: [
          { label: 'E-Flute (1.5mm / 350 GSM) - Sleek Mailer', value: 'e_flute_15', caliperMm: 1.5, gsm: 350, costMultiplier: 1.0 },
          { label: 'B-Flute (3.0mm / 450 GSM) - Standard Shipping', value: 'b_flute_30', caliperMm: 3.0, gsm: 450, costMultiplier: 1.15 },
          { label: 'C-Flute (4.0mm / 550 GSM) - Heavy Duty', value: 'c_flute_40', caliperMm: 4.0, gsm: 550, costMultiplier: 1.28 },
        ],
        baseCostPerSqMeter: 1.45,
        supportedPackagingTypes: ['mailer', 'shipping_box'],
        colorPresets: [
          { name: 'Natural Kraft', hex: '#c89d6c', description: 'Raw unbleached fibrous earth tone' },
          { name: 'Warm Terracotta', hex: '#b86d4e', description: 'Sun-baked warm clay tone' },
          { name: 'Deep Forest', hex: '#263b2f', description: 'Organic botanical dark green' },
          { name: 'Industrial Black', hex: '#242526', description: 'Premium screenprinted black' },
        ],
        ecoCertifications: ['FSC Certified 100%', 'Plastic-Free Recyclable', 'Biodegradable Compostable'],
      },
      {
        name: 'Bleached White Corrugated Board',
        code: 'white_bleached_flute',
        category: 'corrugated',
        description: 'Smooth bleached white top sheet over sturdy fluted kraft corrugation. High-contrast canvas for vibrant CMYK direct-to-board digital printing.',
        thicknessOptions: [
          { label: 'E-Flute White (1.5mm / 360 GSM)', value: 'e_flute_white_15', caliperMm: 1.5, gsm: 360, costMultiplier: 1.12 },
          { label: 'B-Flute White (3.0mm / 480 GSM)', value: 'b_flute_white_30', caliperMm: 3.0, gsm: 480, costMultiplier: 1.25 },
        ],
        baseCostPerSqMeter: 1.75,
        supportedPackagingTypes: ['mailer', 'shipping_box'],
        colorPresets: [
          { name: 'Bright Pure White', hex: '#fcfbfa', description: 'High-brightness uncoated crisp white' },
          { name: 'Minimalist Ivory', hex: '#f5f0e8', description: 'Soft warm natural cream' },
          { name: 'Soft Sage', hex: '#cfded5', description: 'Calming modern herbal tint' },
        ],
        ecoCertifications: ['FSC Certified', 'Recyclable Curbside'],
      },
      {
        name: 'SBS Solid Bleached Sulfate Paperboard',
        code: 'sbs_paperboard',
        category: 'paperboard',
        description: 'Virgin bleached wood pulp folding boxboard coated for ultra-crisp offset printing, sharp crease lines, and luxury cosmetic retail aesthetics.',
        thicknessOptions: [
          { label: '18 pt SBS (350 GSM) - Light Retail', value: 'sbs_18pt', caliperMm: 0.45, gsm: 350, costMultiplier: 1.0 },
          { label: '24 pt SBS (450 GSM) - Standard Folding Carton', value: 'sbs_24pt', caliperMm: 0.60, gsm: 450, costMultiplier: 1.18 },
          { label: '28 pt SBS (520 GSM) - Heavy Duty Retail', value: 'sbs_28pt', caliperMm: 0.71, gsm: 520, costMultiplier: 1.32 },
        ],
        baseCostPerSqMeter: 1.85,
        supportedPackagingTypes: ['folding_carton', 'sleeve'],
        colorPresets: [
          { name: 'Cosmetic Pearl White', hex: '#ffffff', description: 'High-gloss coated white' },
          { name: 'Midnight Charcoal', hex: '#1c1d1f', description: 'Deep obsidian silk touch' },
          { name: 'Champagne Nude', hex: '#ebdccc', description: 'Delicate beauty luxury pastel' },
          { name: 'Coral Rose', hex: '#e8a598', description: 'Vibrant modern cosmetic coral' },
        ],
        ecoCertifications: ['FSC Mixed Sources', 'SFI Certified'],
      },
      {
        name: 'Dense Rigid Greyboard with Wrapped Art Paper',
        code: 'rigid_greyboard_wrap',
        category: 'rigid',
        description: 'Solid unbendable recycled chipboard wrapped seamlessly with 157 GSM matte or tactile embossed specialty paper for prestige unboxing experiences.',
        thicknessOptions: [
          { label: '1.8 mm (1200 GSM) Greyboard Core', value: 'rigid_18mm', caliperMm: 1.8, gsm: 1200, costMultiplier: 1.0 },
          { label: '2.5 mm (1600 GSM) Luxury Heavyweight Core', value: 'rigid_25mm', caliperMm: 2.5, gsm: 1600, costMultiplier: 1.35 },
        ],
        baseCostPerSqMeter: 3.20,
        supportedPackagingTypes: ['rigid_box'],
        colorPresets: [
          { name: 'Obsidian Matte Black', hex: '#141415', description: 'Ultra-matte velvety dark wrap' },
          { name: 'Executive Navy', hex: '#1b263b', description: 'Prestige corporate midnight' },
          { name: 'Pure White Linen', hex: '#f9f9f9', description: 'Crisp woven linen wrapped texture' },
          { name: 'Espresso Bronze', hex: '#3d2b1f', description: 'Deep artisanal chocolate brown' },
          { name: 'Platinum Silver', hex: '#c5cad0', description: 'Cool metallic executive sheen' },
        ],
        ecoCertifications: ['100% Recycled Greyboard Core', 'FSC Wrapped Liner'],
      },
      {
        name: 'High-Tensile Recycled Kraft Paper',
        code: 'recycled_kraft_bag',
        category: 'bag_kraft',
        description: 'Durable long-fiber Virgin and Post-Consumer recycled kraft engineered for tear resistance with reinforced serrated top turn and twisted paper handles.',
        thicknessOptions: [
          { label: '120 GSM Natural Kraft Paper', value: 'bag_120gsm', caliperMm: 0.16, gsm: 120, costMultiplier: 1.0 },
          { label: '160 GSM Heavy Duty Boutique Kraft', value: 'bag_160gsm', caliperMm: 0.22, gsm: 160, costMultiplier: 1.25 },
        ],
        baseCostPerSqMeter: 0.95,
        supportedPackagingTypes: ['paper_bag'],
        colorPresets: [
          { name: 'Natural Earth Kraft', hex: '#c59d6a', description: 'Classic retail grocery/boutique brown' },
          { name: 'Bleached Arctic White', hex: '#faf7f2', description: 'Clean modern shopping white' },
          { name: 'Matte Olive Green', hex: '#3e4a3b', description: 'Sophisticated botanical earthy olive' },
          { name: 'Warm Terracotta', hex: '#b35d3d', description: 'Fashion lifestyle warm terra' },
        ],
        ecoCertifications: ['100% Post-Consumer Recycled', 'Compostable', 'Ocean Friendly'],
      },
      {
        name: 'All-Black Dyed Corrugated Board',
        code: 'black_corrugated_flute',
        category: 'corrugated',
        description: 'Solid dyed-through core black fluting and double black linerboard. No white or kraft edges when cut—engineered for sleek tech and street fashion.',
        thicknessOptions: [
          { label: 'E-Flute Black (1.5mm / 380 GSM)', value: 'e_flute_black_15', caliperMm: 1.5, gsm: 380, costMultiplier: 1.30 },
          { label: 'B-Flute Black (3.0mm / 500 GSM)', value: 'b_flute_black_30', caliperMm: 3.0, gsm: 500, costMultiplier: 1.45 },
        ],
        baseCostPerSqMeter: 2.10,
        supportedPackagingTypes: ['mailer', 'shipping_box'],
        colorPresets: [
          { name: 'Matte Pitch Black', hex: '#161618', description: 'Uniform deep matte carbon' },
          { name: 'Smoky Charcoal', hex: '#2b2c2f', description: 'Subtle industrial dark slate' },
        ],
        ecoCertifications: ['FSC Certified', 'Non-Toxic Water Inks'],
      },
    ];

    const insertedMaterials = await Material.insertMany(materialsData);
    console.log(`[Seed]: Inserted ${insertedMaterials.length} packaging materials.`);

    const matMap = {};
    insertedMaterials.forEach((m) => {
      matMap[m.code] = m._id;
    });

    // -------------------------------------------------------------
    // 3. Create Packaging Products
    // -------------------------------------------------------------
    const productsData = [
      {
        name: 'Roll-End Tuck Front (RETF) Custom Mailer Box',
        slug: 'custom-mailer-box',
        category: 'Mailer Boxes',
        packagingType: 'mailer',
        description: 'The industry-standard e-commerce unboxing box. Features front tuck flaps that click securely into side roll walls without needing adhesive tape. Ideal for subscription boxes, direct-to-consumer apparel, cosmetics, and electronics.',
        shortDescription: 'Self-locking e-commerce mailer with double-wall crush protection.',
        featured: true,
        dimensions: {
          minL: 120, maxL: 450, defaultL: 260,
          minW: 100, maxW: 350, defaultW: 200,
          minH: 40, maxH: 160, defaultH: 80,
          unit: 'mm',
        },
        supportedMaterials: [matMap.kraft_natural_flute, matMap.white_bleached_flute, matMap.black_corrugated_flute],
        supportedFinishes: [
          { code: 'matte', name: 'Matte Lamination / Varnish', description: 'Non-reflective tactile soft finish', surchargePerUnit: 0.15 },
          { code: 'gloss', name: 'Gloss UV Coat', description: 'Lustrous high-shine protective coating', surchargePerUnit: 0.18 },
          { code: 'soft_touch', name: 'Soft-Touch Velvet Touch', description: 'Ultra-luxurious suede-like hand feel', surchargePerUnit: 0.35 },
          { code: 'uncoated', name: 'Natural Raw Texture', description: 'Subtle bare board fiber texture', surchargePerUnit: 0.0 },
        ],
        printingOptions: [
          { code: 'none', name: 'Plain (No Printing)', description: 'Clean unprinted raw industrial board', sides: 'none' },
          { code: '1_color_outside', name: '1-Color Exterior Screen/Flexo', description: 'High contrast single-ink branding on exterior', sides: 'outside' },
          { code: 'full_color_outside', name: 'Full-Color CMYK Exterior', description: 'High-definition full-coverage exterior digital/litho print', sides: 'outside' },
          { code: 'full_color_both', name: 'Full-Color Inside & Outside', description: 'Complete 360° unboxing reveal on both outer and inner lid', sides: 'both' },
        ],
        additionalFeatures: [
          { code: 'window_cutout', name: 'Die-Cut Product Window', description: 'Display window to showcase internal product', unitCost: 0.14, setupCost: 30 },
          { code: 'custom_insert', name: 'Custom Flute Fitment Insert', description: 'Precision die-cut tray holding jars or bottles in place', unitCost: 0.38, setupCost: 45 },
          { code: 'tear_strip', name: 'Tamper-Evident Easy Tear Strip', description: 'Pull tab for effortless zip opening without scissors', unitCost: 0.09, setupCost: 20 },
        ],
        minOrderQuantity: 50,
        maxOrderQuantity: 25000,
        leadTimeDays: 7,
        baseStartingPrice: 1.15,
        images: [
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80',
        ],
        modelType: 'mailer',
        isPublished: true,
        targetIndustries: ['D2C Brands', 'E-commerce', 'Beauty & Cosmetics', 'Electronics', 'Apparel'],
      },
      {
        name: 'Straight Tuck-End Folding Carton',
        slug: 'folding-carton-box',
        category: 'Folding Cartons',
        packagingType: 'folding_carton',
        description: 'Compact high-definition paperboard retail carton with tuck-in flaps. Lightweight, razor-sharp edge definition, and optimal retail shelf footprint. Excellent for perfume bottles, creams, pharmaceuticals, gourmet tea, and tech accessories.',
        shortDescription: 'Precision retail boxboard carton for cosmetics and retail shelves.',
        featured: true,
        dimensions: {
          minL: 40, maxL: 220, defaultL: 90,
          minW: 40, maxW: 180, defaultW: 90,
          minH: 60, maxH: 300, defaultH: 150,
          unit: 'mm',
        },
        supportedMaterials: [matMap.sbs_paperboard],
        supportedFinishes: [
          { code: 'matte', name: 'Matte Aqueous Finish', description: 'Refined smooth anti-glare finish', surchargePerUnit: 0.10 },
          { code: 'gloss', name: 'High-Gloss UV Varnish', description: 'Vibrant punchy retail gloss', surchargePerUnit: 0.12 },
          { code: 'soft_touch', name: 'Silk Soft Touch', description: 'Silky tactile sensory coating', surchargePerUnit: 0.25 },
          { code: 'uv_spot', name: 'Spot Gloss UV Foil Highlight', description: 'High-build gloss lacquer on logo & accents', surchargePerUnit: 0.32 },
        ],
        printingOptions: [
          { code: 'none', name: 'Unprinted White Stock', description: 'Clean white boxboard', sides: 'none' },
          { code: '1_color_outside', name: '1-Color Monochrome Offset', description: 'Crisp black or single Pantone print', sides: 'outside' },
          { code: 'full_color_outside', name: 'Full-Color CMYK + Pantone', description: 'Vibrant multi-color photo-realistic exterior', sides: 'outside' },
          { code: 'full_color_both', name: '2-Sided Full Color (Inside & Out)', description: 'Patterned surprise interior with branded exterior', sides: 'both' },
        ],
        additionalFeatures: [
          { code: 'window_cutout', name: 'Acetate Clear View Window', description: 'Clear PET film window to inspect contents', unitCost: 0.16, setupCost: 35 },
          { code: 'custom_insert', name: 'Folded Paperboard Collar', description: 'Internal platform holding perfume or dropper bottle upright', unitCost: 0.24, setupCost: 30 },
        ],
        minOrderQuantity: 100,
        maxOrderQuantity: 50000,
        leadTimeDays: 8,
        baseStartingPrice: 0.65,
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1527632984437-087093d93708?auto=format&fit=crop&w=1000&q=80',
        ],
        modelType: 'folding_carton',
        isPublished: true,
        targetIndustries: ['Cosmetics & Skincare', 'Perfumes', 'Vitamins & Health', 'Gourmet Food', 'Jewelry'],
      },
      {
        name: 'Luxury 2-Piece Rigid Setup Box',
        slug: 'luxury-rigid-box',
        category: 'Rigid Boxes',
        packagingType: 'rigid_box',
        description: 'The pinnacle of luxury packaging. Built from solid unbendable 1.8mm greyboard wrapped in fine artisan paper with a distinct lift-off lid and base tray. Creates a memorable slow-draw suction opening experience.',
        shortDescription: 'Heavyweight unbendable setup box with lift-off lid for prestige goods.',
        featured: true,
        dimensions: {
          minL: 100, maxL: 380, defaultL: 220,
          minW: 80, maxW: 300, defaultW: 160,
          minH: 35, maxH: 140, defaultH: 70,
          unit: 'mm',
        },
        supportedMaterials: [matMap.rigid_greyboard_wrap],
        supportedFinishes: [
          { code: 'matte', name: 'Matte Wrapped Paper', description: 'Sophisticated matte fine paper wrap', surchargePerUnit: 0.20 },
          { code: 'soft_touch', name: 'Velvet Soft Touch Coating', description: 'Deep sensory feel like premium suede', surchargePerUnit: 0.45 },
          { code: 'uv_spot', name: 'Metallic Foil & Spot UV', description: 'Raised metallic gold/silver foil stamping', surchargePerUnit: 0.55 },
        ],
        printingOptions: [
          { code: 'none', name: 'Unprinted Artisan Wrap', description: 'Solid dyed luxury paper finish', sides: 'none' },
          { code: '1_color_outside', name: 'Hot Foil Stamped / 1-Color Logo', description: 'Sharp metallic or monochrome brand badge on lid', sides: 'outside' },
          { code: 'full_color_outside', name: 'Full-Color Art Wrap (Lid & Base)', description: 'Completely customized high-resolution wrapped graphics', sides: 'outside' },
          { code: 'full_color_both', name: 'Full Custom Interior Tray & Wrap', description: 'Lined luxury interior with matching custom exterior', sides: 'both' },
        ],
        additionalFeatures: [
          { code: 'custom_insert', name: 'High-Density EVA Velvet Foam Insert', description: 'Custom laser-cut velvet topped foam bed', unitCost: 0.95, setupCost: 55 },
          { code: 'magnetic_closure', name: 'Concealed Rare-Earth Magnets', description: 'Click-shut magnetic lip integration', unitCost: 0.48, setupCost: 40 },
        ],
        minOrderQuantity: 50,
        maxOrderQuantity: 15000,
        leadTimeDays: 14,
        baseStartingPrice: 3.40,
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
        ],
        modelType: 'rigid_box',
        isPublished: true,
        targetIndustries: ['Luxury Goods', 'Watches & Jewelry', 'Premium Spirits', 'Smartphones', 'VIP Gift Sets'],
      },
      {
        name: 'Regular Slotted Container (RSC) Shipping Box',
        slug: 'shipping-box-rsc',
        category: 'Shipping Boxes',
        packagingType: 'shipping_box',
        description: 'Heavyweight master shipping carton engineered to withstand transit drops, stacking weight, and courier handling. Top and bottom flaps meet at the center seam for fast automated or manual tape sealing.',
        shortDescription: 'Industrial corrugated transit shipper with high edge crush test (ECT).',
        featured: false,
        dimensions: {
          minL: 180, maxL: 600, defaultL: 350,
          minW: 150, maxW: 450, defaultW: 280,
          minH: 100, maxH: 450, defaultH: 220,
          unit: 'mm',
        },
        supportedMaterials: [matMap.kraft_natural_flute, matMap.white_bleached_flute, matMap.black_corrugated_flute],
        supportedFinishes: [
          { code: 'uncoated', name: 'Industrial Water-Resistant Uncoated', description: 'Tough raw outer linerboard', surchargePerUnit: 0.0 },
          { code: 'matte', name: 'Matte Moisture-Barrier Sealer', description: 'Light sealer guarding against humidity', surchargePerUnit: 0.12 },
        ],
        printingOptions: [
          { code: 'none', name: 'Plain Transit Shipper', description: 'Unprinted kraft corrugated', sides: 'none' },
          { code: '1_color_outside', name: '1-Color Brand & Fragile Symbols', description: 'Clean black flexographic industrial mark', sides: 'outside' },
          { code: 'full_color_outside', name: 'Full-Color Exterior Branded Shipper', description: 'Stand out in carrier hubs and doorstep deliveries', sides: 'outside' },
        ],
        additionalFeatures: [
          { code: 'tear_strip', name: 'Reinforced Hand Holes (Grip Cutouts)', description: 'Oval carry handles punched on opposite sides', unitCost: 0.12, setupCost: 25 },
        ],
        minOrderQuantity: 50,
        maxOrderQuantity: 50000,
        leadTimeDays: 6,
        baseStartingPrice: 1.45,
        images: [
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80',
        ],
        modelType: 'shipping_box',
        isPublished: true,
        targetIndustries: ['Logistics', 'Wholesale Warehousing', 'Direct Bulk Fulfillment', 'Hardware'],
      },
      {
        name: 'Gusseted Kraft Boutique Shopping Bag',
        slug: 'kraft-paper-bag',
        category: 'Paper Bags',
        packagingType: 'paper_bag',
        description: 'Eco-conscious retail paper shopping bag with side gussets, broad block bottom for upright standing, and twisted kraft paper cord handles. Reusable and 100% curbside recyclable.',
        shortDescription: 'Sustainable boutique retail bag with twisted kraft paper handles.',
        featured: true,
        dimensions: {
          minL: 140, maxL: 420, defaultL: 240,
          minW: 70, maxW: 200, defaultW: 110,
          minH: 180, maxH: 500, defaultH: 310,
          unit: 'mm',
        },
        supportedMaterials: [matMap.recycled_kraft_bag],
        supportedFinishes: [
          { code: 'uncoated', name: 'Natural Earthy Paper Texture', description: 'Pleasant tactile fiber finish', surchargePerUnit: 0.0 },
          { code: 'matte', name: 'Matte protective varnish', description: 'Protects inks from rain and handling scuffs', surchargePerUnit: 0.08 },
        ],
        printingOptions: [
          { code: 'none', name: 'Plain Brown / White Kraft', description: 'Unprinted minimalist bag', sides: 'none' },
          { code: '1_color_outside', name: '1-Color 2-Sided Brand Print', description: 'Bold logo printed on front & back faces', sides: 'outside' },
          { code: 'full_color_outside', name: 'Full-Coverage Edge-to-Edge CMYK', description: 'Full colored artwork covering all 4 faces and gussets', sides: 'outside' },
        ],
        additionalFeatures: [
          { code: 'rope_handle', name: 'Woven Cotton Rope Handles', description: 'Upgrade twisted paper to soft braided cotton cords', unitCost: 0.28, setupCost: 20 },
        ],
        minOrderQuantity: 150,
        maxOrderQuantity: 100000,
        leadTimeDays: 7,
        baseStartingPrice: 0.55,
        images: [
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
        ],
        modelType: 'paper_bag',
        isPublished: true,
        targetIndustries: ['Retail Boutiques', 'Apparel & Footwear', 'Gourmet Bakeries', 'Events & Popups'],
      },
      {
        name: 'Custom Product Slide Sleeve (Belly Band)',
        slug: 'product-slide-sleeve',
        category: 'Product Sleeves',
        packagingType: 'sleeve',
        description: 'Open-ended sliding band engineered to slide smoothly over stock boxes, tins, plastic clamshells, or apparel. Gives instant custom branding without the cost of full custom box tooling.',
        shortDescription: 'Cost-effective slide-on branding band for stock containers.',
        featured: false,
        dimensions: {
          minL: 60, maxL: 320, defaultL: 180,
          minW: 50, maxW: 240, defaultW: 130,
          minH: 25, maxH: 120, defaultH: 50,
          unit: 'mm',
        },
        supportedMaterials: [matMap.sbs_paperboard],
        supportedFinishes: [
          { code: 'matte', name: 'Smooth Matte Sealer', description: 'Clean smooth finish', surchargePerUnit: 0.06 },
          { code: 'gloss', name: 'Lacquered High Gloss', description: 'Reflective shine', surchargePerUnit: 0.08 },
          { code: 'soft_touch', name: 'Velvet Soft-Touch', description: 'Pleasant tactile grip', surchargePerUnit: 0.18 },
        ],
        printingOptions: [
          { code: 'none', name: 'Plain Unprinted Sleeve', description: 'Blank white slip cover', sides: 'none' },
          { code: '1_color_outside', name: '1-Color Minimalist Typography', description: 'Clean modern brand band', sides: 'outside' },
          { code: 'full_color_outside', name: 'Full-Color Photographic CMYK', description: 'Rich vibrant full surface print', sides: 'outside' },
        ],
        additionalFeatures: [
          { code: 'window_cutout', name: 'Custom Contour Die-Cut Window', description: 'Specialty cutout exposing product color underneath', unitCost: 0.10, setupCost: 25 },
        ],
        minOrderQuantity: 100,
        maxOrderQuantity: 50000,
        leadTimeDays: 5,
        baseStartingPrice: 0.35,
        images: [
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80',
        ],
        modelType: 'sleeve',
        isPublished: true,
        targetIndustries: ['Cosmetics', 'Prepared Gourmet Foods', 'Textiles', 'Soaps & Candles'],
      },
    ];

    const insertedProducts = await PackagingProduct.insertMany(productsData);
    console.log(`[Seed]: Inserted ${insertedProducts.length} packaging products.`);

    const prodMap = {};
    insertedProducts.forEach((p) => {
      prodMap[p.slug] = p;
    });

    // -------------------------------------------------------------
    // 4. Create Global Pricing Rule
    // -------------------------------------------------------------
    const globalPricingRule = await PricingRule.create({
      name: 'Global Industrial Manufacturing Rule v1',
      product: null,
      baseDieCutSetup: 45.0,
      printingSetupFees: {
        none: 0,
        '1_color_outside': 35,
        'full_color_outside': 65,
        'full_color_both': 110,
      },
      printRatePerSqMeter: {
        none: 0,
        '1_color_outside': 0.85,
        'full_color_outside': 1.75,
        'full_color_both': 3.10,
      },
      finishCostPerSqMeter: {
        uncoated: 0,
        matte: 0.45,
        gloss: 0.50,
        soft_touch: 0.90,
        uv_spot: 1.25,
      },
      wasteAllowancePercentage: 8,
      quantityTiers: [
        { minQty: 50, maxQty: 249, discountMultiplier: 1.0, label: 'Pilot Run (50-249)' },
        { minQty: 250, maxQty: 499, discountMultiplier: 0.88, label: 'Small Batch (250-499)' },
        { minQty: 500, maxQty: 999, discountMultiplier: 0.76, label: 'Mid Batch (500-999)' },
        { minQty: 1000, maxQty: 2499, discountMultiplier: 0.64, label: 'Standard Production (1000-2499)' },
        { minQty: 2500, maxQty: 9999, discountMultiplier: 0.52, label: 'High Volume (2500-9999)' },
        { minQty: 10000, maxQty: 100000, discountMultiplier: 0.40, label: 'Enterprise Bulk (10000+)' },
      ],
      taxRatePercentage: 5.0,
      isActive: true,
      notes: 'Calibrated industrial scale cost engine accounting for board caliper, machine die cuts, multi-pass press setups and tiered volume discounts.',
    });

    console.log('[Seed]: Created Global Pricing Rule.');

    // -------------------------------------------------------------
    // 5. Helper function to create Design, Quotation and Order
    // -------------------------------------------------------------
    const createEstimate = (product, dimensions, material, thickness, finish, printing, features, quantity) => {
      return calculatePackagingEstimate({
        product,
        dimensions,
        material,
        materialThickness: thickness,
        finish,
        printing,
        additionalFeatures: features,
        quantity,
        pricingRule: globalPricingRule,
      });
    };

    // Material references
    const matKraft = insertedMaterials.find((m) => m.code === 'kraft_natural_flute');
    const matWhite = insertedMaterials.find((m) => m.code === 'white_bleached_flute');
    const matSBS = insertedMaterials.find((m) => m.code === 'sbs_paperboard');
    const matRigid = insertedMaterials.find((m) => m.code === 'rigid_greyboard_wrap');
    const matBag = insertedMaterials.find((m) => m.code === 'recycled_kraft_bag');
    const matBlack = insertedMaterials.find((m) => m.code === 'black_corrugated_flute');

    // -------------------------------------------------------------
    // 6. Create Designs
    // -------------------------------------------------------------
    const designsData = [
      // 1. Elena - Mailer Box
      {
        user: elenaCustomer._id,
        product: prodMap['custom-mailer-box']._id,
        name: 'Luminary Botanicals - Autumn PR Unboxing Kit',
        dimensions: { length: 280, width: 200, height: 90, unit: 'mm' },
        material: matKraft._id,
        materialThickness: 'e_flute_15',
        color: { name: 'Natural Kraft', hex: '#c89d6c' },
        finish: 'matte',
        printing: 'full_color_outside',
        additionalFeatures: ['tear_strip'],
        artwork: {
          logoUrl: '',
          brandText: 'LUMINARY BOTANICALS',
          placement: 'top',
          patternType: 'minimal_dots',
          artworkColor: '#1b3a2e',
          scale: 1.1,
        },
        quantity: 500,
        prodRef: prodMap['custom-mailer-box'],
        matRef: matKraft,
      },
      // 2. Elena - Folding Carton
      {
        user: elenaCustomer._id,
        product: prodMap['folding-carton-box']._id,
        name: 'Luminary Serenity Night Serum Dropper Carton',
        dimensions: { length: 65, width: 65, height: 160, unit: 'mm' },
        material: matSBS._id,
        materialThickness: 'sbs_24pt',
        color: { name: 'Champagne Nude', hex: '#ebdccc' },
        finish: 'soft_touch',
        printing: 'full_color_both',
        additionalFeatures: ['custom_insert'],
        artwork: {
          logoUrl: '',
          brandText: 'LUMINARY SERENITY',
          placement: 'front',
          patternType: 'diagonal_stripes',
          artworkColor: '#2d3e34',
          scale: 1.0,
        },
        quantity: 1500,
        prodRef: prodMap['folding-carton-box'],
        matRef: matSBS,
      },
      // 3. Elena - Paper Bag
      {
        user: elenaCustomer._id,
        product: prodMap['kraft-paper-bag']._id,
        name: 'Luminary Flagship Store Boutique Shopper',
        dimensions: { length: 260, width: 120, height: 340, unit: 'mm' },
        material: matBag._id,
        materialThickness: 'bag_160gsm',
        color: { name: 'Natural Earth Kraft', hex: '#c59d6a' },
        finish: 'uncoated',
        printing: '1_color_outside',
        additionalFeatures: ['rope_handle'],
        artwork: {
          logoUrl: '',
          brandText: 'LUMINARY BOTANICALS',
          placement: 'front',
          patternType: 'minimal_dots',
          artworkColor: '#1a3327',
          scale: 1.2,
        },
        quantity: 2000,
        prodRef: prodMap['kraft-paper-bag'],
        matRef: matBag,
      },
      // 4. Marcus - Mailer Box
      {
        user: marcusCustomer._id,
        product: prodMap['custom-mailer-box']._id,
        name: 'Apex Reserve Single-Origin 3-Pack Coffee Mailer',
        dimensions: { length: 320, width: 220, height: 95, unit: 'mm' },
        material: matWhite._id,
        materialThickness: 'e_flute_white_15',
        color: { name: 'Bright Pure White', hex: '#fcfbfa' },
        finish: 'matte',
        printing: 'full_color_outside',
        additionalFeatures: ['tear_strip', 'custom_insert'],
        artwork: {
          logoUrl: '',
          brandText: 'APEX ARTISAN ROASTERS',
          placement: 'top',
          patternType: 'geo_grid',
          artworkColor: '#b85d19',
          scale: 1.15,
        },
        quantity: 1000,
        prodRef: prodMap['custom-mailer-box'],
        matRef: matWhite,
      },
      // 5. Marcus - Shipping Box
      {
        user: marcusCustomer._id,
        product: prodMap['shipping-box-rsc']._id,
        name: 'Apex Cold-Brew 12-Pack Heavy Duty Master Shipper',
        dimensions: { length: 420, width: 310, height: 260, unit: 'mm' },
        material: matKraft._id,
        materialThickness: 'c_flute_40',
        color: { name: 'Natural Kraft', hex: '#c89d6c' },
        finish: 'uncoated',
        printing: '1_color_outside',
        additionalFeatures: ['tear_strip'],
        artwork: {
          logoUrl: '',
          brandText: 'APEX ROASTERS SUPPLY',
          placement: 'front',
          patternType: 'none',
          artworkColor: '#1c1c1c',
          scale: 1.0,
        },
        quantity: 1200,
        prodRef: prodMap['shipping-box-rsc'],
        matRef: matKraft,
      },
      // 6. Marcus - Slide Sleeve
      {
        user: marcusCustomer._id,
        product: prodMap['product-slide-sleeve']._id,
        name: 'Apex Nitro Can Collector Belly Band',
        dimensions: { length: 190, width: 140, height: 60, unit: 'mm' },
        material: matSBS._id,
        materialThickness: 'sbs_18pt',
        color: { name: 'Midnight Charcoal', hex: '#1c1d1f' },
        finish: 'soft_touch',
        printing: 'full_color_outside',
        additionalFeatures: ['window_cutout'],
        artwork: {
          logoUrl: '',
          brandText: 'APEX NITRO COLD BREW',
          placement: 'top',
          patternType: 'diagonal_stripes',
          artworkColor: '#e07a2c',
          scale: 0.9,
        },
        quantity: 750,
        prodRef: prodMap['product-slide-sleeve'],
        matRef: matSBS,
      },
      // 7. Sarah - Luxury Rigid Box
      {
        user: sarahCustomer._id,
        product: prodMap['luxury-rigid-box']._id,
        name: 'Aether Pro Spatial Audio Wireless Headphone Case',
        dimensions: { length: 240, width: 200, height: 85, unit: 'mm' },
        material: matRigid._id,
        materialThickness: 'rigid_25mm',
        color: { name: 'Obsidian Matte Black', hex: '#141415' },
        finish: 'soft_touch',
        printing: '1_color_outside',
        additionalFeatures: ['custom_insert', 'magnetic_closure'],
        artwork: {
          logoUrl: '',
          brandText: 'AETHER ACOUSTICS',
          placement: 'top',
          patternType: 'geo_grid',
          artworkColor: '#e0e0e0',
          scale: 1.25,
        },
        quantity: 2500,
        prodRef: prodMap['luxury-rigid-box'],
        matRef: matRigid,
      },
      // 8. Sarah - Folding Carton
      {
        user: sarahCustomer._id,
        product: prodMap['folding-carton-box']._id,
        name: 'Aether Braided DAC Cable Retail Tuck Carton',
        dimensions: { length: 110, width: 35, height: 170, unit: 'mm' },
        material: matSBS._id,
        materialThickness: 'sbs_24pt',
        color: { name: 'Midnight Charcoal', hex: '#1c1d1f' },
        finish: 'matte',
        printing: 'full_color_outside',
        additionalFeatures: ['window_cutout'],
        artwork: {
          logoUrl: '',
          brandText: 'AETHER PRO CABLE',
          placement: 'front',
          patternType: 'none',
          artworkColor: '#3b82f6',
          scale: 1.0,
        },
        quantity: 3500,
        prodRef: prodMap['folding-carton-box'],
        matRef: matSBS,
      },
      // 9. Devon - Folding Carton
      {
        user: devonCustomer._id,
        product: prodMap['folding-carton-box']._id,
        name: 'Solaria Solar Barrier SPF 50 Mineral Cream',
        dimensions: { length: 55, width: 55, height: 140, unit: 'mm' },
        material: matSBS._id,
        materialThickness: 'sbs_24pt',
        color: { name: 'Cosmetic Pearl White', hex: '#ffffff' },
        finish: 'soft_touch',
        printing: 'full_color_both',
        additionalFeatures: ['custom_insert'],
        artwork: {
          logoUrl: '',
          brandText: 'SOLARIA CLEAN SUNCARE',
          placement: 'front',
          patternType: 'minimal_dots',
          artworkColor: '#e06d53',
          scale: 1.1,
        },
        quantity: 5000,
        prodRef: prodMap['folding-carton-box'],
        matRef: matSBS,
      },
      // 10. Devon - Luxury Rigid Box
      {
        user: devonCustomer._id,
        product: prodMap['luxury-rigid-box']._id,
        name: 'Solaria Summer VIP Influencer Unboxing Vault',
        dimensions: { length: 300, width: 220, height: 90, unit: 'mm' },
        material: matRigid._id,
        materialThickness: 'rigid_25mm',
        color: { name: 'Pure White Linen', hex: '#f9f9f9' },
        finish: 'soft_touch',
        printing: 'full_color_both',
        additionalFeatures: ['custom_insert', 'magnetic_closure'],
        artwork: {
          logoUrl: '',
          brandText: 'SOLARIA GLOW VAULT',
          placement: 'top',
          patternType: 'geo_grid',
          artworkColor: '#d97736',
          scale: 1.2,
        },
        quantity: 300,
        prodRef: prodMap['luxury-rigid-box'],
        matRef: matRigid,
      },
    ];

    const insertedDesigns = [];
    for (const d of designsData) {
      const estimate = createEstimate(
        d.prodRef,
        d.dimensions,
        d.matRef,
        d.materialThickness,
        d.finish,
        d.printing,
        d.additionalFeatures,
        d.quantity
      );

      const created = await PackagingDesign.create({
        user: d.user,
        product: d.product,
        name: d.name,
        dimensions: d.dimensions,
        material: d.material,
        materialThickness: d.materialThickness,
        color: d.color,
        finish: d.finish,
        printing: d.printing,
        additionalFeatures: d.additionalFeatures,
        artwork: d.artwork,
        quantity: d.quantity,
        costEstimateSnapshot: estimate,
      });

      insertedDesigns.push({ doc: created, prodRef: d.prodRef, matRef: d.matRef, estimate });
    }

    console.log(`[Seed]: Inserted ${insertedDesigns.length} diverse packaging designs.`);

    // -------------------------------------------------------------
    // 7. Create Quotations
    // -------------------------------------------------------------
    const quotationsPayload = [
      // 0. Elena - Mailer Box (Accepted -> will become Order 1)
      {
        num: 'PC-QT-2026-01001',
        designIdx: 0,
        user: elenaCustomer,
        status: 'accepted',
        timeline: 2,
        special: 'Ensure soy-based inks are used for compostability compliance.',
        address: { address: '450 Congress Ave, Suite 1200', city: 'Austin', postalCode: '78701', country: 'USA' },
      },
      // 1. Elena - Folding Carton (under_review)
      {
        num: 'PC-QT-2026-01002',
        designIdx: 1,
        user: elenaCustomer,
        status: 'under_review',
        timeline: 3,
        special: 'Prepress team checking CMYK ink density on inside carton pattern.',
        address: { address: '450 Congress Ave, Suite 1200', city: 'Austin', postalCode: '78701', country: 'USA' },
      },
      // 2. Elena - Paper Bag (Accepted -> will become Order 4)
      {
        num: 'PC-QT-2026-01003',
        designIdx: 2,
        user: elenaCustomer,
        status: 'accepted',
        timeline: 2,
        special: 'Reinforced bottom handles tested for 8kg payload capacity.',
        address: { address: '450 Congress Ave, Suite 1200', city: 'Austin', postalCode: '78701', country: 'USA' },
      },
      // 3. Marcus - Mailer Box (quotation_prepared)
      {
        num: 'PC-QT-2026-01004',
        designIdx: 3,
        user: marcusCustomer,
        status: 'quotation_prepared',
        timeline: 2,
        special: 'White corrugated with high gloss foil stamp on logo text.',
        address: { address: '820 Industrial Blvd', city: 'Portland', postalCode: '97201', country: 'USA' },
      },
      // 4. Marcus - Shipping Box (Accepted -> will become Order 6)
      {
        num: 'PC-QT-2026-01005',
        designIdx: 4,
        user: marcusCustomer,
        status: 'accepted',
        timeline: 2,
        special: 'Include standard barcode labels and carrier safety certification marks.',
        address: { address: '820 Industrial Blvd', city: 'Portland', postalCode: '97201', country: 'USA' },
      },
      // 5. Marcus - Slide Sleeve (revision_requested)
      {
        num: 'PC-QT-2026-01006',
        designIdx: 5,
        user: marcusCustomer,
        status: 'revision_requested',
        timeline: 1,
        special: 'Requested revised window cutout contour to match can curvature.',
        address: { address: '820 Industrial Blvd', city: 'Portland', postalCode: '97201', country: 'USA' },
      },
      // 6. Sarah - Luxury Rigid Box (Accepted -> will become Order 2)
      {
        num: 'PC-QT-2026-01007',
        designIdx: 6,
        user: sarahCustomer,
        status: 'accepted',
        timeline: 4,
        special: 'Precision die-cut velvet EVA foam insert fitted to ear cup CAD models.',
        address: { address: '120 Innovation Way', city: 'San Jose', postalCode: '95134', country: 'USA' },
      },
      // 7. Sarah - Cable Carton (Accepted -> will become Order 7)
      {
        num: 'PC-QT-2026-01008',
        designIdx: 7,
        user: sarahCustomer,
        status: 'accepted',
        timeline: 2,
        special: 'PET clear window foil must be scratch-resistant optical grade.',
        address: { address: '120 Innovation Way', city: 'San Jose', postalCode: '95134', country: 'USA' },
      },
      // 8. Devon - SPF Carton (Accepted -> will become Order 3)
      {
        num: 'PC-QT-2026-01009',
        designIdx: 8,
        user: devonCustomer,
        status: 'accepted',
        timeline: 3,
        special: 'Moisture-resistant barrier lamination to protect in humid vanity environments.',
        address: { address: '740 Ocean Drive, Suite 5B', city: 'Miami', postalCode: '33139', country: 'USA' },
      },
      // 9. Devon - VIP Vault Box (sent)
      {
        num: 'PC-QT-2026-01010',
        designIdx: 9,
        user: devonCustomer,
        status: 'sent',
        timeline: 3,
        special: 'Gold magnetic closure pull ribbon in terracotta silk.',
        address: { address: '740 Ocean Drive, Suite 5B', city: 'Miami', postalCode: '33139', country: 'USA' },
      },
    ];

    const insertedQuotations = [];
    for (const q of quotationsPayload) {
      const designItem = insertedDesigns[q.designIdx];
      const { doc: designDoc, prodRef, matRef, estimate } = designItem;
      const b = estimate.breakdown;

      const quote = await Quotation.create({
        quotationNumber: q.num,
        customer: q.user._id,
        design: designDoc._id,
        customerDetails: {
          name: q.user.name,
          businessName: q.user.companyName,
          email: q.user.email,
          phone: q.user.phone,
          deliveryLocation: q.address,
          expectedTimelineWeeks: q.timeline,
          specialRequirements: q.special,
        },
        quantity: designDoc.quantity,
        configurationSnapshot: {
          productName: prodRef.name,
          productSlug: prodRef.slug,
          packagingType: prodRef.packagingType,
          dimensions: designDoc.dimensions,
          materialName: matRef.name,
          materialCode: matRef.code,
          materialThickness: designDoc.materialThickness,
          color: designDoc.color,
          finish: designDoc.finish,
          printing: designDoc.printing,
          additionalFeatures: designDoc.additionalFeatures,
          artwork: designDoc.artwork,
        },
        pricingSnapshot: {
          unitCost: b.estimatedUnitPrice,
          materialCostTotal: Number((b.unitMaterialCost * designDoc.quantity).toFixed(2)),
          printingCostTotal: Number((b.unitPrintingCost * designDoc.quantity).toFixed(2)),
          finishingCostTotal: Number((b.unitFinishCost * designDoc.quantity).toFixed(2)),
          featuresCostTotal: Number((b.unitFeaturesCost * designDoc.quantity).toFixed(2)),
          setupChargesTotal: b.totalSetupCharges,
          quantityDiscountPercent: estimate.discountPercent,
          subtotal: b.subtotal,
          taxAmount: b.taxAmount,
          shippingEstimate: b.shippingEstimate,
          totalAmount: b.estimatedTotal,
          currency: 'USD',
        },
        status: q.status,
        validityDate: new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
      });

      insertedQuotations.push({ quote, designDoc, user: q.user, estimate });
    }

    console.log(`[Seed]: Inserted ${insertedQuotations.length} realistic quotations.`);

    // -------------------------------------------------------------
    // 8. Create Orders & Chronological Order Activities
    // -------------------------------------------------------------
    const ordersPayload = [
      // Order 1: Elena - Mailer Box -> in_production
      {
        orderNum: 'PC-ORD-2026-05001',
        quoteIdx: 0,
        status: 'in_production',
        paymentStatus: 'paid',
        carrier: 'FedEx Freight Direct',
        tracking: 'FX-8849-0192-US',
        daysAhead: 5,
        adminNotes: 'Die line approved by prepress. Running on high-speed flatbed die-cutter Line 3.',
        activities: [
          { prev: 'none', next: 'order_placed', actor: 'customer', hoursAgo: 72, notes: 'Order placed from accepted quote PC-QT-2026-01001.' },
          { prev: 'order_placed', next: 'confirmed', actor: 'admin', hoursAgo: 60, notes: 'Order schedule and board inventory confirmed.' },
          { prev: 'confirmed', next: 'artwork_approved', actor: 'admin', hoursAgo: 36, notes: 'Client signed off on digital 1:1 color separations.' },
          { prev: 'artwork_approved', next: 'in_production', actor: 'admin', hoursAgo: 8, notes: 'Mounted on Line 3 flatbed die-cutter.' },
        ],
      },
      // Order 2: Sarah - Luxury Rigid Box -> dispatched
      {
        orderNum: 'PC-ORD-2026-05002',
        quoteIdx: 6,
        status: 'dispatched',
        paymentStatus: 'paid',
        carrier: 'DHL Express',
        tracking: 'DHL-9928-1029-EX',
        daysAhead: 2,
        adminNotes: 'Carefully palletized with corner protectors and humidity wrapping.',
        activities: [
          { prev: 'none', next: 'order_placed', actor: 'customer', hoursAgo: 168, notes: 'Purchase order issued for Aether Pro headphone boxes.' },
          { prev: 'order_placed', next: 'confirmed', actor: 'admin', hoursAgo: 150, notes: 'Rigid greyboard stock allocated from warehouse.' },
          { prev: 'confirmed', next: 'artwork_approved', actor: 'admin', hoursAgo: 120, notes: 'Physical draw-down proof signed off.' },
          { prev: 'artwork_approved', next: 'in_production', actor: 'admin', hoursAgo: 96, notes: 'Box wrapper assembly and foam insertion.' },
          { prev: 'in_production', next: 'quality_check', actor: 'admin', hoursAgo: 24, notes: '100% magnetic closure tension testing passed.' },
          { prev: 'quality_check', next: 'dispatched', actor: 'admin', hoursAgo: 6, notes: 'Handed off to DHL Express. Tracking DHL-9928-1029-EX.' },
        ],
      },
      // Order 3: Devon - SPF Folding Carton -> artwork_approved
      {
        orderNum: 'PC-ORD-2026-05003',
        quoteIdx: 8,
        status: 'artwork_approved',
        paymentStatus: 'paid',
        carrier: 'UPS Ground Freight',
        tracking: '',
        daysAhead: 12,
        adminNotes: 'Plates burned and ready for Heidelberg offset press run tomorrow morning.',
        activities: [
          { prev: 'none', next: 'order_placed', actor: 'customer', hoursAgo: 48, notes: 'Customer confirmed production run for 5,000 SPF cartons.' },
          { prev: 'order_placed', next: 'confirmed', actor: 'admin', hoursAgo: 36, notes: 'SBS paperboard stock staged at pressroom.' },
          { prev: 'confirmed', next: 'artwork_approved', actor: 'admin', hoursAgo: 12, notes: 'Pantone coral color match verified and approved.' },
        ],
      },
      // Order 4: Elena - Boutique Paper Bag -> delivered
      {
        orderNum: 'PC-ORD-2026-05004',
        quoteIdx: 2,
        status: 'delivered',
        paymentStatus: 'paid',
        carrier: 'UPS Freight',
        tracking: '1Z9999999999999999',
        daysAhead: -2,
        adminNotes: 'Delivered in full to Austin retail warehouse. Signed by Elena Rostova.',
        activities: [
          { prev: 'none', next: 'order_placed', actor: 'customer', hoursAgo: 240, notes: 'Retail shopper bags ordered for Austin boutique opening.' },
          { prev: 'order_placed', next: 'confirmed', actor: 'admin', hoursAgo: 220, notes: 'Bag handle machine line scheduled.' },
          { prev: 'confirmed', next: 'in_production', actor: 'admin', hoursAgo: 170, notes: 'Flexo printing and twisted cord attachment completed.' },
          { prev: 'in_production', next: 'quality_check', actor: 'admin', hoursAgo: 100, notes: 'Handle pull tensile stress test certified.' },
          { prev: 'quality_check', next: 'dispatched', actor: 'admin', hoursAgo: 72, notes: 'Shipped via UPS Freight.' },
          { prev: 'dispatched', next: 'delivered', actor: 'admin', hoursAgo: 18, notes: 'Consignment delivered and accepted at Austin dock.' },
        ],
      },
      // Order 5: Marcus - Cold-Brew Master Shipper -> quality_check
      {
        orderNum: 'PC-ORD-2026-05005',
        quoteIdx: 4,
        status: 'quality_check',
        paymentStatus: 'paid',
        carrier: 'Old Dominion Freight Line',
        tracking: 'ODFL-4491-0021',
        daysAhead: 4,
        adminNotes: 'Burst strength and drop test validation on batch samples.',
        activities: [
          { prev: 'none', next: 'order_placed', actor: 'customer', hoursAgo: 96, notes: 'Master transit shipper order placed.' },
          { prev: 'order_placed', next: 'confirmed', actor: 'admin', hoursAgo: 80, notes: 'C-flute corrugator batch queued.' },
          { prev: 'confirmed', next: 'in_production', actor: 'admin', hoursAgo: 48, notes: 'Flexo 1-color black print and rotary slotting.' },
          { prev: 'in_production', next: 'quality_check', actor: 'admin', hoursAgo: 4, notes: 'Edge Crush Test (ECT) verified at 44 ECT.' },
        ],
      },
      // Order 6: Sarah - Audio Cable Carton -> order_placed
      {
        orderNum: 'PC-ORD-2026-05006',
        quoteIdx: 7,
        status: 'order_placed',
        paymentStatus: 'pending',
        carrier: 'FedEx Ground',
        tracking: '',
        daysAhead: 15,
        adminNotes: 'Awaiting customer prepress vector artwork upload for window positioning.',
        activities: [
          { prev: 'none', next: 'order_placed', actor: 'customer', hoursAgo: 5, notes: 'Order placed online by Sarah Lin. Prepress onboarding pending.' },
        ],
      },
    ];

    for (const ord of ordersPayload) {
      const qItem = insertedQuotations[ord.quoteIdx];
      const { quote, designDoc, user, estimate } = qItem;
      const b = estimate.breakdown;

      const createdOrder = await Order.create({
        orderNumber: ord.orderNum,
        customer: user._id,
        quotation: quote._id,
        design: designDoc._id,
        configurationSnapshot: quote.configurationSnapshot,
        quantity: quote.quantity,
        confirmedUnitPrice: quote.pricingSnapshot.unitCost,
        subtotal: quote.pricingSnapshot.subtotal,
        taxAmount: quote.pricingSnapshot.taxAmount,
        shippingAmount: quote.pricingSnapshot.shippingEstimate,
        totalAmount: quote.pricingSnapshot.totalAmount,
        shippingAddress: {
          fullName: user.name,
          company: user.companyName,
          street: quote.customerDetails.deliveryLocation.address,
          city: quote.customerDetails.deliveryLocation.city,
          state: 'TX',
          postalCode: quote.customerDetails.deliveryLocation.postalCode,
          country: quote.customerDetails.deliveryLocation.country || 'USA',
          phone: user.phone,
        },
        paymentStatus: ord.paymentStatus,
        status: ord.status,
        estimatedShipDate: new Date(Date.now() + ord.daysAhead * 24 * 60 * 60 * 1000),
        carrier: ord.carrier,
        trackingNumber: ord.tracking,
        adminNotes: ord.adminNotes,
      });

      // Insert timeline activities
      const actDocs = ord.activities.map((a) => ({
        order: createdOrder._id,
        previousStatus: a.prev,
        newStatus: a.next,
        actor: {
          name: a.actor === 'customer' ? user.name : 'PackCraft Operations Admin',
          role: a.actor,
          userId: a.actor === 'customer' ? user._id : adminUser._id,
        },
        notes: a.notes,
        timestamp: new Date(Date.now() - a.hoursAgo * 60 * 60 * 1000),
      }));

      await OrderActivity.insertMany(actDocs);
    }

    console.log(`[Seed]: Created ${ordersPayload.length} realistic orders with comprehensive timeline activities.`);
    console.log('------------------------------------------------------------');
    console.log('PackCraft Demo Accounts (Password: customer123 / admin123):');
    console.log('Admin:    admin@packcraft.com');
    console.log('Customer: elena@luminarybotanicals.com   (Cosmetics D2C - Mailer, Carton, Bags)');
    console.log('Customer: marcus@apexroasters.com        (Coffee Roasters - Mailers, Shippers)');
    console.log('Customer: sarah@aetheraudio.io           (Audio Tech - Luxury Rigid, Cartons)');
    console.log('Customer: devon@solariaglow.co           (Clean Beauty - Cartons, VIP Vaults)');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();