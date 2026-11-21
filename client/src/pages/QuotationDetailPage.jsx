import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ShoppingBag,
  Send,
  AlertCircle,
  Truck,
  Building,
} from 'lucide-react';
import { quotationsAPI, ordersAPI } from '../services/api';
import { generateQuotationPDF } from '../services/quotationPdf';

export default function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Revision Modal State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Order Placement Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderAddress, setOrderAddress] = useState({
    fullName: '',
    company: '',
    street: '',
    city: '',
    state: 'TX',
    postalCode: '',
    country: 'USA',
    phone: '',
  });

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await quotationsAPI.getById(id);
      if (res.success && res.data) {
        setQuotation(res.data);
        const c = res.data.customerDetails || {};
        setOrderAddress({
          fullName: c.name || '',
          company: c.businessName || '',
          street: c.deliveryLocation?.address || '120 Innovation Way',
          city: c.deliveryLocation?.city || 'Austin',
          state: 'TX',
          postalCode: c.deliveryLocation?.postalCode || '78701',
          country: c.deliveryLocation?.country || 'USA',
          phone: c.phone || '',
        });
      }
    } catch (err) {
      console.error('Error fetching quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      const res = await quotationsAPI.accept(id);
      if (res.success) {
        setQuotation(res.data);
      }
    } catch (err) {
      alert(`Accept error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevisionSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await quotationsAPI.requestRevision(id, { revisionNotes });
      if (res.success) {
        setShowRevisionModal(false);
        setQuotation(res.data);
      }
    } catch (err) {
      alert(`Revision error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await ordersAPI.create({
        quotationId: quotation._id,
        shippingAddress: orderAddress,
        paymentMethod: 'invoice',
      });
      if (res.success && res.data?._id) {
        setShowOrderModal(false);
        navigate(`/orders/${res.data._id}`);
      }
    } catch (err) {
      alert(`Order placement error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !quotation) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-charcoal-500 mt-3">Loading quotation document...</p>
      </div>
    );
  }

  const config = quotation.configurationSnapshot || {};
  const dims = config.dimensions || {};
  const pricing = quotation.pricingSnapshot || {};
  const customer = quotation.customerDetails || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back navigation */}
      <Link to="/quotations" className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-950">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Quotations</span>
      </Link>

      {/* Main Quotation Header Card */}
      <div className="bg-white rounded-3xl border border-kraft-200 shadow-craft p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-kraft-100 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono font-bold text-sm bg-kraft-100 px-2.5 py-1 rounded border border-kraft-200 text-charcoal-900">
                {quotation.quotationNumber}
              </span>
              <span className="capitalize px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Status: {quotation.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-charcoal-950">
              Commercial Packaging Quotation
            </h1>
            <p className="text-xs text-charcoal-500 font-mono mt-1">
              Issued {new Date(quotation.createdAt).toLocaleDateString()} • Valid through {new Date(quotation.validityDate).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={() => generateQuotationPDF(quotation)}
            className="px-4 py-2.5 rounded-xl border border-kraft-300 text-xs font-bold text-charcoal-900 hover:bg-kraft-100 transition-colors flex items-center gap-2 shadow-subtle shrink-0"
          >
            <Download className="w-4 h-4 text-kraft-700" />
            <span>Download Official PDF</span>
          </button>
        </div>

        {/* Client & Production Logistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-kraft-50 p-4 rounded-2xl border border-kraft-200 text-xs font-mono">
          <div>
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Client Account</span>
            <span className="font-bold text-charcoal-900 block mt-0.5">{customer.name} ({customer.businessName})</span>
            <span className="text-charcoal-500 block">{customer.email}</span>
            <span className="text-charcoal-500 block">Deliver to: {customer.deliveryLocation?.city}, {customer.deliveryLocation?.country}</span>
          </div>
          <div>
            <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Estimated Production</span>
            <span className="font-bold text-charcoal-900 block mt-0.5">{customer.expectedTimelineWeeks} Weeks Manufacturing Lead</span>
            <span className="text-charcoal-500 block">Pricing Guarantee: 30 Calendar Days</span>
            {quotation.adminAdjustments?.adminNotes && (
              <span className="text-kraft-800 font-semibold block mt-1">Admin note: {quotation.adminAdjustments.adminNotes}</span>
            )}
          </div>
        </div>

        {/* Technical Packaging Specifications */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-charcoal-950">
            Engineered Technical Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white border border-kraft-200">
              <span className="text-charcoal-400 block text-[10px]">Structure</span>
              <span className="font-bold text-charcoal-900 capitalize">{config.productName || 'Box'}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-kraft-200">
              <span className="text-charcoal-400 block text-[10px]">Dimensions (mm)</span>
              <span className="font-bold text-charcoal-900">{dims.length} × {dims.width} × {dims.height}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-kraft-200">
              <span className="text-charcoal-400 block text-[10px]">Material</span>
              <span className="font-bold text-charcoal-900 truncate block">{config.materialName}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-kraft-200">
              <span className="text-charcoal-400 block text-[10px]">Finish & Print</span>
              <span className="font-bold text-charcoal-900 capitalize">{config.finish} / {config.printing?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Pricing Table Snapshot */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-charcoal-950">
            Authorized Commercial Pricing
          </h3>
          <div className="border border-kraft-200 rounded-2xl overflow-hidden bg-white text-xs font-mono">
            <div className="divide-y divide-kraft-100">
              <div className="p-3 flex justify-between bg-kraft-50/50 text-charcoal-700 font-semibold">
                <span>Production Run Volume:</span>
                <span>{quotation.quantity} Units</span>
              </div>
              <div className="p-3 flex justify-between text-charcoal-600">
                <span>Subtotal (Board, Inks, Finish & Setups):</span>
                <span>${pricing.subtotal?.toFixed(2)}</span>
              </div>
              <div className="p-3 flex justify-between text-charcoal-600">
                <span>Standard Manufacturing Tax (5%):</span>
                <span>${pricing.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="p-3 flex justify-between text-charcoal-600">
                <span>Estimated Freight & Pallet Delivery:</span>
                <span>${(quotation.adminAdjustments?.adjustedShipping || pricing.shippingEstimate)?.toFixed(2)}</span>
              </div>
              <div className="p-4 flex justify-between bg-charcoal-950 text-white font-bold text-sm">
                <span>Total Confirmed Investment:</span>
                <span className="text-kraft-300">
                  ${pricing.totalAmount?.toFixed(2)} (${pricing.unitCost?.toFixed(2)} / unit)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls for Customer */}
        <div className="pt-4 border-t border-kraft-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRevisionModal(true)}
              className="px-4 py-2.5 rounded-xl border border-kraft-300 text-xs font-semibold text-charcoal-700 hover:bg-kraft-100"
            >
              Request Specs Revision
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {quotation.status !== 'accepted' ? (
              <button
                disabled={actionLoading}
                onClick={handleAccept}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Quotation Terms</span>
              </button>
            ) : (
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-kraft-300" />
                <span>Place Confirmed Production Order</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-kraft-200 space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-950">Request Quotation Revision</h3>
            <p className="text-xs text-charcoal-600">
              Specify requested dimension modifications, quantity adjustments, or shipping requirement changes.
            </p>
            <form onSubmit={handleRevisionSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="e.g. Please update quantity from 250 to 500 units and recalculate volume discount..."
                className="w-full p-3 rounded-xl border border-kraft-300 text-xs focus:outline-none focus:ring-1 focus:ring-charcoal-900 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-kraft-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Placement Confirmation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-kraft-200 space-y-4 my-8">
            <div>
              <span className="text-[11px] font-mono uppercase text-kraft-700 font-bold">Purchase Order Conversion</span>
              <h3 className="font-display font-bold text-xl text-charcoal-950 mt-0.5">Confirm Packaging Order</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Authorize manufacturing run based on accepted Quotation {quotation.quotationNumber}.
              </p>
            </div>

            <div className="bg-kraft-50 p-3 rounded-xl border border-kraft-200 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-bold">{quotation.quantity} Units</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <span className="font-bold">${pricing.unitCost?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-kraft-200 pt-1 font-bold text-charcoal-950">
                <span>Total Amount:</span>
                <span>${pricing.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal-700 block mb-1">Company / Consignee Name</label>
                <input
                  type="text"
                  required
                  value={orderAddress.company}
                  onChange={(e) => setOrderAddress({ ...orderAddress, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-kraft-300"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal-700 block mb-1">Delivery Dock / Street Address</label>
                <input
                  type="text"
                  required
                  value={orderAddress.street}
                  onChange={(e) => setOrderAddress({ ...orderAddress, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-kraft-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={orderAddress.city}
                    onChange={(e) => setOrderAddress({ ...orderAddress, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-kraft-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={orderAddress.state}
                    onChange={(e) => setOrderAddress({ ...orderAddress, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-kraft-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={orderAddress.postalCode}
                    onChange={(e) => setOrderAddress({ ...orderAddress, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-kraft-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-kraft-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 flex items-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-kraft-300" />
                  <span>{actionLoading ? 'Placing Order...' : 'Authorize Purchase Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
