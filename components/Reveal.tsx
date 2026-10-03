import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, SEQUENCE_START } from './gsapEffects';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  direction?: "up" | "down" | "left" | "right" | "none"; // 'none' for just fade/blur
  delay?: number; // in seconds
  duration?: number; // in seconds
  className?: string;
  threshold?: number; // Se conserva por compatibilidad; la secuencia usa SEQUENCE_START
  blur?: boolean; // Enable blur effect
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = "fit-content", 
  direction = "up", 
  delay = 0, 
  duration = 0.8,
  className = "",
  blur = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);

  // Se revela al cruzar la línea de secuencia, en el orden de la página.
  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: `clamp(${SEQUENCE_START})`,
      once: true,
      onEnter: () => setIsVisible(true),
    });
    return () => trigger.kill();
  }, [isVisible]);
  // Calculate transform based on direction
  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case "up": return "translate3d(0, 40px, 0)";
        case "down": return "translate3d(0, -40px, 0)";
        case "left": return "translate3d(40px, 0, 0)";
        case "right": return "translate3d(-40px, 0, 0)";
        case "none": return "translate3d(0, 0, 0)";
        default: return "translate3d(0, 40px, 0)";
      }
    }
    return "translate3d(0, 0, 0)";
  };

  const transitionProperty = blur ? "opacity, transform, filter" : "opacity, transform";
  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: getTransform(),
    filter: blur ? (isVisible ? "blur(0px)" : "blur(4px)") : "none",
    transitionProperty,
    transitionDuration: `${duration}s`,
    transitionTimingFunction: "cubic-bezier(0.17, 0.55, 0.55, 1)",
    transitionDelay: `${delay}s`,
    willChange: transitionProperty,
  };

  return (
    <div ref={ref} style={{ width, ...style }} className={className}>
      {children}
    </div>
  );
};

export default Reveal;
