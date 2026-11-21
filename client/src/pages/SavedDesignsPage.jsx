import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Sparkles, Copy, Trash2, Send, Calendar, Clock, ArrowRight } from 'lucide-react';
import { designsAPI } from '../services/api';

export default function SavedDesignsPage() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const res = await designsAPI.getAll();
      if (res.success) {
        setDesigns(res.data);
      }
    } catch (err) {
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleDuplicate = async (id) => {
    try {
      const res = await designsAPI.duplicate(id);
      if (res.success) {
        fetchDesigns();
      }
    } catch (err) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this packaging design?')) return;
    try {
      const res = await designsAPI.delete(id);
      if (res.success) {
        setDesigns(designs.filter((d) => d._id !== id));
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
            Personal Packaging Library
          </span>
          <h1 className="text-3xl font-bold font-display text-charcoal-950">Saved Configurations</h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            Review, duplicate, edit in 3D, or request formal quotations from your saved designs.
          </p>
        </div>
        <Link
          to="/customizer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-kraft-300" />
          <span>New 3D Design</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-charcoal-500 mt-3">Loading saved packaging designs...</p>
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-kraft-200 p-8 space-y-4">
          <Box className="w-12 h-12 text-kraft-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">No Saved Designs Yet</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            You haven't saved any packaging designs yet. Open our 3D customizer to craft and save your first custom box.
          </p>
          <Link
            to="/customizer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-charcoal-950 text-white"
          >
            <Sparkles className="w-4 h-4 text-kraft-300" />
            <span>Launch 3D Configurator</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => {
            const dims = design.dimensions || {};
            const snapshot = design.costEstimateSnapshot;
            const unitPrice = snapshot?.breakdown?.estimatedUnitPrice;

            return (
              <div
                key={design._id}
                className="bg-white rounded-2xl border border-kraft-200 overflow-hidden shadow-subtle hover:shadow-craft transition-all flex flex-col justify-between p-5 space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase bg-kraft-100 text-charcoal-700 px-2 py-0.5 rounded font-semibold">
                      {design.product?.packagingType || 'Packaging'}
                    </span>
                    <span className="text-[11px] font-mono text-charcoal-400">
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-charcoal-950 line-clamp-1">
                    {design.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs font-mono text-charcoal-600 bg-kraft-50/70 p-3 rounded-xl border border-kraft-200">
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Dimensions:</span>
                      <span className="font-bold text-charcoal-900">{dims.length} × {dims.width} × {dims.height} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Substrate:</span>
                      <span className="truncate max-w-[150px]">{design.material?.name || 'Kraft Flute'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Finish:</span>
                      <span className="capitalize">{design.finish}</span>
                    </div>
                    {unitPrice && (
                      <div className="flex justify-between border-t border-dashed border-kraft-200 pt-1 font-bold text-charcoal-900">
                        <span>Est. Rate ({design.quantity} pcs):</span>
                        <span className="text-charcoal-950">${Number(unitPrice).toFixed(2)}/unit</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-kraft-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(design._id)}
                      className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-kraft-100 transition-colors"
                      title="Duplicate Configuration"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(design._id)}
                      className="p-2 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Design"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/customizer?designId=${design._id}`)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-charcoal-900 text-white hover:bg-charcoal-800 transition-colors flex items-center gap-1.5"
                  >
                    <span>Open in 3D</span>
                    <ArrowRight className="w-3.5 h-3.5 text-kraft-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
