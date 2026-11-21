import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Ruler,
  Layers,
  Palette,
  Eye,
  RotateCcw,
  Maximize2,
  Box,
  Compass,
  Check,
  ChevronDown,
} from 'lucide-react';

import PackagingScene from '../components/3D/PackagingScene';
import DimensionControls from '../components/customizer/DimensionControls';
import MaterialControls from '../components/customizer/MaterialControls';
import ArtworkControls from '../components/customizer/ArtworkControls';
import PriceEstimateCard from '../components/customizer/PriceEstimateCard';
import QuotationModal from '../components/customizer/QuotationModal';

import { useCustomizerStore } from '../store/customizerStore';
import { packagingAPI, designsAPI } from '../services/api';

export default function CustomizerPage() {
  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get('slug');
  const designIdParam = searchParams.get('designId');

  const {
    product,
    initProduct,
    dimensions,
    material,
    materialThickness,
    color,
    finish,
    printing,
    additionalFeatures,
    artwork,
    lidOpenAngle,
    wireframe,
    setWireframe,
    autoRotate,
    setAutoRotate,
    cameraPreset,
    setCameraPreset,
    loadFromDesign,
  } = useCustomizerStore();

  const [activeTab, setActiveTab] = useState('dimensions'); // 'dimensions' | 'materials' | 'artwork'
  const [productList, setProductList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize configurator data
  useEffect(() => {
    const initializeConfigurator = async () => {
      try {
        setLoading(true);
        const [prodsRes, matsRes] = await Promise.all([
          packagingAPI.getList({ limit: 50 }),
          packagingAPI.getMaterials(),
        ]);

        const products = prodsRes.data || [];
        const mats = matsRes.data || [];
        setProductList(products);
        setMaterialsList(mats);

        // If designId is supplied, load from existing design
        if (designIdParam) {
          const designRes = await designsAPI.getById(designIdParam);
          if (designRes.success && designRes.data) {
            const des = designRes.data;
            loadFromDesign(des, des.product, des.material);
            setLoading(false);
            return;
          }
        }

        // Target product by slug, or fallback to first product
        let targetProd = products[0];
        if (slugParam) {
          const found = products.find((p) => p.slug === slugParam);
          if (found) targetProd = found;
        }

        if (targetProd) {
          initProduct(targetProd, mats);
        }
      } catch (err) {
        console.error('Configurator init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeConfigurator();
  }, [slugParam, designIdParam]);

  const handleProductSwitch = (prodId) => {
    const found = productList.find((p) => p._id === prodId);
    if (found) {
      initProduct(found, materialsList);
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-charcoal-500 mt-4">Initializing 3D Packaging Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Product Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 bg-white p-3.5 rounded-2xl border border-kraft-200 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-charcoal-900 text-kraft-300 flex items-center justify-center font-bold">
            <Box className="w-5 h-5 text-kraft-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-kraft-700 uppercase font-semibold">Active Structure</span>
              <span className="text-charcoal-400 text-xs">•</span>
              <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                FEFCO Certified
              </span>
            </div>
            {/* Product Switcher Dropdown */}
            <div className="relative inline-block mt-0.5">
              <select
                value={product._id}
                onChange={(e) => handleProductSwitch(e.target.value)}
                className="font-display font-bold text-lg text-charcoal-950 bg-transparent pr-7 py-0.5 focus:outline-none cursor-pointer hover:text-kraft-700"
              >
                {productList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Viewport Toolbar Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-kraft-100 p-1 rounded-xl border border-kraft-200 text-xs font-mono">
            <button
              onClick={() => setCameraPreset('perspective')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                cameraPreset === 'perspective' ? 'bg-white shadow-sm font-bold text-charcoal-950' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Perspective
            </button>
            <button
              onClick={() => setCameraPreset('front')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                cameraPreset === 'front' ? 'bg-white shadow-sm font-bold text-charcoal-950' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                cameraPreset === 'top' ? 'bg-white shadow-sm font-bold text-charcoal-950' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setCameraPreset('side')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                cameraPreset === 'side' ? 'bg-white shadow-sm font-bold text-charcoal-950' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Side
            </button>
          </div>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-2 rounded-xl text-xs font-mono font-medium border transition-colors flex items-center gap-1 ${
              wireframe ? 'bg-charcoal-900 text-white border-charcoal-900' : 'bg-white text-charcoal-700 border-kraft-200 hover:bg-kraft-100'
            }`}
            title="Toggle Structural Wireframe"
          >
            <span>Mesh</span>
          </button>

          {/* Auto rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs font-mono font-medium border transition-colors flex items-center gap-1 ${
              autoRotate ? 'bg-charcoal-900 text-white border-charcoal-900' : 'bg-white text-charcoal-700 border-kraft-200 hover:bg-kraft-100'
            }`}
            title="Toggle 360 Spin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Spin</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Viewport (Sticky on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[520px] lg:h-[760px] sticky top-24">
          <div className="flex-1 rounded-3xl overflow-hidden relative shadow-craft border border-kraft-200">
            <PackagingScene
              product={product}
              dimensions={dimensions}
              material={material}
              materialThickness={materialThickness}
              color={color}
              finish={finish}
              printing={printing}
              additionalFeatures={additionalFeatures}
              artwork={artwork}
              lidOpenAngle={lidOpenAngle}
              wireframe={wireframe}
              autoRotate={autoRotate}
              cameraPreset={cameraPreset}
            />
          </div>

          {/* Quick instructions pill below canvas */}
          <div className="mt-2 text-center text-[11px] font-mono text-charcoal-500">
            Click & drag to rotate • Scroll to zoom • Right-click to pan • Sliders update live geometry
          </div>
        </div>

        {/* Right: Controls & Dynamic Pricing Engine */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white p-1.5 rounded-2xl border border-kraft-200 shadow-subtle flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dimensions')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'dimensions'
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-kraft-50'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Dimensions</span>
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'materials'
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-kraft-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Substrate</span>
            </button>

            <button
              onClick={() => setActiveTab('artwork')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'artwork'
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-kraft-50'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Branding</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="bg-white p-5 rounded-2xl border border-kraft-200 shadow-subtle">
            {activeTab === 'dimensions' && <DimensionControls />}
            {activeTab === 'materials' && <MaterialControls />}
            {activeTab === 'artwork' && <ArtworkControls />}
          </div>

          {/* Pricing Engine Calculation Card */}
          <PriceEstimateCard onRequestQuote={() => setQuoteModalOpen(true)} />
        </div>
      </div>

      {/* Formal Quotation Request Modal */}
      <QuotationModal isOpen={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />
    </div>
  );
}
