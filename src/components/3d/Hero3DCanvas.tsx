import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DCanvasProps {
  interactive?: boolean;
  className?: string;
  variant?: 'hero' | 'ambient' | 'timer';
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({
  interactive = true,
  className = '',
  variant = 'hero'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = variant === 'timer' ? 8 : 12;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Core Sphere / Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(variant === 'timer' ? 1.8 : 2.2, 2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x050e26,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(3.5, 0.03, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(4.2, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = Math.PI / 6;
    mainGroup.add(ring2);

    // 3. Floating Geometric Polyhedrons (Study Nodes)
    const nodeCount = 6;
    const nodes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.OctahedronGeometry(0.4, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x2563eb,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 4.8;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle) * radius * 0.4;
      node.position.z = Math.sin(angle) * 1.5;
      mainGroup.add(node);
      nodes.push(node);
    }

    // 4. Particle Field
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.08,
      transparent: true,
      opacity: 0.6
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 3, 20);
    blueLight.position.set(5, 5, 5);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2, 20);
    cyanLight.position.set(-5, -5, -2);
    scene.add(cyanLight);

    // Parallax mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotations
      coreMesh.rotation.y = elapsedTime * 0.2;
      coreMesh.rotation.x = elapsedTime * 0.1;
      innerMesh.rotation.y = -elapsedTime * 0.3;

      ring1.rotation.z = elapsedTime * 0.15;
      ring2.rotation.z = -elapsedTime * 0.2;

      // Orbit nodes
      nodes.forEach((node, i) => {
        const angle = (i / nodeCount) * Math.PI * 2 + elapsedTime * 0.3;
        const radius = 4.8 + Math.sin(elapsedTime * 2 + i) * 0.3;
        node.position.x = Math.cos(angle) * radius;
        node.position.y = Math.sin(angle) * radius * 0.4 + Math.cos(elapsedTime + i) * 0.2;
        node.rotation.x += 0.02;
        node.rotation.y += 0.03;
      });

      // Particles gentle drift
      particlePoints.rotation.y = elapsedTime * 0.02;

      // Mouse Parallax Smooth Lerp
      targetX += (mouseX * 0.8 - targetX) * 0.05;
      targetY += (mouseY * 0.8 - targetY) * 0.05;
      mainGroup.rotation.y = targetX * 0.5;
      mainGroup.rotation.x = -targetY * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height || 400;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive, variant]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ minHeight: variant === 'timer' ? '300px' : '380px' }}
    />
  );
};
