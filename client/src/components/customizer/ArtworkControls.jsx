import React, { useState } from 'react';
import { Type, Image as ImageIcon, Palette, Grid, Upload, Trash2, Check } from 'lucide-react';
import { useCustomizerStore } from '../../store/customizerStore';
import { uploadAPI } from '../../services/api';

export default function ArtworkControls() {
  const { artwork, setArtwork } = useCustomizerStore();
  const [uploading, setUploading] = useState(false);

  const artworkColors = [
    { name: 'Industrial Black', hex: '#18191b' },
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Foil Gold', hex: '#d4af37' },
    { name: 'Forest Emerald', hex: '#1b3a2e' },
    { name: 'Executive Navy', hex: '#1b263b' },
  ];

  const patterns = [
    { id: 'none', label: 'None' },
    { id: 'minimal_dots', label: 'Polka Dots' },
    { id: 'geo_grid', label: 'Grid' },
    { id: 'diagonal_stripes', label: 'Stripes' },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local blob preview
    const localUrl = URL.createObjectURL(file);
    setArtwork({ logoUrl: localUrl });

    // Optional server upload
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('artwork', file);
      const res = await uploadAPI.uploadArtwork(formData);
      if (res.success && res.data?.url) {
        setArtwork({ logoUrl: res.data.url });
      }
    } catch {
      // Local preview remains functional
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Brand Title Text */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-kraft-600" />
          Brand Wordmark / Headline
        </label>
        <input
          type="text"
          value={artwork.brandText || ''}
          onChange={(e) => setArtwork({ brandText: e.target.value })}
          placeholder="e.g. LUMINARY BOTANICALS"
          className="w-full px-3 py-2 rounded-xl border border-kraft-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-charcoal-900 bg-white"
        />
        <p className="text-[10px] text-charcoal-400">Renders live onto the 3D packaging face in uppercase.</p>
      </div>

      {/* 2. Upload Logo File */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-kraft-600" />
          Upload Logo / Monogram (PNG / SVG)
        </label>
        <div className="flex items-center gap-3">
          <label className="flex-1 border-2 border-dashed border-kraft-300 hover:border-charcoal-800 rounded-xl p-3 text-center cursor-pointer bg-white/70 transition-colors">
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-charcoal-700 font-medium">
              <Upload className="w-4 h-4 text-kraft-600" />
              <span>{uploading ? 'Uploading...' : 'Choose image file'}</span>
            </div>
            <span className="text-[10px] text-charcoal-400 block mt-0.5">Transparent PNG or SVG recommended</span>
          </label>

          {artwork.logoUrl && (
            <button
              onClick={() => setArtwork({ logoUrl: '' })}
              className="p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              title="Remove logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Artwork Ink Color */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-kraft-600" />
          Print Ink Color
        </label>
        <div className="flex items-center gap-2">
          {artworkColors.map((c) => {
            const isSelected = (artwork.artworkColor || '#18191b') === c.hex;
            return (
              <button
                key={c.name}
                onClick={() => setArtwork({ artworkColor: c.hex })}
                title={c.name}
                className={`w-7 h-7 rounded-full border-2 transition-transform shadow-sm flex items-center justify-center ${
                  isSelected ? 'scale-110 border-charcoal-900 ring-2 ring-kraft-400' : 'border-black/10 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && <Check className={`w-3 h-3 ${c.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Predefined Background Pattern */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 font-mono flex items-center gap-1.5">
          <Grid className="w-3.5 h-3.5 text-kraft-600" />
          Subtle Packaging Pattern
        </label>
        <div className="grid grid-cols-2 gap-2">
          {patterns.map((p) => {
            const isSelected = (artwork.patternType || 'none') === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setArtwork({ patternType: p.id })}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-charcoal-900 bg-white ring-1 ring-charcoal-900 font-semibold text-charcoal-950'
                    : 'border-kraft-200 bg-white/60 hover:bg-white text-charcoal-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
