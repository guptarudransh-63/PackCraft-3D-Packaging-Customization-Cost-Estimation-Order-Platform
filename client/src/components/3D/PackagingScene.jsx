import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Center } from '@react-three/drei';
import * as THREE from 'three';

import MailerBoxModel from './MailerBoxModel';
import FoldingCartonModel from './FoldingCartonModel';
import RigidBoxModel from './RigidBoxModel';
import ShippingBoxModel from './ShippingBoxModel';
import PaperBagModel from './PaperBagModel';
import SleeveModel from './SleeveModel';

// Camera controller helper for smooth view transitions
function CameraController({ preset = 'perspective', autoRotate = false }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    let targetPos = [3.8, 3.0, 4.2];
    if (preset === 'front') targetPos = [0, 0, 5.5];
    if (preset === 'top') targetPos = [0, 6.2, 0.05];
    if (preset === 'side') targetPos = [5.5, 0, 0];
    if (preset === 'interior') targetPos = [0, 2.8, 2.8];

    // Smooth camera shift
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(...targetPos);
    let progress = 0;

    const interval = setInterval(() => {
      progress += 0.05;
      camera.position.lerpVectors(startPos, endPos, Math.min(1, progress));
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (progress >= 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [preset, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      autoRotate={autoRotate}
      autoRotateSpeed={1.5}
      minDistance={1.8}
      maxDistance={12}
      maxPolarAngle={Math.PI / 2 + 0.05} // don't dip below floor
      enableDamping
      dampingFactor={0.06}
    />
  );
}

export default function PackagingScene({
  product,
  dimensions,
  material,
  materialThickness,
  color,
  finish,
  printing,
  additionalFeatures = [],
  artwork = {},
  lidOpenAngle = 0,
  wireframe = false,
  autoRotate = false,
  cameraPreset = 'perspective',
}) {
  const packagingType = product?.packagingType || product?.modelType || 'mailer';

  const renderPackagingModel = () => {
    const commonProps = {
      dimensions,
      color,
      finish,
      printing,
      artwork,
      lidOpenAngle,
      wireframe,
      additionalFeatures,
    };

    switch (packagingType) {
      case 'folding_carton':
        return <FoldingCartonModel {...commonProps} />;
      case 'rigid_box':
        return <RigidBoxModel {...commonProps} />;
      case 'shipping_box':
        return <ShippingBoxModel {...commonProps} />;
      case 'paper_bag':
        return <PaperBagModel {...commonProps} />;
      case 'sleeve':
        return <SleeveModel {...commonProps} />;
      case 'mailer':
      default:
        return <MailerBoxModel {...commonProps} />;
    }
  };

  return (
    <div className="w-full h-full relative select-none bg-gradient-to-b from-[#f7f3eb] to-[#ece3d4] rounded-2xl overflow-hidden shadow-inner border border-kraft-200">
      <Canvas
        shadows
        camera={{ position: [3.8, 3.0, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <CameraController preset={cameraPreset} autoRotate={autoRotate} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.7} />
        {/* Key light */}
        <directionalLight
          position={[6, 9, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={25}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0001}
        />
        {/* Fill light */}
        <directionalLight position={[-6, 5, -4]} intensity={0.45} />
        {/* Warm rim light */}
        <directionalLight position={[0, -2, -5]} intensity={0.25} color="#dfc2a1" />

        <Suspense fallback={null}>
          <Center top>
            {renderPackagingModel()}
          </Center>

          {/* Soft Ground Shadow */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.45}
            scale={10}
            blur={2.4}
            far={4.0}
            resolution={512}
            color="#2a221b"
          />
        </Suspense>
      </Canvas>

      {/* Floating 3D Dimension Tag */}
      <div className="absolute top-4 left-4 pointer-events-none bg-charcoal-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-charcoal-700/60 font-mono flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-kraft-400 animate-pulse"></span>
        <span>
          {dimensions?.length || 260} × {dimensions?.width || 200} × {dimensions?.height || 80} mm
        </span>
        <span className="text-charcoal-400">|</span>
        <span className="text-kraft-300 capitalize">{packagingType.replace('_', ' ')}</span>
      </div>
    </div>
  );
}
