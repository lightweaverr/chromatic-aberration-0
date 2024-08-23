"use client"

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ChromaticAberrationEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create a plane geometry that covers the entire view
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Load the image texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/images/coffee.jpg');

    // Create a custom shader material
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        time: { value: 0 },
        texture: { value: texture },
        amount: { value: 0.005 },
        seed: { value: Math.random() }
      },
      vertexShader: /* glsl */  `
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix; 

        attribute vec2 uv;
        attribute vec3 position;

        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */  `
        precision mediump float;

        uniform mediump float time;
        uniform sampler2D texture;
        uniform mediump float amount;
        uniform mediump float seed;
        varying vec2 vUv;

        float random(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          
          // Random glitch effect
          float glitchStrength = 0.05 * random(vec2(time * 0.1, seed));
          vec2 glitchOffset = vec2(
            glitchStrength * random(vec2(time * 0.1, uv.y)),
            glitchStrength * random(vec2(time * 0.1, uv.x))
          );
          uv += glitchOffset;

          // Chromatic aberration
          vec2 dir = uv - vec2(0.5);
          float aberration = amount * random(vec2(time * 0.1, seed + 1.0));
          vec2 offset = dir * aberration;

          vec4 r = texture2D(texture, uv + offset);
          vec4 g = texture2D(texture, uv);
          vec4 b = texture2D(texture, uv - offset);

          gl_FragColor = vec4(r.r, g.g, b.b, 1.0);
        }
      `
    });

    // Create a mesh with the geometry and material
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = (time: number) => {
      material.uniforms.time.value = time * 0.001;
      material.uniforms.seed.value = Math.random();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // Handle window resizing
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default ChromaticAberrationEffect;