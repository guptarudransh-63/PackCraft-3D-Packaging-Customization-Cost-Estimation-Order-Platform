import React, { useState } from 'react';
import { X, Send, ShieldCheck, MapPin, Building, Mail, Phone, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCustomizerStore } from '../../store/customizerStore';
import { designsAPI, quotationsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function QuotationModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    product,
    dimensions,
    material,
    materialThickness,
    color,
    finish,
    printing,
    additionalFeatures,
    artwork,
    quantity,
    estimate,
  } = useCustomizerStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    businessName: user?.companyName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '450 Congress Ave, Suite 1200',
    city: 'Austin',
    postalCode: '78701',
    country: 'USA',
    expectedTimelineWeeks: 2,
    specialRequirements: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please log in or register before requesting a formal quotation.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // 1. Ensure design is saved to DB
      const designPayload = {
        productId: product._id,
        name: `${product.name} Quote Request`,
        dimensions,
        materialId: material?._id,
        materialThickness,
        color,
        finish,
        printing,
        additionalFeatures,
        artwork,
        quantity,
      };

      const designRes = await designsAPI.create(designPayload);
      const savedDesignId = designRes.data._id;

      // 2. Submit Quotation Request
      const quotePayload = {
        designId: savedDesignId,
        quantity,
        customerDetails: {
          name: formData.name,
          businessName: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          deliveryLocation: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          expectedTimelineWeeks: Number(formData.expectedTimelineWeeks),
          specialRequirements: formData.specialRequirements,
        },
      };

      const quoteRes = await quotationsAPI.create(quotePayload);
      if (quoteRes.success && quoteRes.data?._id) {
        onClose();
        navigate(`/quotations/${quoteRes.data._id}`);
      }
    } catch (err) {
      alert(`Error submitting quotation request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-kraft-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-kraft-700 font-bold block">
            Official Production Request
          </span>
          <h2 className="text-xl font-bold font-display text-charcoal-950 mt-1">
            Request Formal Quotation
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Our engineering team will review your specifications, verify die-line tooling, and issue an official quotation with locked pricing.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="bg-kraft-50 border border-kraft-200 rounded-xl p-3 mb-5 text-xs font-mono grid grid-cols-2 gap-2">
          <div>
            <span className="text-charcoal-500 block text-[10px]">Product & Dimensions:</span>
            <span className="font-bold text-charcoal-900 truncate block">
              {dimensions.length} × {dimensions.width} × {dimensions.height} mm ({product?.packagingType})
            </span>
          </div>
          <div>
            <span className="text-charcoal-500 block text-[10px]">Order Volume & Est. Unit:</span>
            <span className="font-bold text-charcoal-900 block">
              {quantity} units @ ${estimate?.breakdown?.estimatedUnitPrice ? Number(estimate.breakdown.estimatedUnitPrice).toFixed(2) : '--'}/unit
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-kraft-300 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Luminary Botanicals"
                className="w-full px-3 py-2 rounded-xl border border-kraft-300 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">Business Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-kraft-300 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-kraft-300 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-charcoal-700 block mb-1">Delivery Address / Facility</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address or warehouse dock"
                className="w-full px-3 py-2 rounded-xl border border-kraft-300 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">City & Postal</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-kraft-300 focus:outline-none focus:ring-1 focus:ring-charcoal-900"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-semibold text-charcoal-700 block mb-1">Special Requirements & Inquiries</label>
            <textarea
              rows={2}
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              placeholder="e.g. Need FSC compliance certificate, pallet stretch wrapped, or split shipment..."
              className="w-full px-3 py-2 rounded-xl border border-kraft-300 focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>30-Day Guaranteed Pricing Locked</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-kraft-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-kraft-300" />
                <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
