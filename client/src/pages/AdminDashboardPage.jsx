import React, { useEffect, useState } from 'react';
import {
  Settings,
  Box,
  FileText,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Clock,
  Truck,
  Edit,
  Save,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'quotations' | 'orders' | 'products' | 'pricing'
  const [metrics, setMetrics] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Quotation for Editing
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteFormData, setQuoteFormData] = useState({
    status: '',
    adminNotes: '',
    customAdjustmentAmount: 0,
    adjustedShipping: 0,
  });

  // Selected Order for Editing
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    status: '',
    notes: '',
    carrier: '',
    trackingNumber: '',
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, quotesRes, ordersRes, pricingRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getQuotations(),
        adminAPI.getOrders(),
        adminAPI.getPricingRules(),
      ]);

      if (dashRes.success) setMetrics(dashRes.data.metrics);
      if (quotesRes.success) setQuotations(quotesRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (pricingRes.success) setPricingRules(pricingRes.data);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [isAdmin]);

  const handleOpenEditQuote = (quote) => {
    setEditingQuote(quote);
    setQuoteFormData({
      status: quote.status,
      adminNotes: quote.adminAdjustments?.adminNotes || '',
      customAdjustmentAmount: quote.adminAdjustments?.customAdjustmentAmount || 0,
      adjustedShipping: quote.adminAdjustments?.adjustedShipping || quote.pricingSnapshot?.shippingEstimate || 0,
    });
  };

  const handleSaveQuoteUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.updateQuotation(editingQuote._id, quoteFormData);
      if (res.success) {
        setQuotations(quotations.map((q) => (q._id === res.data._id ? res.data : q)));
        setEditingQuote(null);
        alert('Quotation successfully updated!');
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleOpenEditOrder = (ord) => {
    setEditingOrder(ord);
    setOrderFormData({
      status: ord.status,
      notes: '',
      carrier: ord.carrier || '',
      trackingNumber: ord.trackingNumber || '',
    });
  };

  const handleSaveOrderUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.updateOrderStatus(editingOrder._id, orderFormData);
      if (res.success) {
        setOrders(orders.map((o) => (o._id === res.data.order._id ? res.data.order : o)));
        setEditingOrder(null);
        alert('Order status successfully updated and logged to activity timeline!');
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-charcoal-500 mt-3">Loading administrative console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kraft-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-kraft-700 uppercase bg-kraft-100 px-2 py-0.5 rounded border border-kraft-200">
              Admin Console
            </span>
            <span className="text-xs text-charcoal-500 font-mono">Logged in as {user?.name}</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-charcoal-950">PackCraft Plant Management</h1>
        </div>

        <button
          onClick={loadDashboard}
          className="px-4 py-2 rounded-xl border border-kraft-300 text-xs font-bold text-charcoal-800 hover:bg-kraft-100 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-kraft-200 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: TrendingUp },
          { id: 'quotations', label: `Quotations (${quotations.length})`, icon: FileText },
          { id: 'orders', label: `Orders & Production (${orders.length})`, icon: ShoppingBag },
          { id: 'pricing', label: 'Pricing Rules Engine', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-kraft-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-kraft-200 shadow-subtle">
              <span className="text-[11px] font-mono text-charcoal-400 uppercase font-semibold block">Total Revenue</span>
              <span className="text-3xl font-extrabold font-display text-charcoal-950 mt-1 block">
                ${metrics.totalRevenue?.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-700 font-mono mt-1 block font-semibold">Confirmed Orders</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-kraft-200 shadow-subtle">
              <span className="text-[11px] font-mono text-charcoal-400 uppercase font-semibold block">Active Orders</span>
              <span className="text-3xl font-extrabold font-display text-charcoal-950 mt-1 block">
                {metrics.totalOrders}
              </span>
              <span className="text-[10px] text-blue-700 font-mono mt-1 block font-semibold">{metrics.inProductionOrders} In Production</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-kraft-200 shadow-subtle">
              <span className="text-[11px] font-mono text-charcoal-400 uppercase font-semibold block">Quotations In Review</span>
              <span className="text-3xl font-extrabold font-display text-charcoal-950 mt-1 block">
                {metrics.pendingQuotations}
              </span>
              <span className="text-[10px] text-amber-700 font-mono mt-1 block font-semibold">Total: {metrics.totalQuotations} issued</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-kraft-200 shadow-subtle">
              <span className="text-[11px] font-mono text-charcoal-400 uppercase font-semibold block">Saved Client Designs</span>
              <span className="text-3xl font-extrabold font-display text-charcoal-950 mt-1 block">
                {metrics.totalDesigns}
              </span>
              <span className="text-[10px] text-charcoal-500 font-mono mt-1 block font-semibold">{metrics.publishedProducts} Active Templates</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATION MANAGEMENT */}
      {activeTab === 'quotations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-kraft-200 shadow-subtle overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-kraft-100/70 border-b border-kraft-200 text-charcoal-700 font-bold">
                <tr>
                  <th className="p-4">Quotation #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product Specs</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kraft-100">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-kraft-50/50">
                    <td className="p-4 font-bold text-charcoal-900">{q.quotationNumber}</td>
                    <td className="p-4">
                      <span className="font-semibold text-charcoal-900 block">{q.customerDetails?.name}</span>
                      <span className="text-[10px] text-charcoal-500 block">{q.customerDetails?.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-charcoal-900 block font-semibold">{q.configurationSnapshot?.productName}</span>
                      <span className="text-[10px] text-charcoal-500 block">
                        {q.configurationSnapshot?.dimensions?.length}x{q.configurationSnapshot?.dimensions?.width}x{q.configurationSnapshot?.dimensions?.height} mm
                      </span>
                    </td>
                    <td className="p-4 font-bold">{q.quantity} pcs</td>
                    <td className="p-4 font-bold text-charcoal-950">${q.pricingSnapshot?.totalAmount?.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-kraft-100 text-charcoal-800 border border-kraft-200">
                        {q.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEditQuote(q)}
                        className="px-3 py-1.5 rounded-lg border border-kraft-300 hover:bg-kraft-100 font-bold text-xs"
                      >
                        Review / Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quotation Edit Modal */}
          {editingQuote && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-kraft-200 space-y-4">
                <h3 className="font-display font-bold text-lg text-charcoal-950">
                  Manage Quotation {editingQuote.quotationNumber}
                </h3>
                <form onSubmit={handleSaveQuoteUpdate} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-charcoal-700 block mb-1">Quotation Status</label>
                    <select
                      value={quoteFormData.status}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono"
                    >
                      <option value="requested">Requested</option>
                      <option value="under_review">Under Review</option>
                      <option value="quotation_prepared">Quotation Prepared</option>
                      <option value="sent">Sent to Customer</option>
                      <option value="accepted">Accepted</option>
                      <option value="revision_requested">Revision Requested</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-charcoal-700 block mb-1">Adjust Freight / Shipping ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={quoteFormData.adjustedShipping}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, adjustedShipping: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-charcoal-700 block mb-1">Custom Adjustment / Discount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. -50 for discount, or 25 for custom surcharge"
                      value={quoteFormData.customAdjustmentAmount}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, customAdjustmentAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-charcoal-700 block mb-1">Internal / Customer Notes</label>
                    <textarea
                      rows={3}
                      value={quoteFormData.adminNotes}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, adminNotes: e.target.value })}
                      placeholder="e.g. Verified knife die tooling. Discount applied for multi-lot purchase."
                      className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingQuote(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-kraft-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850"
                    >
                      Save Updates
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDER & PRODUCTION MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-kraft-200 shadow-subtle overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-kraft-100/70 border-b border-kraft-200 text-charcoal-700 font-bold">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Carrier & Tracking</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kraft-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-kraft-50/50">
                    <td className="p-4 font-bold text-charcoal-900">{o.orderNumber}</td>
                    <td className="p-4">{o.shippingAddress?.fullName} ({o.shippingAddress?.company})</td>
                    <td className="p-4 font-bold">{o.quantity} pcs</td>
                    <td className="p-4 font-bold text-charcoal-950">${o.totalAmount?.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-charcoal-600">
                      {o.trackingNumber ? `${o.carrier || 'Carrier'}: ${o.trackingNumber}` : 'Pending Dispatch'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEditOrder(o)}
                        className="px-3 py-1.5 rounded-lg border border-kraft-300 hover:bg-kraft-100 font-bold text-xs"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Update Modal */}
          {editingOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-kraft-200 space-y-4">
                <h3 className="font-display font-bold text-lg text-charcoal-950">
                  Update Production: {editingOrder.orderNumber}
                </h3>
                <form onSubmit={handleSaveOrderUpdate} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-charcoal-700 block mb-1">Production Status Stage</label>
                    <select
                      value={orderFormData.status}
                      onChange={(e) => setOrderFormData({ ...orderFormData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono"
                    >
                      <option value="order_placed">Order Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="artwork_approval_pending">Artwork Approval Pending</option>
                      <option value="artwork_approved">Artwork Approved</option>
                      <option value="production_scheduled">Production Scheduled</option>
                      <option value="in_production">In Production</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-charcoal-700 block mb-1">Carrier Name</label>
                      <input
                        type="text"
                        placeholder="e.g. FedEx Freight"
                        value={orderFormData.carrier}
                        onChange={(e) => setOrderFormData({ ...orderFormData, carrier: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-charcoal-700 block mb-1">Tracking Number</label>
                      <input
                        type="text"
                        placeholder="e.g. FX-9921-0021-US"
                        value={orderFormData.trackingNumber}
                        onChange={(e) => setOrderFormData({ ...orderFormData, trackingNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-charcoal-700 block mb-1">Stage Log Notes (Saved to Activity Timeline)</label>
                    <textarea
                      rows={3}
                      value={orderFormData.notes}
                      onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                      placeholder="e.g. Sheets printed on press line 2. Transferred to auto-stripping die-cutter."
                      className="w-full px-3 py-2 rounded-xl border border-kraft-300 font-mono resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingOrder(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-kraft-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850"
                    >
                      Update Stage
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRICING RULES */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-kraft-200 shadow-subtle p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-950">Active Pricing Engine Parameters</h3>
            <p className="text-xs text-charcoal-500">
              The pricing engine computes estimates based on unfolded blank surface area (m²), board caliper, machine die setup amortization, and quantity volume discount tiers.
            </p>

            {pricingRules.map((rule) => (
              <div key={rule._id} className="p-4 rounded-xl bg-kraft-50 border border-kraft-200 text-xs font-mono space-y-3">
                <div className="flex justify-between font-bold text-charcoal-950 text-sm">
                  <span>{rule.name}</span>
                  <span className="text-emerald-700">Active</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-charcoal-600">
                  <div>Base Tooling Setup: ${rule.baseDieCutSetup}</div>
                  <div>Full-Color Print Rate: ${rule.printRatePerSqMeter?.full_color_outside} / m²</div>
                  <div>Matte Coating: ${rule.finishCostPerSqMeter?.matte} / m²</div>
                  <div>Waste Allowance: {rule.wasteAllowancePercentage}%</div>
                </div>

                <div className="pt-2 border-t border-kraft-200">
                  <span className="font-bold text-charcoal-900 block mb-1">Volume Tier Discounts:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    {rule.quantityTiers?.map((t, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border border-kraft-200">
                        {t.label}: {Math.round((1 - t.discountMultiplier) * 100)}% Discount
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
