import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Box, Sparkles, ArrowRight, ArrowUpDown } from 'lucide-react';
import { packagingAPI } from '../services/api';

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        material: selectedMaterial || undefined,
        search: searchTerm || undefined,
        sort: sortBy,
      };
      const res = await packagingAPI.getList(params);
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load catalogue products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catsRes, matsRes] = await Promise.all([
          packagingAPI.getCategories(),
          packagingAPI.getMaterials(),
        ]);
        if (catsRes.success) setCategories(['All', ...catsRes.data]);
        if (matsRes.success) setMaterials(matsRes.data);
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, selectedMaterial, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
          Packaging Catalogue
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-charcoal-950">
          Engineered Packaging Products
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl">
          Browse our certified structural templates. Select any product to customize dimensions, materials, and preview interactively in 3D.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-kraft-200 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, category, or industry (e.g. cosmetics, mailer, rigid)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kraft-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-900 bg-kraft-50/50"
            />
          </div>

          {/* Substrate Filter & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-kraft-200 text-xs font-medium bg-kraft-50/50 text-charcoal-800 focus:outline-none"
            >
              <option value="">All Material Substrates</option>
              {materials.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-kraft-200 text-xs font-medium bg-kraft-50/50 text-charcoal-800 focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Templates</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    isSelected
                      ? 'bg-charcoal-900 text-white font-semibold shadow-sm'
                      : 'bg-kraft-100 hover:bg-kraft-200 text-charcoal-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-kraft-100/60 animate-pulse border border-kraft-200"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-kraft-200 p-8 space-y-3">
          <Box className="w-12 h-12 text-kraft-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">No Packaging Products Found</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Try adjusting your search query or removing category/material filters to see more results.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedMaterial('');
              setSearchTerm('');
            }}
            className="text-xs font-bold text-kraft-700 hover:underline pt-2 inline-block"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div
              key={prod._id}
              className="bg-white rounded-2xl border border-kraft-200 overflow-hidden shadow-subtle hover:shadow-craft-hover transition-all flex flex-col group"
            >
              <div className="relative h-60 bg-kraft-100 overflow-hidden">
                <img
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80'}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-charcoal-900/80 backdrop-blur-md text-white text-[10px] font-mono uppercase px-2.5 py-1 rounded-md font-semibold">
                  {prod.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-charcoal-950 text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow-sm">
                  From ${prod.baseStartingPrice?.toFixed(2)} / unit
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

                <div className="space-y-3 pt-3 border-t border-kraft-100 text-xs">
                  <div className="flex items-center justify-between text-charcoal-600 font-mono text-[11px]">
                    <span>MOQ: {prod.minOrderQuantity} units</span>
                    <span>Lead: {prod.leadTimeDays} business days</span>
                  </div>

                  <div className="text-[11px] text-charcoal-500 font-mono">
                    Dims: {prod.dimensions?.minL}-{prod.dimensions?.maxL}mm L • {prod.dimensions?.minW}-{prod.dimensions?.maxW}mm W
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
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
                      <span>Configure in 3D</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
