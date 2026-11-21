import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Calendar,
  Box,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { ordersAPI } from '../services/api';

const ORDER_STEPS = [
  { key: 'order_placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'artwork_approved', label: 'Artwork Approved' },
  { key: 'production_scheduled', label: 'Plant Scheduled' },
  { key: 'in_production', label: 'In Production' },
  { key: 'quality_check', label: 'Quality Check' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await ordersAPI.getById(id);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-charcoal-500 mt-3">Loading order tracking timeline...</p>
      </div>
    );
  }

  const { order, activities = [] } = data;
  const config = order.configurationSnapshot || {};
  const dims = config.dimensions || {};
  const addr = order.shippingAddress || {};

  // Find step index
  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.key === order.status);
  const activeStepIdx = currentStepIdx >= 0 ? currentStepIdx : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-950">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-kraft-200 shadow-craft p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-kraft-100 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono font-bold text-sm bg-kraft-100 px-2.5 py-1 rounded border border-kraft-200 text-charcoal-900">
                {order.orderNumber}
              </span>
              <span className="capitalize px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Payment: {order.paymentStatus}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-charcoal-950">
              Manufacturing Tracking & Fulfillment
            </h1>
            <p className="text-xs text-charcoal-500 font-mono mt-1">
              Authorized {new Date(order.createdAt).toLocaleDateString()} • Est. Ship Date: {new Date(order.estimatedShipDate).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-charcoal-400 uppercase block">Confirmed Total</span>
            <span className="text-2xl font-bold font-mono text-charcoal-950 block">
              ${order.totalAmount?.toFixed(2)}
            </span>
            <span className="text-xs text-charcoal-500 font-mono">
              {order.quantity} pcs @ ${order.confirmedUnitPrice?.toFixed(2)} / unit
            </span>
          </div>
        </div>

        {/* Visual Production Progress Stepper */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-charcoal-950">
            Plant Floor Production Progress
          </h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[700px] relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-kraft-200 -z-0"></div>
              <div
                className="absolute top-4 left-6 h-0.5 bg-charcoal-900 transition-all duration-500 -z-0"
                style={{
                  width: `${(activeStepIdx / (ORDER_STEPS.length - 1)) * 96}%`,
                }}
              ></div>

              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-20">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-charcoal-900 text-kraft-300 ring-4 ring-kraft-200 shadow-md'
                          : isPassed
                          ? 'bg-charcoal-900 text-white'
                          : 'bg-kraft-100 text-charcoal-400 border border-kraft-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-semibold mt-2 leading-tight ${
                        isCurrent ? 'text-charcoal-950 font-bold' : isPassed ? 'text-charcoal-800' : 'text-charcoal-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dispatch & Carrier Information */}
        {order.trackingNumber && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-800" />
              <div>
                <span className="font-bold text-emerald-950 block">Carrier Tracking: {order.carrier || 'Freight Line'}</span>
                <span className="text-emerald-800 font-semibold">{order.trackingNumber}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-md border border-emerald-200">
              In Transit
            </span>
          </div>
        )}

        {/* Delivery Address & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-kraft-50 border border-kraft-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Delivery Consignee</span>
            <span className="font-bold text-charcoal-950 block">{addr.fullName} ({addr.company})</span>
            <span className="text-charcoal-600 block">{addr.street}</span>
            <span className="text-charcoal-600 block">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</span>
          </div>

          <div className="p-4 rounded-2xl bg-kraft-50 border border-kraft-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block">Manufacturing Specifications</span>
            <span className="font-bold text-charcoal-950 block">{config.productName}</span>
            <span className="text-charcoal-600 block">Dimensions: {dims.length} × {dims.width} × {dims.height} mm</span>
            <span className="text-charcoal-600 block">Material: {config.materialName} ({config.finish})</span>
          </div>
        </div>

        {/* Production Activity Timeline History */}
        <div className="space-y-4 pt-4 border-t border-kraft-100">
          <h3 className="font-display font-bold text-base text-charcoal-950">
            Order Activity History
          </h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-charcoal-500 font-mono">No status transitions logged yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-kraft-200 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-charcoal-900 mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-charcoal-400 text-[10px]">
                      <span>Actor: {act.actor?.name} ({act.actor?.role})</span>
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="font-bold text-charcoal-900 capitalize mt-0.5">
                      Status transitioned to: {act.newStatus?.replace(/_/g, ' ')}
                    </p>
                    {act.notes && (
                      <p className="text-charcoal-600 text-xs mt-0.5">{act.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
