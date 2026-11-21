import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBrandingTexture } from './artworkTexture';

export default function MailerBoxModel({
  dimensions = { length: 260, width: 200, height: 80 },
  color = { hex: '#c89d6c' },
  finish = 'matte',
  printing = 'full_color_outside',
  artwork = {},
  lidOpenAngle = 0,
  wireframe = false,
  additionalFeatures = [],
}) {
  const lidGroupRef = useRef();

  // Convert mm to 3D units (100mm = 1.0 unit)
  const l = (dimensions.length || 260) / 100;
  const w = (dimensions.width || 200) / 100;
  const h = (dimensions.height || 80) / 100;
  const t = 0.025; // Board thickness

  // Material roughness & sheen properties
  const materialProps = useMemo(() => {
    switch (finish) {
      case 'gloss':
        return { roughness: 0.18, metalness: 0.05, clearcoat: 0.8 };
      case 'soft_touch':
        return { roughness: 0.88, metalness: 0.0, clearcoat: 0.05 };
      case 'uv_spot':
        return { roughness: 0.35, metalness: 0.12, clearcoat: 0.6 };
      case 'uncoated':
        return { roughness: 0.95, metalness: 0.0 };
      case 'matte':
      default:
        return { roughness: 0.62, metalness: 0.02 };
    }
  }, [finish]);

  // Dynamic branding texture for top lid
  const brandingTexture = useMemo(() => {
    return createBrandingTexture({
      brandText: artwork.brandText || '',
      logoUrl: artwork.logoUrl || '',
      artworkColor: artwork.artworkColor || '#18191b',
      patternType: artwork.patternType || 'none',
      baseColor: color.hex || '#c89d6c',
      finish,
    });
  }, [artwork.brandText, artwork.logoUrl, artwork.artworkColor, artwork.patternType, color.hex, finish]);

  // Animated smooth lid angle transition
  useFrame(() => {
    if (lidGroupRef.current) {
      const targetRad = lidOpenAngle * (Math.PI * 0.72); // Open up to ~130 degrees
      lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        lidGroupRef.current.rotation.x,
        -targetRad,
        0.1
      );
    }
  });

  const baseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color.hex || '#c89d6c',
        wireframe,
        ...materialProps,
      }),
    [color.hex, wireframe, materialProps]
  );

  const lidTopMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: printing !== 'none' ? brandingTexture : null,
        color: printing !== 'none' ? '#ffffff' : color.hex,
        wireframe,
        ...materialProps,
      }),
    [printing, brandingTexture, color.hex, wireframe, materialProps]
  );

  // Interior material (lighter or contrasting kraft)
  const interiorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: printing === 'full_color_both' ? color.hex : '#d9b382',
        wireframe,
        roughness: 0.75,
      }),
    [printing, color.hex, wireframe]
  );

  return (
    <group position={[0, -h / 2, 0]}>
      {/* 1. Base Floor Panel */}
      <mesh position={[0, t / 2, 0]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      {/* 2. Back Wall (Hinge location at top) */}
      <mesh position={[0, h / 2, -w / 2 + t / 2]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* 3. Front Wall (Double-wall rollover) */}
      <mesh position={[0, h / 2, w / 2 - t / 2]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t * 1.5]} />
      </mesh>

      {/* 4. Left Rollover Side Wall */}
      <mesh position={[-l / 2 + t / 2, h / 2, 0]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[t * 1.8, h, w - t * 2]} />
      </mesh>

      {/* 5. Right Rollover Side Wall */}
      <mesh position={[l / 2 - t / 2, h / 2, 0]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[t * 1.8, h, w - t * 2]} />
      </mesh>

      {/* 6. Optional Product Insert if selected */}
      {additionalFeatures.includes('custom_insert') && (
        <group position={[0, h * 0.35, 0]}>
          <mesh material={interiorMaterial} receiveShadow>
            <boxGeometry args={[l * 0.92, h * 0.4, w * 0.92]} />
          </mesh>
          {/* Die-cut circular slots in insert */}
          <mesh position={[-l * 0.22, h * 0.21, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[w * 0.16, w * 0.16, h * 0.05, 32]} />
            <meshStandardMaterial color="#262729" roughness={0.9} />
          </mesh>
          <mesh position={[l * 0.22, h * 0.21, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[w * 0.16, w * 0.16, h * 0.05, 32]} />
            <meshStandardMaterial color="#262729" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* 7. HINGED TOP LID GROUP (Pivot is at top of back wall: y = h, z = -w/2) */}
      <group position={[0, h, -w / 2]} ref={lidGroupRef}>
        {/* Main Top Lid Panel (extends forward +w from pivot) */}
        <mesh position={[0, t / 2, w / 2]} material={lidTopMaterial} castShadow receiveShadow>
          <boxGeometry args={[l + t * 0.4, t, w]} />
        </mesh>

        {/* Front Tuck Flap (hangs down from front edge of lid) */}
        <mesh position={[0, -h * 0.35, w]} material={baseMaterial} castShadow receiveShadow>
          <boxGeometry args={[l * 0.92, h * 0.7, t]} />
        </mesh>

        {/* Left Dust Flap Wing */}
        <mesh position={[-l / 2, -h * 0.3, w / 2]} material={baseMaterial}>
          <boxGeometry args={[t, h * 0.6, w * 0.85]} />
        </mesh>

        {/* Right Dust Flap Wing */}
        <mesh position={[l / 2, -h * 0.3, w / 2]} material={baseMaterial}>
          <boxGeometry args={[t, h * 0.6, w * 0.85]} />
        </mesh>

        {/* Optional Tear Strip */}
        {additionalFeatures.includes('tear_strip') && (
          <mesh position={[0, t * 1.2, w * 0.85]}>
            <boxGeometry args={[l * 0.85, 0.005, 0.04]} />
            <meshStandardMaterial color="#d94b38" roughness={0.4} />
          </mesh>
        )}
      </group>
    </group>
  );
}
