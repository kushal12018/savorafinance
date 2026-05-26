/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";

interface Perspective3DProps {
  children: React.ReactNode;
  maxTilt?: number; // Maximum tilt angle in degrees
  scale?: number; // Scale on hover
  className?: string; // Additional classes
  glare?: boolean; // Enable interactive cursor spotlight glare/shine
  glareOpacity?: number; // Opacity of glare
  id?: string;
  key?: React.Key;
}

export default function Perspective3D({
  children,
  maxTilt = 12,
  scale = 1.03,
  className = "",
  glare = true,
  glareOpacity = 0.15,
  id,
}: Perspective3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ rX: 0, rY: 0, tX: 0, tY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    // Convert cursor position to percentages (-0.5 to 0.5)
    const pctX = mouseX / bounds.width - 0.5;
    const pctY = mouseY / bounds.height - 0.5;

    // Calculate rotation angles (negate Y percentage because mouse up should tilt card forward)
    const rX = -pctY * maxTilt;
    const rY = pctX * maxTilt;

    // Subtle 3D translations
    const tX = pctX * 8;
    const tY = pctY * 8;

    setCoords({ rX, rY, tX, tY });

    if (glare) {
      const gX = (mouseX / bounds.width) * 100;
      const gY = (mouseY / bounds.height) * 100;
      setGlarePos({ x: gX, y: gY });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rX: 0, rY: 0, tX: 0, tY: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  const style: React.CSSProperties = {
    transform: isHovered
      ? `perspective(1000px) rotateX(${coords.rX}deg) rotateY(${coords.rY}deg) scale3d(${scale}, ${scale}, ${scale}) translate3d(${coords.tX}px, ${coords.tY}px, 10px)`
      : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translate3d(0px, 0px, 0px)",
    transition: isHovered
      ? "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease"
      : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease",
    transformStyle: "preserve-3d" as const,
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      id={id}
      className={`relative select-none ${className} ${
        isHovered ? "shadow-[0_45px_85px_rgba(0,0,0,0.65)]" : "shadow-md"
      }`}
    >
      {/* 3D Glass shine glaze spotlight */}
      {glare && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-30 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 140px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glareOpacity}) 0%, transparent 80%)`,
            mixBlendMode: "overlay",
          }}
        />
      )}
      {children}
    </div>
  );
}
