import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Recycle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Cpu,
  Truck,
  FileCheck,
  Check,
} from 'lucide-react';
import { packagingAPI } from '../services/api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          packagingAPI.getCategories(),
          packagingAPI.getList({ sort: 'featured', limit: 6 }),
        ]);
        if (catsRes.success) setCategories(catsRes.data);
        if (prodsRes.success) setFeaturedProducts(prodsRes.data);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-kraft-200 bg-gradient-to-b from-[#faf7f2] via-[#f7f1e7] to-[#faf7f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-kraft-200/70 border border-kraft-300 text-charcoal-900 text-xs font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>FEFCO Tolerances ±1.0mm // 3D Interactive Prepress</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-charcoal-950 tracking-tight leading-[1.08]">
                Packaging That Brings Your Brand to Life.
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-xl font-sans">
                Design custom mailer boxes, folding cartons, and luxury rigid packaging with precision 3D parametric visualization, live dynamic cost estimation, instant quotation requests, and complete production tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/customizer"
                  className="px-7 py-4 rounded-xl text-sm font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 shadow-craft hover:shadow-craft-hover transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-4 h-4 text-kraft-300" />
                  <span>Start Customizing in 3D</span>
                  <ArrowRight className="w-4 h-4 text-kraft-300 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/catalogue"
                  className="px-7 py-4 rounded-xl text-sm font-bold bg-white text-charcoal-900 border border-kraft-300 hover:bg-kraft-100 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Box className="w-4 h-4 text-kraft-700" />
                  <span>Explore Packaging Catalogue</span>
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-kraft-200/80 max-w-lg">
                <div>
                  <span className="text-2xl font-extrabold font-display text-charcoal-900 block">50 MOQ</span>
                  <span className="text-xs text-charcoal-500 font-medium">Low batch pilot runs</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold font-display text-charcoal-900 block">6-8 Days</span>
                  <span className="text-xs text-charcoal-500 font-medium">Fast factory lead time</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold font-display text-charcoal-900 block">100%</span>
                  <span className="text-xs text-charcoal-500 font-medium">Curbside recyclable</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden bg-white border border-kraft-200 shadow-craft-hover p-4">
                  <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-[#e8dac7] flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
                      alt="Custom Mailer Box"
                      className="w-full h-full object-cover mix-blend-multiply opacity-90 hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                      <span className="text-[10px] font-mono uppercase bg-kraft-500/90 text-white px-2 py-0.5 rounded font-bold self-start mb-2">
                        Interactive 3D Configurator
                      </span>
                      <h3 className="font-display font-bold text-xl leading-tight">
                        Roll-End Tuck Front Mailer
                      </h3>
                      <p className="text-xs text-kraft-100 font-mono mt-1">
                        E-Flute Corrugated • Double-Wall Crush Resistant
                      </p>
                    </div>
                  </div>

                  {/* Floating Spec Badge */}
                  <div className="mt-4 p-3 rounded-xl bg-kraft-50 border border-kraft-200 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                      <span className="text-charcoal-800 font-semibold">Instant Quote Engine</span>
                    </div>
                    <span className="text-charcoal-900 font-bold">From $1.15 / unit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PACKAGING CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
              Structural Classifications
            </span>
            <h2 className="text-3xl font-bold font-display text-charcoal-950">Packaging Categories</h2>
          </div>
          <Link
            to="/catalogue"
            className="text-xs font-bold text-charcoal-800 hover:text-charcoal-950 flex items-center gap-1 group mt-2 sm:mt-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Mailer Boxes', count: 'E-commerce & Subscription', slug: 'custom-mailer-box' },
            { name: 'Folding Cartons', count: 'Retail & Cosmetics Boxboard', slug: 'folding-carton-box' },
            { name: 'Rigid Boxes', count: 'Luxury 2-Piece Setup Boxes', slug: 'luxury-rigid-box' },
            { name: 'Shipping Boxes', count: 'Heavy Duty Master Shipper', slug: 'shipping-box-rsc' },
            { name: 'Paper Bags', count: 'Gusseted Kraft Shopping Bags', slug: 'kraft-paper-bag' },
            { name: 'Product Sleeves', count: 'Slide-on Container Bands', slug: 'product-slide-sleeve' },
            { name: 'Corrugated Boxes', count: 'Single & Double Wall Flutes', slug: 'custom-mailer-box' },
            { name: 'Custom Packaging', count: 'Bespoke Engineering Tooling', slug: 'custom-mailer-box' },
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/customizer?slug=${cat.slug}`}
              className="p-5 rounded-2xl bg-white border border-kraft-200 shadow-subtle hover:shadow-craft hover:border-kraft-400 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-kraft-100 text-charcoal-900 flex items-center justify-center mb-3 group-hover:bg-charcoal-900 group-hover:text-kraft-300 transition-colors">
                  <Box className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-charcoal-950 group-hover:text-kraft-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 font-sans">{cat.count}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono font-semibold text-charcoal-700 group-hover:text-charcoal-950">
                <span>Configure in 3D</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PACKAGING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
              Production Verified
            </span>
            <h2 className="text-3xl font-bold font-display text-charcoal-950">Featured Packaging Styles</h2>
          </div>
          <Link
            to="/catalogue"
            className="text-xs font-bold text-charcoal-800 hover:text-charcoal-950 flex items-center gap-1 group mt-2 sm:mt-0"
          >
            <span>Full Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 3).map((prod) => (
            <div
              key={prod._id}
              className="bg-white rounded-2xl border border-kraft-200 overflow-hidden shadow-subtle hover:shadow-craft-hover transition-all flex flex-col group"
            >
              <div className="relative h-56 bg-kraft-100 overflow-hidden">
                <img
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80'}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-charcoal-900/80 backdrop-blur-md text-white text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-semibold">
                  {prod.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-charcoal-900 text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow-sm">
                  From ${prod.baseStartingPrice?.toFixed(2)}/unit
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-charcoal-950 group-hover:text-kraft-700 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-charcoal-500 line-clamp-2 mt-1 leading-relaxed">
                    {prod.shortDescription || prod.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-kraft-100">
                  <div className="flex items-center justify-between text-xs text-charcoal-600 font-mono">
                    <span>MOQ: {prod.minOrderQuantity} units</span>
                    <span>Lead: {prod.leadTimeDays} business days</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/catalogue/${prod.slug}`}
                      className="py-2.5 px-3 rounded-xl text-center text-xs font-semibold border border-kraft-300 text-charcoal-900 hover:bg-kraft-100 transition-colors"
                    >
                      Specifications
                    </Link>
                    <Link
                      to={`/customizer?slug=${prod.slug}`}
                      className="py-2.5 px-3 rounded-xl text-center text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-kraft-300" />
                      <span>Customize in 3D</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-kraft-100/70 py-16 border-y border-kraft-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl font-bold font-display text-charcoal-950">How PackCraft Works</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              From parametric 3D design to precision industrial manufacturing and doorstep delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Select Structure', desc: 'Pick from mailer boxes, folding cartons, rigid setups or kraft bags.' },
              { step: '02', title: 'Set Dimensions', desc: 'Dial in millimetric length, width, and height with real-time parametric scaling.' },
              { step: '03', title: 'Substrate & Art', desc: 'Choose kraft flutes, board caliper, custom ink tones, and upload brand logos.' },
              { step: '04', title: 'Dynamic Estimate', desc: 'Authoritative server-side pricing engine calculates sheet yield and volume tiers.' },
              { step: '05', title: 'Formal Quotation', desc: 'Request an official quote with 30-day locked pricing and downloadable PDF.' },
              { step: '06', title: 'Order & Track', desc: 'Accept quotation, confirm purchase order, and follow live plant floor production steps.' },
            ].map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-kraft-200 shadow-subtle relative flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl font-black text-kraft-300 block mb-2">{s.step}</span>
                  <h4 className="font-display font-bold text-sm text-charcoal-950 mb-1">{s.title}</h4>
                  <p className="text-xs text-charcoal-500 leading-relaxed font-sans">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MATERIALS & SUSTAINABILITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block">
              Certified Substrates
            </span>
            <h2 className="text-3xl font-bold font-display text-charcoal-950">
              Sustainable Materials Engineered for Protection.
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Every PackCraft substrate is carefully tested for burst strength, edge crush resistance, and folding endurance while complying strictly with responsible forestry and curbside compostability standards.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Natural Kraft Corrugated (E-Flute & B-Flute)', desc: 'Unbleached virgin long-fiber kraft for exceptional crush protection.' },
                { title: 'Solid Bleached Sulfate (SBS) Boxboard', desc: 'Coated ultra-white pulp for cosmetic and luxury retail printing.' },
                { title: 'Recycled Heavyweight Greyboard (1.8mm & 2.5mm)', desc: '100% recycled unbendable core for luxury setup gift boxes.' },
                { title: 'Curbside Recyclable High-Tensile Kraft Paper', desc: 'Biodegradable shopping bag material with twisted paper handles.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-kraft-200 text-kraft-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-charcoal-900">{item.title}</h5>
                    <p className="text-[11px] text-charcoal-500 leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#f4ede2] border border-kraft-200 space-y-2">
              <Recycle className="w-8 h-8 text-kraft-700" />
              <h4 className="font-display font-bold text-base text-charcoal-900">Plastic-Free Promise</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Zero harmful plastic laminates on standard kraft board. Aqueous water-based coatings ensure full curbside repulpability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#ebf0ea] border border-emerald-200 space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-800" />
              <h4 className="font-display font-bold text-base text-charcoal-900">FSC Certified Chain</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                100% chain of custody verified forestry paper stock harvested from well-managed renewable timber plantations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#edf1f5] border border-blue-200 space-y-2">
              <Layers className="w-8 h-8 text-blue-800" />
              <h4 className="font-display font-bold text-base text-charcoal-900">Edge Crush Tested (ECT)</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Calibrated to 32 ECT & 44 ECT to withstand rigorous courier shipping drop tests and vertical pallet warehouse stacking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f7f2ea] border border-kraft-200 space-y-2">
              <FileCheck className="w-8 h-8 text-kraft-800" />
              <h4 className="font-display font-bold text-base text-charcoal-900">Soy & Water Inks</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Non-toxic vegetable soy inks with zero volatile organic compounds (VOCs) for vibrant food and skin safe packaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-charcoal-950 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-mono uppercase tracking-wider text-kraft-400 font-bold">
              Ready to Prototype?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
              Create Your Custom Packaging Design in Minutes.
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
              Launch our 3D configurator, select dimensions and materials, preview branding live, and obtain an instant engineering estimate.
            </p>
            <div className="pt-2">
              <Link
                to="/customizer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-kraft-400 text-charcoal-950 hover:bg-kraft-300 transition-colors shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch 3D Customizer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
