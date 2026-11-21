import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createBrandingTexture } from './artworkTexture';

export default function SleeveModel({
  dimensions = { length: 180, width: 130, height: 50 },
  color = { hex: '#ffffff' },
  finish = 'matte',
  printing = 'full_color_outside',
  artwork = {},
  wireframe = false,
  additionalFeatures = [],
}) {
  const l = (dimensions.length || 180) / 100;
  const w = (dimensions.width || 130) / 100;
  const h = (dimensions.height || 50) / 100;
  const t = 0.012;

  const brandingTexture = useMemo(() => {
    return createBrandingTexture({
      brandText: artwork.brandText || 'PRODUCT SLEEVE',
      logoUrl: artwork.logoUrl || '',
      artworkColor: artwork.artworkColor || '#18191b',
      patternType: artwork.patternType || 'none',
      baseColor: color.hex || '#ffffff',
      finish,
    });
  }, [artwork.brandText, artwork.logoUrl, artwork.artworkColor, artwork.patternType, color.hex, finish]);

  const sleeveMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color.hex || '#ffffff',
        roughness: 0.6,
        wireframe,
      }),
    [color.hex, wireframe]
  );

  const topBrandMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: printing !== 'none' ? brandingTexture : null,
        color: printing !== 'none' ? '#ffffff' : color.hex,
        roughness: 0.55,
        wireframe,
      }),
    [printing, brandingTexture, color.hex, wireframe]
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Phantom Inner Container being wrapped (subtle gray container inside) */}
      <mesh receiveShadow>
        <boxGeometry args={[l * 1.35, h * 0.96, w * 0.96]} />
        <meshStandardMaterial color="#f2f1ed" roughness={0.7} />
      </mesh>

      {/* SLEEVE TUBE (Open at left and right x-ends) */}
      {/* Top Face with Brand */}
      <mesh position={[0, h / 2 + t / 2, 0]} material={topBrandMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, t, w + t * 2]} />
      </mesh>

      {/* Bottom Face */}
      <mesh position={[0, -h / 2 - t / 2, 0]} material={sleeveMaterial} receiveShadow>
        <boxGeometry args={[l, t, w + t * 2]} />
      </mesh>

      {/* Front Face */}
      <mesh position={[0, 0, w / 2 + t / 2]} material={sleeveMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* Back Face */}
      <mesh position={[0, 0, -w / 2 - t / 2]} material={sleeveMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>
    </group>
  );
}
