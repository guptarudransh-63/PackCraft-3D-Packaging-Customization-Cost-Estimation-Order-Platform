import { create } from 'zustand';
import { pricingAPI } from '../services/api';

export const useCustomizerStore = create((set, get) => ({
  product: null,
  material: null,
  materialsList: [],
  dimensions: { length: 260, width: 200, height: 80, unit: 'mm' },
  materialThickness: 'e_flute_15',
  color: { name: 'Natural Kraft', hex: '#c89d6c' },
  finish: 'matte',
  printing: 'full_color_outside',
  additionalFeatures: [],
  artwork: {
    logoUrl: '',
    brandText: 'YOUR BRAND',
    placement: 'top',
    patternType: 'none', // 'none' | 'dots' | 'grid' | 'stripes'
    artworkColor: '#18191b',
    scale: 1.0,
  },
  quantity: 250,

  // 3D Viewport Controls
  lidOpenAngle: 0.0, // 0 = closed, 1 = fully open
  wireframe: false,
  autoRotate: false,
  cameraPreset: 'perspective', // 'perspective' | 'front' | 'top' | 'side' | 'interior'

  // Pricing Engine State
  estimate: null,
  isEstimating: false,
  estimateError: null,

  initProduct: (product, materials = []) => {
    if (!product) return;
    const defaultMat = materials.length > 0 ? materials[0] : (product.supportedMaterials?.[0] || null);
    const defaultThickness = defaultMat?.thicknessOptions?.[0]?.value || 'e_flute_15';
    const defaultColor = defaultMat?.colorPresets?.[0] || { name: 'Natural Kraft', hex: '#c89d6c' };

    set({
      product,
      materialsList: materials,
      material: defaultMat,
      dimensions: {
        length: product.dimensions.defaultL || 260,
        width: product.dimensions.defaultW || 200,
        height: product.dimensions.defaultH || 80,
        unit: 'mm',
      },
      materialThickness: defaultThickness,
      color: defaultColor,
      finish: product.supportedFinishes?.[0]?.code || 'matte',
      printing: product.printingOptions?.[1]?.code || '1_color_outside',
      additionalFeatures: [],
      quantity: product.minOrderQuantity || 250,
      lidOpenAngle: 0.0,
    });

    get().fetchEstimate();
  },

  setDimensions: (dims) => {
    set((state) => ({ dimensions: { ...state.dimensions, ...dims } }));
    get().fetchEstimate();
  },

  setMaterial: (mat) => {
    const defaultThickness = mat.thicknessOptions?.[0]?.value || '';
    const defaultColor = mat.colorPresets?.[0] || { name: 'Natural Kraft', hex: '#c89d6c' };
    set({
      material: mat,
      materialThickness: defaultThickness,
      color: defaultColor,
    });
    get().fetchEstimate();
  },

  setMaterialThickness: (thickness) => {
    set({ materialThickness: thickness });
    get().fetchEstimate();
  },

  setColor: (colorObj) => {
    set({ color: colorObj });
  },

  setFinish: (finish) => {
    set({ finish });
    get().fetchEstimate();
  },

  setPrinting: (printing) => {
    set({ printing });
    get().fetchEstimate();
  },

  toggleFeature: (featureCode) => {
    set((state) => {
      const exists = state.additionalFeatures.includes(featureCode);
      const next = exists
        ? state.additionalFeatures.filter((f) => f !== featureCode)
        : [...state.additionalFeatures, featureCode];
      return { additionalFeatures: next };
    });
    get().fetchEstimate();
  },

  setArtwork: (artworkUpdates) => {
    set((state) => ({ artwork: { ...state.artwork, ...artworkUpdates } }));
  },

  setQuantity: (quantity) => {
    set({ quantity: Math.max(1, Number(quantity) || 50) });
    get().fetchEstimate();
  },

  setLidOpenAngle: (angle) => {
    set({ lidOpenAngle: Math.max(0, Math.min(1, angle)) });
  },

  setWireframe: (bool) => {
    set({ wireframe: bool });
  },

  setAutoRotate: (bool) => {
    set({ autoRotate: bool });
  },

  setCameraPreset: (preset) => {
    set({ cameraPreset: preset });
  },

  fetchEstimate: async () => {
    const state = get();
    if (!state.product) return;

    try {
      set({ isEstimating: true, estimateError: null });
      const payload = {
        productId: state.product._id,
        dimensions: state.dimensions,
        materialId: state.material?._id,
        materialThickness: state.materialThickness,
        finish: state.finish,
        printing: state.printing,
        additionalFeatures: state.additionalFeatures,
        quantity: state.quantity,
      };

      const res = await pricingAPI.getEstimate(payload);
      if (res.success && res.data) {
        set({ estimate: res.data, isEstimating: false });
      }
    } catch (err) {
      set({ estimateError: err.message, isEstimating: false });
    }
  },

  loadFromDesign: (design, product, material) => {
    set({
      product,
      material,
      dimensions: design.dimensions,
      materialThickness: design.materialThickness,
      color: design.color,
      finish: design.finish,
      printing: design.printing,
      additionalFeatures: design.additionalFeatures || [],
      artwork: design.artwork || {},
      quantity: design.quantity || 250,
      lidOpenAngle: 0.0,
      estimate: design.costEstimateSnapshot || null,
    });
    get().fetchEstimate();
  },
}));
