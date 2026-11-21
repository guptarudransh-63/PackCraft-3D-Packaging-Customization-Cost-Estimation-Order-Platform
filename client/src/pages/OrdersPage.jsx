import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Truck, CheckCircle2, Clock, PackageCheck } from 'lucide-react';
import { ordersAPI } from '../services/api';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await ordersAPI.getAll();
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'dispatched':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-blue-800 border border-blue-200">Dispatched in Transit</span>;
      case 'in_production':
      case 'quality_check':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">In Production / QC</span>;
      case 'artwork_approved':
      case 'production_scheduled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-purple-50 text-purple-800 border border-purple-200">Scheduled</span>;
      case 'order_placed':
      case 'confirmed':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-kraft-100 text-charcoal-700 border border-kraft-200">Order Placed</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
          Manufacturing Fulfillment
        </span>
        <h1 className="text-3xl font-bold font-display text-charcoal-950">Active Orders & Shipments</h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
          Monitor your plant floor manufacturing progress, quality inspections, and courier delivery tracking.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-charcoal-500 mt-3">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-kraft-200 p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-kraft-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">No Orders Placed Yet</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Once you accept a quotation, you can authorize confirmed production runs and track their status here.
          </p>
          <Link
            to="/customizer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-charcoal-950 text-white"
          >
            Start Packaging Design
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-kraft-200 shadow-subtle overflow-hidden">
          <div className="divide-y divide-kraft-100">
            {orders.map((order) => {
              const config = order.configurationSnapshot || {};
              const dims = config.dimensions || {};

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="p-5 hover:bg-kraft-50/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-charcoal-900 bg-kraft-100 px-2 py-0.5 rounded border border-kraft-200">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>

                    <h4 className="font-display font-bold text-base text-charcoal-950">
                      {config.productName || 'Packaging Production Run'}
                    </h4>

                    <p className="text-xs text-charcoal-500 font-mono">
                      {dims.length} × {dims.width} × {dims.height} mm • {config.materialName || 'Kraft'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 text-right">
                    <div>
                      <span className="text-[10px] font-mono text-charcoal-400 uppercase block">Authorized Total</span>
                      <span className="text-lg font-bold font-mono text-charcoal-950">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-charcoal-500 block">
                        {order.quantity} units (${order.confirmedUnitPrice?.toFixed(2)}/unit)
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-charcoal-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
