import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBrandingTexture } from './artworkTexture';

export default function RigidBoxModel({
  dimensions = { length: 220, width: 160, height: 70 },
  color = { hex: '#141415' },
  finish = 'matte',
  printing = 'full_color_outside',
  artwork = {},
  lidOpenAngle = 0,
  wireframe = false,
  additionalFeatures = [],
}) {
  const lidGroupRef = useRef();

  const l = (dimensions.length || 220) / 100;
  const w = (dimensions.width || 160) / 100;
  const h = (dimensions.height || 70) / 100;
  const t = 0.035; // Heavy rigid chipboard thickness

  const lidHeight = Math.min(h * 0.65, 0.45);

  const materialProps = useMemo(() => {
    switch (finish) {
      case 'gloss':
        return { roughness: 0.15, metalness: 0.05, clearcoat: 0.8 };
      case 'soft_touch':
        return { roughness: 0.85, metalness: 0.0, clearcoat: 0.0 };
      case 'uv_spot':
        return { roughness: 0.35, metalness: 0.15, clearcoat: 0.7 };
      default:
        return { roughness: 0.7, metalness: 0.02 };
    }
  }, [finish]);

  const brandingTexture = useMemo(() => {
    return createBrandingTexture({
      brandText: artwork.brandText || '',
      logoUrl: artwork.logoUrl || '',
      artworkColor: artwork.artworkColor || '#d9be9c', // gold/cream contrast on luxury
      patternType: artwork.patternType || 'none',
      baseColor: color.hex || '#141415',
      finish,
    });
  }, [artwork.brandText, artwork.logoUrl, artwork.artworkColor, artwork.patternType, color.hex, finish]);

  useFrame(() => {
    if (lidGroupRef.current) {
      // Lift lid upwards and tilt back slightly
      const targetY = (h / 2) + lidOpenAngle * (h * 1.2);
      const targetRotX = -lidOpenAngle * 0.4;
      const targetZ = -lidOpenAngle * (w * 0.35);

      lidGroupRef.current.position.y = THREE.MathUtils.lerp(lidGroupRef.current.position.y, targetY, 0.1);
      lidGroupRef.current.position.z = THREE.MathUtils.lerp(lidGroupRef.current.position.z, targetZ, 0.1);
      lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(lidGroupRef.current.rotation.x, targetRotX, 0.1);
    }
  });

  const baseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color.hex || '#141415',
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

  return (
    <group position={[0, -h * 0.25, 0]}>
      {/* 1. BASE TRAY */}
      {/* Base bottom */}
      <mesh position={[0, -h / 2 + t / 2, 0]} material={baseMaterial} receiveShadow>
        <boxGeometry args={[l, t, w]} />
      </mesh>
      {/* Base Front/Back walls */}
      <mesh position={[0, 0, w / 2 - t / 2]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>
      <mesh position={[0, 0, -w / 2 + t / 2]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>
      {/* Base Left/Right walls */}
      <mesh position={[-l / 2 + t / 2, 0, 0]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[t, h, w - t * 2]} />
      </mesh>
      <mesh position={[l / 2 - t / 2, 0, 0]} material={baseMaterial} castShadow receiveShadow>
        <boxGeometry args={[t, h, w - t * 2]} />
      </mesh>

      {/* Velvet foam bed inside if custom_insert is enabled */}
      {additionalFeatures.includes('custom_insert') && (
        <mesh position={[0, -h * 0.15, 0]} receiveShadow>
          <boxGeometry args={[l - t * 2.2, h * 0.65, w - t * 2.2]} />
          <meshStandardMaterial color="#202124" roughness={0.95} />
        </mesh>
      )}

      {/* 2. LIFT-OFF LID PIECE */}
      <group position={[0, h / 2, 0]} ref={lidGroupRef}>
        {/* Lid Top Panel with Branding */}
        <mesh position={[0, t / 2, 0]} material={lidTopMaterial} castShadow receiveShadow>
          <boxGeometry args={[l + t * 0.8, t, w + t * 0.8]} />
        </mesh>
        {/* Lid Lip Walls */}
        <mesh position={[0, -lidHeight / 2, (w + t * 0.8) / 2 - t / 2]} material={baseMaterial} castShadow>
          <boxGeometry args={[l + t * 0.8, lidHeight, t]} />
        </mesh>
        <mesh position={[0, -lidHeight / 2, -(w + t * 0.8) / 2 + t / 2]} material={baseMaterial} castShadow>
          <boxGeometry args={[l + t * 0.8, lidHeight, t]} />
        </mesh>
        <mesh position={[-(l + t * 0.8) / 2 + t / 2, -lidHeight / 2, 0]} material={baseMaterial} castShadow>
          <boxGeometry args={[t, lidHeight, w + t * 0.8 - t * 2]} />
        </mesh>
        <mesh position={[(l + t * 0.8) / 2 - t / 2, -lidHeight / 2, 0]} material={baseMaterial} castShadow>
          <boxGeometry args={[t, lidHeight, w + t * 0.8 - t * 2]} />
        </mesh>
      </group>
    </group>
  );
}
