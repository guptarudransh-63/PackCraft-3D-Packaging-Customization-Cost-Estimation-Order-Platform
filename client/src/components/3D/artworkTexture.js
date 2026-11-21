import * as THREE from 'three';

// Generates dynamic branding canvas texture for 3D packaging surfaces
export function createBrandingTexture({
  brandText = '',
  logoUrl = '',
  artworkColor = '#18191b',
  patternType = 'none',
  baseColor = '#c89d6c',
  finish = 'matte',
  width = 1024,
  height = 1024,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fill base color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Subtle paper/cardboard noise texture
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Background pattern if selected
  if (patternType === 'minimal_dots') {
    ctx.fillStyle = artworkColor;
    ctx.globalAlpha = 0.08;
    const spacing = 48;
    for (let x = 24; x < width; x += spacing) {
      for (let y = 24; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
  } else if (patternType === 'geo_grid') {
    ctx.strokeStyle = artworkColor;
    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 1;
    const spacing = 64;
    for (let x = 0; x <= width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  } else if (patternType === 'diagonal_stripes') {
    ctx.strokeStyle = artworkColor;
    ctx.globalAlpha = 0.07;
    ctx.lineWidth = 3;
    for (let i = -width; i < width * 2; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }

  // Draw Brand Text or Logo in Center
  if (brandText) {
    ctx.save();
    ctx.fillStyle = artworkColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Decorative industrial framing line
    ctx.strokeStyle = artworkColor;
    ctx.lineWidth = 2.5;
    const boxW = Math.min(680, width * 0.75);
    const boxH = 140;
    const boxX = (width - boxW) / 2;
    const boxY = height / 2 - boxH / 2;

    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Subtle corner markers
    const markerLen = 12;
    ctx.lineWidth = 4;
    // top-left
    ctx.beginPath(); ctx.moveTo(boxX - 4, boxY + markerLen); ctx.lineTo(boxX - 4, boxY - 4); ctx.lineTo(boxX + markerLen, boxY - 4); ctx.stroke();
    // top-right
    ctx.beginPath(); ctx.moveTo(boxX + boxW + 4, boxY + markerLen); ctx.lineTo(boxX + boxW + 4, boxY - 4); ctx.lineTo(boxX + boxW - markerLen, boxY - 4); ctx.stroke();
    // bottom-left
    ctx.beginPath(); ctx.moveTo(boxX - 4, boxY + boxH - markerLen); ctx.lineTo(boxX - 4, boxY + boxH + 4); ctx.lineTo(boxX + markerLen, boxY + boxH + 4); ctx.stroke();
    // bottom-right
    ctx.beginPath(); ctx.moveTo(boxX + boxW + 4, boxY + boxH - markerLen); ctx.lineTo(boxX + boxW + 4, boxY + boxH + 4); ctx.lineTo(boxX + boxW - markerLen, boxY + boxH + 4); ctx.stroke();

    // Primary Brand Text
    ctx.font = 'bold 38px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(brandText.toUpperCase(), width / 2, height / 2 - 12);

    // Subtitle tagline
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.letterSpacing = '3px';
    ctx.globalAlpha = 0.8;
    ctx.fillText('ENGINEERED PACKAGING // SUSTAINABLE', width / 2, height / 2 + 30);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
