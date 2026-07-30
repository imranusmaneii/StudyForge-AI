import React, { useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g., 'blue', 'cyan', 'purple'
  onClick?: () => void;
  id?: string;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  onClick,
  id
}) => {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const glowStyles = {
    blue: 'shadow-[0_0_25px_rgba(0,112,243,0.12)] hover:shadow-[0_0_35px_rgba(0,112,243,0.25)] hover:border-[#0070F3]/40',
    cyan: 'shadow-[0_0_25px_rgba(0,163,255,0.12)] hover:shadow-[0_0_35px_rgba(0,163,255,0.25)] hover:border-[#00A3FF]/40',
    purple: 'shadow-[0_0_25px_rgba(139,92,246,0.12)] hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] hover:border-purple-500/40',
    sky: 'shadow-[0_0_25px_rgba(56,189,248,0.12)] hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] hover:border-sky-500/40'
  }[glowColor] || 'shadow-[0_0_25px_rgba(0,112,243,0.12)] hover:shadow-[0_0_35px_rgba(0,112,243,0.25)] hover:border-[#0070F3]/40';

  return (
    <div
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transform, transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out' }}
      className={`relative group rounded-xl bg-[#080B12] border border-white/5 p-5 ${glowStyles} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Subtle top light ray highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0070F3]/30 to-transparent group-hover:via-[#0070F3]/60 transition-all duration-300" />
      {children}
    </div>
  );
};
