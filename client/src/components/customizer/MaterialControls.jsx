import React from 'react';
import { Layers, Sparkles, Sliders, Check, Eye } from 'lucide-react';
import { useCustomizerStore } from '../../store/customizerStore';

export default function MaterialControls() {
  const {
    product,
    material,
    materialsList,
    setMaterial,
    materialThickness,
    setMaterialThickness,
    color,
    setColor,
    finish,
    setFinish,
    printing,
    setPrinting,
    additionalFeatures,
    toggleFeature,
    lidOpenAngle,
    setLidOpenAngle,
  } = useCustomizerStore();

  if (!product) return null;

  // Materials available for this product
  const availableMaterials = product.supportedMaterials && product.supportedMaterials.length > 0
    ? product.supportedMaterials
    : materialsList;

  const colorPresets = material?.colorPresets || [
    { name: 'Natural Kraft', hex: '#c89d6c' },
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Obsidian Black', hex: '#18191b' },
    { name: 'Deep Sage', hex: '#263b2f' },
    { name: 'Terracotta', hex: '#b86d4e' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Material Substrate */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono flex items-center gap-1.5 mb-2.5">
          <Layers className="w-3.5 h-3.5 text-kraft-600" />
          Material Substrate
        </label>
        <div className="space-y-2">
          {availableMaterials.map((mat) => {
            const isSelected = material?._id === mat._id || material?.code === mat.code;
            return (
              <button
                key={mat._id || mat.code}
                onClick={() => setMaterial(mat)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                  isSelected
                    ? 'border-charcoal-900 bg-white shadow-subtle ring-1 ring-charcoal-900'
                    : 'border-kraft-200 bg-white/60 hover:bg-white hover:border-kraft-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-charcoal-950">{mat.name}</span>
                    {mat.ecoCertifications?.[0] && (
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.2 rounded font-mono">
                        Eco
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 line-clamp-1">{mat.description}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-charcoal-900 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Board Thickness / Caliper */}
      {material?.thicknessOptions?.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono mb-2 block">
            Board Caliper & Thickness
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {material.thicknessOptions.map((opt) => {
              const isSelected = materialThickness === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setMaterialThickness(opt.value)}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'border-charcoal-900 bg-charcoal-900 text-white font-semibold'
                      : 'border-kraft-200 bg-white hover:border-kraft-400 text-charcoal-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-kraft-300' : 'text-charcoal-400'}`}>
                    {opt.gsm} GSM
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Surface Color */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono">
            Surface Base Tone
          </label>
          <span className="text-xs font-mono text-charcoal-500">{color?.name}</span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {colorPresets.map((c) => {
            const isSelected = color?.hex?.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => setColor(c)}
                title={c.name}
                className={`w-8 h-8 rounded-full border-2 transition-transform shadow-sm relative flex items-center justify-center ${
                  isSelected ? 'scale-110 border-charcoal-900 ring-2 ring-kraft-400' : 'border-black/10 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check className={`w-3.5 h-3.5 ${c.hex === '#ffffff' || c.hex === '#fcfbfa' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            );
          })}
          {/* Custom color input */}
          <label className="w-8 h-8 rounded-full border-2 border-dashed border-kraft-400 flex items-center justify-center cursor-pointer hover:bg-kraft-100 transition-colors">
            <input
              type="color"
              value={color?.hex || '#c89d6c'}
              onChange={(e) => setColor({ name: 'Custom Hex', hex: e.target.value })}
              className="opacity-0 w-0 h-0"
            />
            <span className="text-xs font-bold text-kraft-700">+</span>
          </label>
        </div>
      </div>

      {/* 4. Finish & Coating */}
      {product.supportedFinishes?.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono mb-2 block">
            Protective Finish & Sheen
          </label>
          <div className="grid grid-cols-2 gap-2">
            {product.supportedFinishes.map((f) => {
              const isSelected = finish === f.code;
              return (
                <button
                  key={f.code}
                  onClick={() => setFinish(f.code)}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'border-charcoal-900 bg-white ring-1 ring-charcoal-900 font-semibold text-charcoal-950'
                      : 'border-kraft-200 bg-white/60 hover:bg-white text-charcoal-700'
                  }`}
                >
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-[10px] text-charcoal-400 mt-0.5 line-clamp-1">{f.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Printing Configuration */}
      {product.printingOptions?.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono mb-2 block">
            Print Method & Surfaces
          </label>
          <div className="space-y-1.5">
            {product.printingOptions.map((p) => {
              const isSelected = printing === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => setPrinting(p.code)}
                  className={`w-full p-2.5 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-charcoal-900 bg-white ring-1 ring-charcoal-900 font-semibold text-charcoal-950'
                      : 'border-kraft-200 bg-white/60 hover:bg-white text-charcoal-700'
                  }`}
                >
                  <div>
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[10px] text-charcoal-400 block mt-0.5">{p.description}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-charcoal-900 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Structural Features */}
      {product.additionalFeatures?.length > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono mb-2 block">
            Custom Tooling & Add-ons
          </label>
          <div className="space-y-2">
            {product.additionalFeatures.map((feat) => {
              const isChecked = additionalFeatures.includes(feat.code);
              return (
                <label
                  key={feat.code}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-kraft-400 bg-kraft-50 text-charcoal-950'
                      : 'border-kraft-200 bg-white/60 hover:bg-white text-charcoal-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFeature(feat.code)}
                    className="mt-0.5 rounded text-charcoal-900 focus:ring-charcoal-900 accent-charcoal-900 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold block">{feat.name}</span>
                    <span className="text-[11px] text-charcoal-500 block leading-tight">{feat.description}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Interactive Lid Inspection Slider */}
      <div className="bg-kraft-100/70 p-3 rounded-xl border border-kraft-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-charcoal-800 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-kraft-700" />
            Inspect Interior (Lid Open/Close)
          </span>
          <span className="font-mono text-xs text-charcoal-600">
            {Math.round(lidOpenAngle * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={lidOpenAngle}
          onChange={(e) => setLidOpenAngle(parseFloat(e.target.value))}
          className="w-full accent-charcoal-900 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-charcoal-400 font-mono">
          <span>Sealed</span>
          <span>Fully Open</span>
        </div>
      </div>
    </div>
  );
}
