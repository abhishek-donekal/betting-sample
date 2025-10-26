import React, { useState, useRef, useEffect } from 'react';
import './FuturisticCard.css';

interface FuturisticCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
  tiltEffect?: boolean;
  style?: React.CSSProperties;
}

const FuturisticCard: React.FC<FuturisticCardProps> = ({
  children,
  className = '',
  glowColor = '#00ffff',
  hoverEffect = true,
  tiltEffect = true,
  style = {}
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !tiltEffect) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  useEffect(() => {
    if (cardRef.current && tiltEffect) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) translateZ(${isHovered ? 20 : 0}px)`;
    }
  }, [mousePosition, isHovered, tiltEffect]);

  return (
    <div
      ref={cardRef}
      className={`futuristic-card ${className} ${isHovered ? 'hovered' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--glow-color': glowColor,
        '--hover-scale': hoverEffect ? '1.05' : '1',
        '--tilt-x': `${mousePosition.x}deg`,
        '--tilt-y': `${mousePosition.y}deg`,
        ...style
      } as React.CSSProperties}
    >
      <div className="card-glow"></div>
      <div className="card-content">
        {children}
      </div>
      <div className="card-border"></div>
    </div>
  );
};

export default FuturisticCard;
