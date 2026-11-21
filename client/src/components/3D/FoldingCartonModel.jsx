import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBrandingTexture } from './artworkTexture';

export default function FoldingCartonModel({
  dimensions = { length: 90, width: 90, height: 150 },
  color = { hex: '#ffffff' },
  finish = 'matte',
  printing = 'full_color_outside',
  artwork = {},
  lidOpenAngle = 0,
  wireframe = false,
  additionalFeatures = [],
}) {
  const topFlapRef = useRef();

  const l = (dimensions.length || 90) / 100;
  const w = (dimensions.width || 90) / 100;
  const h = (dimensions.height || 150) / 100;
  const t = 0.015; // thin paperboard caliper

  const materialProps = useMemo(() => {
    switch (finish) {
      case 'gloss':
        return { roughness: 0.15, metalness: 0.08, clearcoat: 0.9 };
      case 'soft_touch':
        return { roughness: 0.85, metalness: 0.0, clearcoat: 0.0 };
      case 'uv_spot':
        return { roughness: 0.3, metalness: 0.15, clearcoat: 0.7 };
      default:
        return { roughness: 0.55, metalness: 0.02 };
    }
  }, [finish]);

  const brandingTexture = useMemo(() => {
    return createBrandingTexture({
      brandText: artwork.brandText || '',
      logoUrl: artwork.logoUrl || '',
      artworkColor: artwork.artworkColor || '#18191b',
      patternType: artwork.patternType || 'none',
      baseColor: color.hex || '#ffffff',
      finish,
    });
  }, [artwork.brandText, artwork.logoUrl, artwork.artworkColor, artwork.patternType, color.hex, finish]);

  useFrame(() => {
    if (topFlapRef.current) {
      const targetRad = lidOpenAngle * (Math.PI * 0.75);
      topFlapRef.current.rotation.x = THREE.MathUtils.lerp(
        topFlapRef.current.rotation.x,
        -targetRad,
        0.1
      );
    }
  });

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color.hex || '#ffffff',
        wireframe,
        ...materialProps,
      }),
    [color.hex, wireframe, materialProps]
  );

  const frontPrintedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: printing !== 'none' ? brandingTexture : null,
        color: printing !== 'none' ? '#ffffff' : color.hex,
        wireframe,
        ...materialProps,
      }),
    [printing, brandingTexture, color.hex, wireframe, materialProps]
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Bottom Envelope Base */}
      <mesh position={[0, -h / 2 + t / 2, 0]} material={bodyMaterial} receiveShadow>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 0, -w / 2 + t / 2]} material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-l / 2 + t / 2, 0, 0]} material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[t, h, w - t * 2]} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[l / 2 - t / 2, 0, 0]} material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[t, h, w - t * 2]} />
      </mesh>

      {/* Front Face with Brand Texture */}
      <mesh position={[0, 0, w / 2 - t / 2]} material={frontPrintedMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* Optional Window Cutout */}
      {additionalFeatures.includes('window_cutout') && (
        <mesh position={[0, -h * 0.05, w / 2 + 0.001]}>
          <planeGeometry args={[l * 0.55, h * 0.4]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.35}
            roughness={0.1}
            transmission={0.9}
            color="#d0e5f2"
          />
        </mesh>
      )}

      {/* HINGED TOP FLAP (Hinge at top back edge: y = h/2, z = -w/2) */}
      <group position={[0, h / 2, -w / 2]} ref={topFlapRef}>
        {/* Top Cover */}
        <mesh position={[0, t / 2, w / 2]} material={bodyMaterial} castShadow receiveShadow>
          <boxGeometry args={[l, t, w]} />
        </mesh>

        {/* Front Tuck Flap with slight tuck tab */}
        <mesh position={[0, -w * 0.25, w - t / 2]} material={bodyMaterial}>
          <boxGeometry args={[l * 0.88, w * 0.5, t]} />
        </mesh>
      </group>
    </group>
  );
}
