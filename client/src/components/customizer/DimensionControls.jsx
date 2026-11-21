import React from 'react';
import { Ruler, Maximize2, Minimize2 } from 'lucide-react';
import { useCustomizerStore } from '../../store/customizerStore';

export default function DimensionControls() {
  const { product, dimensions, setDimensions } = useCustomizerStore();

  if (!product) return null;

  const bounds = product.dimensions || {
    minL: 100, maxL: 500, defaultL: 260,
    minW: 80, maxW: 400, defaultW: 200,
    minH: 30, maxH: 200, defaultH: 80,
  };

  const handleDimensionChange = (key, val) => {
    const num = Math.round(Number(val));
    setDimensions({ [key]: num });
  };

  const applyPreset = (preset) => {
    if (preset === 'small') {
      setDimensions({
        length: Math.round(bounds.minL + (bounds.defaultL - bounds.minL) * 0.4),
        width: Math.round(bounds.minW + (bounds.defaultW - bounds.minW) * 0.4),
        height: Math.round(bounds.minH + (bounds.defaultH - bounds.minH) * 0.4),
      });
    } else if (preset === 'default') {
      setDimensions({
        length: bounds.defaultL,
        width: bounds.defaultW,
        height: bounds.defaultH,
      });
    } else if (preset === 'large') {
      setDimensions({
        length: Math.round(bounds.defaultL + (bounds.maxL - bounds.defaultL) * 0.6),
        width: Math.round(bounds.defaultW + (bounds.maxW - bounds.defaultW) * 0.6),
        height: Math.round(bounds.defaultH + (bounds.maxH - bounds.defaultH) * 0.6),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-kraft-600" />
          Package Dimensions (mm)
        </label>
        {/* Quick size presets */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => applyPreset('small')}
            className="px-2 py-0.5 rounded bg-kraft-100 hover:bg-kraft-200 text-charcoal-700 transition-colors"
          >
            S
          </button>
          <button
            onClick={() => applyPreset('default')}
            className="px-2 py-0.5 rounded bg-kraft-100 hover:bg-kraft-200 text-charcoal-700 transition-colors font-semibold"
          >
            M
          </button>
          <button
            onClick={() => applyPreset('large')}
            className="px-2 py-0.5 rounded bg-kraft-100 hover:bg-kraft-200 text-charcoal-700 transition-colors"
          >
            L
          </button>
        </div>
      </div>

      {/* Length Input & Slider */}
      <div className="bg-white/70 p-3 rounded-xl border border-kraft-200 shadow-subtle space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-charcoal-700">Length (L)</span>
          <div className="flex items-center gap-1 font-mono">
            <input
              type="number"
              min={bounds.minL}
              max={bounds.maxL}
              value={dimensions.length}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              className="w-16 px-2 py-1 text-right text-xs rounded border border-kraft-300 font-bold bg-kraft-50 focus:outline-none focus:border-charcoal-900"
            />
            <span className="text-charcoal-400">mm</span>
          </div>
        </div>
        <input
          type="range"
          min={bounds.minL}
          max={bounds.maxL}
          value={dimensions.length}
          onChange={(e) => handleDimensionChange('length', e.target.value)}
          className="w-full accent-charcoal-900 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-charcoal-400 font-mono">
          <span>Min: {bounds.minL}mm</span>
          <span>Max: {bounds.maxL}mm</span>
        </div>
      </div>

      {/* Width Input & Slider */}
      <div className="bg-white/70 p-3 rounded-xl border border-kraft-200 shadow-subtle space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-charcoal-700">Width (W)</span>
          <div className="flex items-center gap-1 font-mono">
            <input
              type="number"
              min={bounds.minW}
              max={bounds.maxW}
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="w-16 px-2 py-1 text-right text-xs rounded border border-kraft-300 font-bold bg-kraft-50 focus:outline-none focus:border-charcoal-900"
            />
            <span className="text-charcoal-400">mm</span>
          </div>
        </div>
        <input
          type="range"
          min={bounds.minW}
          max={bounds.maxW}
          value={dimensions.width}
          onChange={(e) => handleDimensionChange('width', e.target.value)}
          className="w-full accent-charcoal-900 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-charcoal-400 font-mono">
          <span>Min: {bounds.minW}mm</span>
          <span>Max: {bounds.maxW}mm</span>
        </div>
      </div>

      {/* Height / Depth Input & Slider */}
      <div className="bg-white/70 p-3 rounded-xl border border-kraft-200 shadow-subtle space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-charcoal-700">Height / Depth (H)</span>
          <div className="flex items-center gap-1 font-mono">
            <input
              type="number"
              min={bounds.minH}
              max={bounds.maxH}
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className="w-16 px-2 py-1 text-right text-xs rounded border border-kraft-300 font-bold bg-kraft-50 focus:outline-none focus:border-charcoal-900"
            />
            <span className="text-charcoal-400">mm</span>
          </div>
        </div>
        <input
          type="range"
          min={bounds.minH}
          max={bounds.maxH}
          value={dimensions.height}
          onChange={(e) => handleDimensionChange('height', e.target.value)}
          className="w-full accent-charcoal-900 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-charcoal-400 font-mono">
          <span>Min: {bounds.minH}mm</span>
          <span>Max: {bounds.maxH}mm</span>
        </div>
      </div>
    </div>
  );
}
