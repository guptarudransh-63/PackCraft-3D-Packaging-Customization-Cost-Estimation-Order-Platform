import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createBrandingTexture } from './artworkTexture';

export default function ShippingBoxModel({
  dimensions = { length: 350, width: 280, height: 220 },
  color = { hex: '#c89d6c' },
  finish = 'uncoated',
  printing = '1_color_outside',
  artwork = {},
  lidOpenAngle = 0,
  wireframe = false,
  additionalFeatures = [],
}) {
  const leftFlapRef = useRef();
  const rightFlapRef = useRef();

  const l = (dimensions.length || 350) / 100;
  const w = (dimensions.width || 280) / 100;
  const h = (dimensions.height || 220) / 100;
  const t = 0.03; // Thick heavy corrugated flute

  const brandingTexture = useMemo(() => {
    return createBrandingTexture({
      brandText: artwork.brandText || 'PACKCRAFT FREIGHT',
      logoUrl: artwork.logoUrl || '',
      artworkColor: artwork.artworkColor || '#18191b',
      patternType: artwork.patternType || 'none',
      baseColor: color.hex || '#c89d6c',
      finish,
    });
  }, [artwork.brandText, artwork.logoUrl, artwork.artworkColor, artwork.patternType, color.hex, finish]);

  useFrame(() => {
    const angle = lidOpenAngle * Math.PI * 0.65;
    if (leftFlapRef.current) {
      leftFlapRef.current.rotation.z = THREE.MathUtils.lerp(leftFlapRef.current.rotation.z, angle, 0.1);
    }
    if (rightFlapRef.current) {
      rightFlapRef.current.rotation.z = THREE.MathUtils.lerp(rightFlapRef.current.rotation.z, -angle, 0.1);
    }
  });

  const boxMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color.hex || '#c89d6c',
        roughness: 0.88,
        metalness: 0.0,
        wireframe,
      }),
    [color.hex, wireframe]
  );

  const frontFaceMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: printing !== 'none' ? brandingTexture : null,
        color: printing !== 'none' ? '#ffffff' : color.hex,
        roughness: 0.85,
        wireframe,
      }),
    [printing, brandingTexture, color.hex, wireframe]
  );

  return (
    <group position={[0, -h * 0.1, 0]}>
      {/* Bottom Closed Flaps */}
      <mesh position={[0, -h / 2, 0]} material={boxMaterial} receiveShadow>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 0, -w / 2 + t / 2]} material={boxMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* Front Wall with Brand/Handling Marks */}
      <mesh position={[0, 0, w / 2 - t / 2]} material={frontFaceMaterial} castShadow receiveShadow>
        <boxGeometry args={[l, h, t]} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-l / 2 + t / 2, 0, 0]} material={boxMaterial} castShadow receiveShadow>
        <boxGeometry args={[t, h, w - t * 2]} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[l / 2 - t / 2, 0, 0]} material={boxMaterial} castShadow receiveShadow>
        <boxGeometry args={[t, h, w - t * 2]} />
      </mesh>

      {/* TOP FLAPS */}
      {/* Left major flap (hinge at x = -l/2, y = h/2) */}
      <group position={[-l / 2, h / 2, 0]} ref={leftFlapRef}>
        <mesh position={[l / 4, t / 2, 0]} material={boxMaterial} castShadow>
          <boxGeometry args={[l / 2, t, w]} />
        </mesh>
      </group>

      {/* Right major flap (hinge at x = l/2, y = h/2) */}
      <group position={[l / 2, h / 2, 0]} ref={rightFlapRef}>
        <mesh position={[-l / 4, t / 2, 0]} material={boxMaterial} castShadow>
          <boxGeometry args={[l / 2, t, w]} />
        </mesh>
      </group>

      {/* Industrial Sealing Tape along center seam (fades when opened) */}
      {lidOpenAngle < 0.1 && (
        <mesh position={[0, h / 2 + t + 0.002, 0]}>
          <boxGeometry args={[0.06, 0.002, w * 1.02]} />
          <meshStandardMaterial color="#b3844f" roughness={0.35} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}
