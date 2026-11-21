import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { quotationsAPI } from '../services/api';

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const res = await quotationsAPI.getAll();
        if (res.success) {
          setQuotations(res.data);
        }
      } catch (err) {
        console.error('Error fetching quotations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Accepted</span>;
      case 'quotation_prepared':
      case 'sent':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-blue-50 text-blue-800 border border-blue-200">Quotation Ready</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">Under Engineering Review</span>;
      case 'revision_requested':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-purple-50 text-purple-800 border border-purple-200">Revision In Review</span>;
      case 'declined':
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-red-50 text-red-800 border border-red-200">Declined</span>;
      case 'requested':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-kraft-100 text-charcoal-700 border border-kraft-200">Requested</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-kraft-700 font-bold block mb-1">
          Commercial Procurement
        </span>
        <h1 className="text-3xl font-bold font-display text-charcoal-950">Quotation Inquiries</h1>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
          Review official price quotes, download PDF specifications, and confirm production orders.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-charcoal-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-charcoal-500 mt-3">Loading quotations...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-kraft-200 p-8 space-y-4">
          <FileText className="w-12 h-12 text-kraft-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">No Quotation Requests Yet</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Design your packaging in 3D and click "Request Quotation" to submit an official inquiry.
          </p>
          <Link
            to="/customizer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-charcoal-950 text-white"
          >
            Launch 3D Configurator
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-kraft-200 shadow-subtle overflow-hidden">
          <div className="divide-y divide-kraft-100">
            {quotations.map((quote) => {
              const config = quote.configurationSnapshot || {};
              const dims = config.dimensions || {};
              const pricing = quote.pricingSnapshot || {};

              return (
                <div
                  key={quote._id}
                  onClick={() => navigate(`/quotations/${quote._id}`)}
                  className="p-5 hover:bg-kraft-50/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-charcoal-900 bg-kraft-100 px-2 py-0.5 rounded border border-kraft-200">
                        {quote.quotationNumber}
                      </span>
                      {getStatusBadge(quote.status)}
                    </div>

                    <h4 className="font-display font-bold text-base text-charcoal-950">
                      {config.productName || 'Custom Packaging Box'}
                    </h4>

                    <p className="text-xs text-charcoal-500 font-mono">
                      {dims.length} × {dims.width} × {dims.height} mm • {config.materialName || 'Kraft'} • {config.finish}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 text-right">
                    <div>
                      <span className="text-[10px] font-mono text-charcoal-400 uppercase block">Total Quoted</span>
                      <span className="text-lg font-bold font-mono text-charcoal-950">
                        ${pricing.totalAmount?.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-charcoal-500 block">
                        {quote.quantity} units (${pricing.unitCost?.toFixed(2)}/unit)
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
