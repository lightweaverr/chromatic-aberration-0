"use client"

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import vertexShader from '@/shaders/vertex';
import fragmentShader from '@/shaders/fragment'

const ChromaticAberrationEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  let easeFactor = 0.02;
  let gridSize = 30.0;
  let mousePosition = { x: 0.5, y: 0.5 };
  let targetMousePosition = { x: 0.5, y: 0.5 };
  let mouseStopTimeout;
  let aberrationIntensity = 0.0;
  let lastPosition = { x: 0.5, y: 0.5 };
  let prevPosition = { x: 0.5, y: 0.5 };
  let aberrationFadeRate = 0.2;

  useEffect(() => {
    if (!containerRef.current) return;

    const imageContainer = containerRef.current;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(1000, 1000);
    containerRef.current.appendChild(renderer.domElement);

    // Create a plane geometry that covers the entire view
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Load the image texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/images/coffee.png');

    let shaderUniforms = {
      u_mouse: { value: new THREE.Vector2() },
      u_prevMouse: { value: new THREE.Vector2() },
      u_aberrationIntensity: { value: 0.0 },
      u_texture: { value: texture },
      u_gridSize: { value: gridSize}
    };

    // Create a custom shader material
    const material = new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader,
      fragmentShader
    });

    // Create a mesh with the geometry and material
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = (time: number) => {

      mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
      mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;
      aberrationIntensity = Math.max(0.0, aberrationIntensity - aberrationFadeRate);

      mesh.material.uniforms.u_mouse.value.set(mousePosition.x, 1.0 - mousePosition.y);
      mesh.material.uniforms.u_prevMouse.value.set(prevPosition.x, 1.0 - prevPosition.y);
      mesh.material.uniforms.u_aberrationIntensity.value = aberrationIntensity;
      mesh.material.uniforms.u_gridSize.value = gridSize;

      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const handleMouseMove = (event:  any) => {
      easeFactor = 0.02;
      let rect = imageContainer.getBoundingClientRect();
      prevPosition = {...targetMousePosition};

      targetMousePosition.x = (event.clientX - rect.left) / rect.width;
      targetMousePosition.y = (event.clientY - rect.top) / rect.height;

      aberrationIntensity = 1;
    }
 
    const handleMouseEnter = (event: any) => {
      easeFactor = 0.02;
      let rect = imageContainer.getBoundingClientRect();

      mousePosition.x = targetMousePosition.x = (event.clientX - rect.left) / rect.width;
      mousePosition.y = targetMousePosition.y = (event.clientY - rect.top) / rect.height;
    }
    
    const handleMouseLeave = () => {
      easeFactor = 0.05;
      targetMousePosition = {...prevPosition}
    }
   
    imageContainer.addEventListener("mousemove", handleMouseMove);
    imageContainer.addEventListener("mouseenter", handleMouseEnter);
    imageContainer.addEventListener("mouseleave", handleMouseLeave);
    
    // Handle window resizing
    // const handleResize = () => {
    //   const width = window.innerWidth;
    //   const height = window.innerHeight;
    //   renderer.setSize(width, height);
    //   material.uniforms.resolution.value.set(width, height);
    // };
    // window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      imageContainer.removeEventListener("mousemove", handleMouseMove);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };

  }, []);


  return <div id='imageContainer' ref={containerRef} className='w-[1000px] h-[1000px] rounded-lg overflow-hidden mx-auto' />;

};

export default ChromaticAberrationEffect;