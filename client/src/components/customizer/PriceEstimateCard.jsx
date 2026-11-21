import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Bookmark, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCustomizerStore } from '../../store/customizerStore';
import { useAuthStore } from '../../store/authStore';
import { designsAPI } from '../../services/api';
import confetti from 'canvas-confetti';

export default function PriceEstimateCard({ onRequestQuote }) {
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
    setQuantity,
    estimate,
    isEstimating,
    estimateError,
  } = useCustomizerStore();

  const { isAuthenticated } = useAuthStore();
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [designName, setDesignName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const quantityOptions = [50, 100, 250, 500, 1000, 2500, 5000];

  const handleSaveDesign = async () => {
    if (!isAuthenticated) {
      alert('Please sign in or register to save your custom packaging designs to your account.');
      return;
    }

    try {
      setSavingDesign(true);
      const name = designName || `${product?.name || 'Custom'} - ${dimensions.length}x${dimensions.width}x${dimensions.height}`;
      const payload = {
        productId: product._id,
        name,
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

      const res = await designsAPI.create(payload);
      if (res.success) {
        setSaveSuccess(true);
        setShowSaveModal(false);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      alert(`Error saving design: ${err.message}`);
    } finally {
      setSavingDesign(false);
    }
  };

  const breakdown = estimate?.breakdown;

  return (
    <div className="bg-white rounded-2xl border border-kraft-200 shadow-craft p-5 space-y-5">
      {/* Header & Per Unit Price */}
      <div className="flex items-start justify-between border-b border-kraft-100 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-400 font-semibold block">
            Estimated Manufacturing Cost
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-display text-charcoal-950">
              ${breakdown ? Number(breakdown.estimatedUnitPrice).toFixed(2) : '--'}
            </span>
            <span className="text-xs text-charcoal-500 font-medium">/ unit</span>
          </div>
          {estimate?.discountPercent > 0 && (
            <span className="inline-block mt-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {estimate.discountPercent}% Volume Tier Discount Applied
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-charcoal-400 block">Total Est.</span>
          <span className="text-xl font-bold font-mono text-charcoal-900 block mt-0.5">
            ${breakdown ? Number(breakdown.estimatedTotal).toFixed(2) : '--'}
          </span>
          <span className="text-[10px] text-charcoal-400">incl. tax & freight</span>
        </div>
      </div>

      {/* Quantity Tier Selector */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-charcoal-800 uppercase tracking-wider font-mono">
            Production Run Quantity
          </label>
          <span className="text-charcoal-500 font-mono text-[11px]">MOQ: {product?.minOrderQuantity || 50}</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {quantityOptions.map((qty) => {
            const isSelected = quantity === qty;
            return (
              <button
                key={qty}
                onClick={() => setQuantity(qty)}
                className={`py-1.5 text-center rounded-lg text-xs font-mono font-semibold transition-all ${
                  isSelected
                    ? 'bg-charcoal-900 text-white shadow-sm ring-1 ring-charcoal-900'
                    : 'bg-kraft-50 hover:bg-kraft-100 text-charcoal-700 border border-kraft-200'
                }`}
              >
                {qty}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transparent Cost Breakdown (Collapsible) */}
      <div className="border border-kraft-200 rounded-xl bg-kraft-50/60 overflow-hidden text-xs">
        <button
          onClick={() => setBreakdownOpen(!breakdownOpen)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-charcoal-800 font-semibold hover:bg-kraft-100/70 transition-colors"
        >
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-kraft-700" />
            Engineering Cost Breakdown
          </span>
          {breakdownOpen ? <ChevronUp className="w-4 h-4 text-charcoal-500" /> : <ChevronDown className="w-4 h-4 text-charcoal-500" />}
        </button>

        {breakdownOpen && breakdown && (
          <div className="p-3.5 border-t border-kraft-200 space-y-2 bg-white text-xs font-mono">
            <div className="flex justify-between text-charcoal-600">
              <span>Net Surface Blank Area:</span>
              <span className="font-semibold text-charcoal-900">{estimate.sqMetersPerUnit} m² / unit</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Unit Material Substrate:</span>
              <span>${breakdown.unitMaterialCost.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Unit Inks & Printing:</span>
              <span>${breakdown.unitPrintingCost.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Unit Surface Coating:</span>
              <span>${breakdown.unitFinishCost.toFixed(3)}</span>
            </div>
            {breakdown.unitFeaturesCost > 0 && (
              <div className="flex justify-between text-charcoal-600">
                <span>Unit Custom Features:</span>
                <span>${breakdown.unitFeaturesCost.toFixed(3)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-600">
              <span>Fixed Tooling & Die Setup:</span>
              <span>${breakdown.totalSetupCharges.toFixed(2)} (${breakdown.setupCostPerUnit.toFixed(3)} / unit)</span>
            </div>
            <div className="border-t border-dashed border-kraft-200 pt-2 flex justify-between font-bold text-charcoal-950">
              <span>Subtotal ({quantity} units):</span>
              <span>${breakdown.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-500 text-[11px]">
              <span>Manufacturing Tax ({breakdown.taxRatePercentage}%):</span>
              <span>${breakdown.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-500 text-[11px]">
              <span>Ground Logistics Estimate:</span>
              <span>${breakdown.shippingEstimate.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Design saved to your account! You can retrieve or re-quote anytime.</span>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => setShowSaveModal(true)}
          className="py-3 px-4 rounded-xl text-xs font-bold border border-charcoal-900 text-charcoal-900 hover:bg-kraft-100 transition-colors flex items-center justify-center gap-2"
        >
          <Bookmark className="w-4 h-4 text-charcoal-800" />
          Save Design
        </button>

        <button
          onClick={onRequestQuote}
          className="py-3 px-4 rounded-xl text-xs font-bold bg-charcoal-950 hover:bg-charcoal-850 text-white shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4 text-kraft-300" />
          Request Quotation
        </button>
      </div>

      <p className="text-[10px] text-charcoal-400 text-center leading-relaxed">
        * Estimates are computed authoritatively by PackCraft pricing rules based on net sheet yield, setup amortization, and volume scale.
      </p>

      {/* Save Design Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-kraft-200 space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-950">Save Packaging Design</h3>
            <p className="text-xs text-charcoal-600">
              Give this configuration a memorable name to organize your packaging library.
            </p>
            <input
              type="text"
              placeholder="e.g. Autumn PR Mailer v1"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-kraft-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-charcoal-900"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-kraft-100"
              >
                Cancel
              </button>
              <button
                disabled={savingDesign}
                onClick={handleSaveDesign}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-charcoal-950 text-white hover:bg-charcoal-850 disabled:opacity-50"
              >
                {savingDesign ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
