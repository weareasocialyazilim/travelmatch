'use client';

import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * TravelMatch Premium Magnetic Button
 *
 * Features:
 * - Magnetic mouse attraction effect
 * - Smooth spring physics
 * - Glow effect on hover
 * - Customizable strength and variants
 * - Works with any children
 */

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'div' | 'span';
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.3,
  disabled = false,
  variant = 'default',
  size = 'md',
  as = 'button',
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLDivElement | HTMLSpanElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouse = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovering(true);
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-primary text-background font-bold
          hover:shadow-glow-md
        `;
      case 'ghost':
        return `
          bg-transparent border border-border text-foreground
          hover:border-primary hover:text-primary
        `;
      case 'glow':
        return `
          bg-primary/10 text-primary border border-primary/30
          hover:bg-primary/20 hover:border-primary/50
          hover:shadow-glow-sm
        `;
      default:
        return '';
    }
  };

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-10 py-5 text-lg';
      default:
        return 'px-8 py-4 text-base';
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Common props
  const motionProps = {
    ref: ref as React.RefObject<HTMLButtonElement>,
    onMouseMove: handleMouse,
    onMouseLeave: reset,
    onMouseEnter: handleMouseEnter,
    onClick: disabled ? undefined : onClick,
    animate: { x: position.x, y: position.y },
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
      mass: 0.1,
    },
    className: `
      relative inline-flex items-center justify-center
      rounded-full overflow-hidden
      transition-all duration-300 ease-out
      ${variantStyles}
      ${sizeStyles}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' '),
    'data-magnetic': true,
  };

  const Component = motion[as] as typeof motion.button;

  return (
    <Component {...motionProps}>
      {/* Content */}
      <span className="relative z-10">{children}</span>

      {/* Shine effect on hover */}
      {variant !== 'default' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: isHovering ? '100%' : '-100%',
            opacity: isHovering ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}

      {/* Glow background for primary variant */}
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-primary rounded-full"
          animate={{
            scale: isHovering ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Component>
  );
}

/**
 * Premium styled button with magnetic effect
 */
export function PremiumButton({
  children,
  className = '',
  onClick,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={`
        relative px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm
        transition-shadow duration-300
        ${glow ? 'hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      data-magnetic
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-primary rounded-full" />
    </motion.button>
  );
}

export default MagneticButton;
