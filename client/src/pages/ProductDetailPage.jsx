import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Sparkles, ArrowRight, ShieldCheck, Clock, Layers, Ruler, CheckCircle2, ChevronLeft } from 'lucide-react';
import { packagingAPI } from '../services/api';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await packagingAPI.getBySlug(slug);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-charcoal-500 mt-4">Loading product specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-charcoal-900">Product Not Found</h2>
        <p className="text-xs text-charcoal-500">The requested packaging template could not be located.</p>
        <Link to="/catalogue" className="inline-block px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <Link to="/catalogue" className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-950">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Packaging Catalogue</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative h-96 sm:h-[460px] rounded-3xl bg-kraft-100 overflow-hidden border border-kraft-200 shadow-craft">
            <img
              src={product.images?.[activeImage] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-charcoal-900/80 backdrop-blur-md text-white text-[11px] font-mono uppercase px-3 py-1 rounded-md font-semibold">
              {product.category}
            </div>
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-charcoal-900 ring-2 ring-kraft-400' : 'border-kraft-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Technical Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
              {product.packagingType?.replace('_', ' ').toUpperCase()} TEMPLATE
            </span>
            <h1 className="text-3xl font-bold font-display text-charcoal-950 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing & MOQ Pill */}
          <div className="p-4 rounded-2xl bg-kraft-50 border border-kraft-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-charcoal-400 block">Baseline Starting Rate</span>
              <span className="text-2xl font-bold font-display text-charcoal-950">
                ${product.baseStartingPrice?.toFixed(2)}
                <span className="text-xs font-normal text-charcoal-500"> / unit</span>
              </span>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-charcoal-500 block">MOQ: {product.minOrderQuantity} pcs</span>
              <span className="text-emerald-700 font-semibold">{product.leadTimeDays} Days Lead Time</span>
            </div>
          </div>

          {/* Dimension Capabilities */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 font-mono flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-kraft-600" />
              Supported Dimension Bounds (mm)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white border border-kraft-200">
                <span className="text-charcoal-400 block text-[10px]">Length</span>
                <span className="font-bold text-charcoal-900">{product.dimensions?.minL} - {product.dimensions?.maxL}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-kraft-200">
                <span className="text-charcoal-400 block text-[10px]">Width</span>
                <span className="font-bold text-charcoal-900">{product.dimensions?.minW} - {product.dimensions?.maxW}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-kraft-200">
                <span className="text-charcoal-400 block text-[10px]">Height</span>
                <span className="font-bold text-charcoal-900">{product.dimensions?.minH} - {product.dimensions?.maxH}</span>
              </div>
            </div>
          </div>

          {/* Supported Substrates */}
          {product.supportedMaterials?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-kraft-600" />
                Compatible Substrates
              </h4>
              <div className="space-y-1.5">
                {product.supportedMaterials.map((mat) => (
                  <div key={mat._id} className="p-2.5 rounded-xl bg-white border border-kraft-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-charcoal-900">{mat.name}</span>
                      <span className="text-[10px] text-charcoal-500 block">{mat.description?.slice(0, 70)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Industries */}
          {product.targetIndustries?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.targetIndustries.map((ind) => (
                <span key={ind} className="text-[10px] font-mono bg-kraft-100 text-charcoal-700 px-2 py-0.5 rounded-md border border-kraft-200">
                  {ind}
                </span>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="pt-4 space-y-2">
            <Link
              to={`/customizer?slug=${product.slug}`}
              className="w-full py-4 rounded-xl text-center text-sm font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 shadow-craft transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-kraft-300" />
              <span>Launch in 3D Customizer</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
