import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createBrandingTexture } from './artworkTexture';

export default function PaperBagModel({
  dimensions = { length: 240, width: 110, height: 310 },
  color = { hex: '#c59d6a' },
  finish = 'uncoated',
  printing = '1_color_outside',
  artwork = {},
  wireframe = false,
  additionalFeatures = [],
}) {
  const l = (dimensions.length || 240) / 100;
  const w = (dimensions.width || 110) / 100;
  const h = (dimensions.height || 310) / 100;
  const t = 0.012; // paper sheet

  const brandingTexture = useMemo(() => {
    return createBrandingTexture({
      brandText: artwork.brandText || 'BOUTIQUE PACKAGING',
      logoUrl: artwork.logoUrl || '',
      artworkColor: artwork.artworkColor || '#18191b',
      patternType: artwork.patternType || 'none',
      baseColor: color.hex || '#c59d6a',
      finish,
    });
  }, [artwork.brandText, artwork.logoUrl, artwork.artworkColor, artwork.patternType, color.hex, finish]);

  const bagMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color.hex || '#c59d6a',
        roughness: 0.85,
        wireframe,
      }),
    [color.hex, wireframe]
  );

  const frontPrintedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: printing !== 'none' ? brandingTexture : null,
        color: printing !== 'none' ? '#ffffff' : color.hex,
        roughness: 0.82,
        wireframe,
      }),
    [printing, brandingTexture, color.hex, wireframe]
  );

  // Twisted Kraft / Rope Handle curves
  const handleGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-l * 0.22, 0, 0),
      new THREE.Vector3(-l * 0.2, h * 0.35, 0),
      new THREE.Vector3(0, h * 0.42, 0),
      new THREE.Vector3(l * 0.2, h * 0.35, 0),
      new THREE.Vector3(l * 0.22, 0, 0),
    ]);
    const radius = additionalFeatures.includes('rope_handle') ? 0.022 : 0.014;
    return new THREE.TubeGeometry(curve, 28, radius, 12, false);
  }, [l, h, additionalFeatures]);

  const handleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: additionalFeatures.includes('rope_handle') ? '#f3ede2' : '#8c6841',
        roughness: 0.9,
      }),
    [additionalFeatures]
  );

  return (
    <group position={[0, -h * 0.1, 0]}>
      {/* Bottom Block Envelope */}
      <mesh position={[0, -h / 2, 0]} material={bagMaterial} receiveShadow>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      {/* Front Face with Brand Art */}
      <mesh position={[0, 0, w / 2 - t / 2]} material={frontPrintedMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* Back Face */}
      <mesh position={[0, 0, -w / 2 + t / 2]} material={bagMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* Left Gusset Side with inward fold indentation */}
      <group position={[-l / 2 + t / 2, 0, 0]}>
        <mesh material={bagMaterial} castShadow>
          <boxGeometry args={[t, h, w * 0.96]} />
        </mesh>
      </group>

      {/* Right Gusset Side */}
      <group position={[l / 2 - t / 2, 0, 0]}>
        <mesh material={bagMaterial} castShadow>
          <boxGeometry args={[t, h, w * 0.96]} />
        </mesh>
      </group>

      {/* Top Reinforced Turnover Rim */}
      <mesh position={[0, h / 2 - 0.02, 0]}>
        <boxGeometry args={[l + 0.01, 0.04, w + 0.01]} />
        <meshStandardMaterial color={color.hex || '#c59d6a'} roughness={0.8} />
      </mesh>

      {/* Front Handle */}
      <mesh geometry={handleGeo} material={handleMaterial} position={[0, h / 2, w / 2 + 0.01]} castShadow />

      {/* Back Handle */}
      <mesh geometry={handleGeo} material={handleMaterial} position={[0, h / 2, -w / 2 - 0.01]} castShadow />
    </group>
  );
}
