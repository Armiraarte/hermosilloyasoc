
import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  direction?: "up" | "down" | "left" | "right" | "none"; // 'none' for just fade/blur
  delay?: number; // in seconds
  duration?: number; // in seconds
  className?: string;
  threshold?: number; // 0 to 1
  blur?: boolean; // Enable blur effect
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = "fit-content", 
  direction = "up", 
  delay = 0, 
  duration = 0.8,
  className = "",
  threshold = 0.2,
  blur = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can disconnect if we only want it to animate once
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

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
