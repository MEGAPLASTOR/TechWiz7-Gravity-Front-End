import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const MarketStall3D = ({ width = 280, height = 240, interactive = true }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.5, 3.8, 5.2);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(5, 8, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xbbf7d0, 0.6);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // 3. Materials
    const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const woodLightMat = new THREE.MeshStandardMaterial({ color: 0xcd853f, roughness: 0.7 });
    const greenAwningMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const whiteAwningMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const cabbageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const signBoardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    // Group for entire stall
    const stallGroup = new THREE.Group();
    scene.add(stallGroup);

    // --- Base Table / Counter ---
    const tableTopGeo = new THREE.BoxGeometry(2.4, 0.15, 1.6);
    const tableTop = new THREE.Mesh(tableTopGeo, woodLightMat);
    tableTop.position.y = 0.8;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    stallGroup.add(tableTop);

    // Table skirt / front panel
    const skirtGeo = new THREE.BoxGeometry(2.35, 0.75, 0.05);
    const skirt = new THREE.Mesh(skirtGeo, woodDarkMat);
    skirt.position.set(0, 0.4, 0.75);
    skirt.castShadow = true;
    stallGroup.add(skirt);

    // Table legs (4 corners)
    const legGeo = new THREE.BoxGeometry(0.12, 0.8, 0.12);
    const legPositions = [
      [-1.1, 0.4, -0.7],
      [1.1, 0.4, -0.7],
      [-1.1, 0.4, 0.7],
      [1.1, 0.4, 0.7],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, woodDarkMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      stallGroup.add(leg);
    });

    // --- 4 Roof Pillars ---
    const postGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.6, 8);
    const postPositions = [
      [-1.1, 1.6, -0.7],
      [1.1, 1.6, -0.7],
      [-1.1, 1.45, 0.7],
      [1.1, 1.45, 0.7],
    ];
    postPositions.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(postGeo, woodDarkMat);
      post.position.set(x, y, z);
      post.castShadow = true;
      stallGroup.add(post);
    });

    // --- Striped Awning (Canopy) ---
    const stripeCount = 8;
    const stripeWidth = 2.6 / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const isGreen = i % 2 === 0;
      const stripeGeo = new THREE.BoxGeometry(stripeWidth * 0.96, 0.04, 1.9);
      const stripeMesh = new THREE.Mesh(stripeGeo, isGreen ? greenAwningMat : whiteAwningMat);
      // Slope the roof forward
      stripeMesh.rotation.x = 0.12;
      stripeMesh.position.set(-1.3 + stripeWidth * (i + 0.5), 2.3, 0);
      stripeMesh.castShadow = true;
      stallGroup.add(stripeMesh);
    }

    // --- Produce Crates on Table ---
    const crateGeo = new THREE.BoxGeometry(0.65, 0.2, 0.5);
    const crateX = [-0.75, 0, 0.75];
    crateX.forEach((cx, idx) => {
      const crate = new THREE.Mesh(crateGeo, woodLightMat);
      crate.position.set(cx, 0.95, 0.15);
      crate.rotation.x = -0.15; // tilt towards customer
      crate.castShadow = true;
      stallGroup.add(crate);

      // Add produce items into each crate
      const mat = idx === 0 ? cabbageMat : idx === 1 ? tomatoMat : orangeMat;
      const itemGeo = new THREE.SphereGeometry(idx === 0 ? 0.08 : 0.065, 8, 8);

      for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
          const produce = new THREE.Mesh(itemGeo, mat);
          produce.position.set(
            cx + col * 0.16,
            1.05 + (row === 0 && col === 0 ? 0.03 : 0),
            0.15 + row * 0.14
          );
          produce.castShadow = true;
          stallGroup.add(produce);
        }
      }
    });

    // --- Chalkboard Sign ---
    const signGeo = new THREE.BoxGeometry(1.2, 0.35, 0.04);
    const sign = new THREE.Mesh(signGeo, signBoardMat);
    sign.position.set(0, 0.45, 0.78);
    sign.castShadow = true;
    stallGroup.add(sign);

    // Ground Shadow Catcher
    const shadowGeo = new THREE.PlaneGeometry(4, 4);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Animation & Mouse Tilt
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 0.8;
      targetRotationX = y * 0.3;
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating / idle motion
      stallGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.04;
      
      // Smooth lerp to mouse rotation
      stallGroup.rotation.y += (targetRotationY - stallGroup.rotation.y) * 0.06;
      stallGroup.rotation.x += (targetRotationX - stallGroup.rotation.x) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height, interactive]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 20px 25px rgba(21, 128, 61, 0.15))',
      }}
    />
  );
};
