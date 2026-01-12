'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [auraColor, setAuraColor] = useState<string | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for aura attribute
      const auraElement = target.closest('[data-aura]') as HTMLElement;
      if (auraElement) {
        const aura = auraElement.getAttribute('data-aura');
        if (aura) setAuraColor(aura);
      } else {
        setAuraColor(null);
      }

      // Check for hover state
      if (target.closest('button, a, .cursor-pointer, [data-aura]')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .cursor-pointer, [data-aura]')) {
        setIsHovering(false);
        setAuraColor(null);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <motion.div
      animate={{
        x: mousePos.x - 16,
        y: mousePos.y - 16,
        scale: isHovering ? 2.5 : 1,
        borderColor: isHovering
          ? auraColor || 'var(--neon-pink)'
          : 'var(--neon-cyan)',
        backgroundColor:
          isHovering && auraColor ? `${auraColor}20` : 'transparent',
      }}
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 z-[9999] pointer-events-none mix-blend-difference hidden md:block"
      transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.5 }}
    />
  );
}
