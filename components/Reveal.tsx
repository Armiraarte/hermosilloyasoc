
import React, { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  direction?: "up" | "down" | "left" | "right" | "none"; // 'none' for just fade/blur
  delay?: number; // in seconds
  duration?: number; // in seconds
  className?: string;
  threshold?: number; // 0 to 1
  blur?: boolean; // Enable blur effect (solo escritorio, ver index.css)
}

const OFFSETS: Record<NonNullable<RevealProps['direction']>, [string, string]> = {
  up: ['0px', '40px'],
  down: ['0px', '-40px'],
  left: ['40px', '0px'],
  right: ['-40px', '0px'],
  none: ['0px', '0px'],
};

// Un solo IntersectionObserver por umbral para toda la pagina (antes era uno por elemento).
const observers = new Map<number, IntersectionObserver>();

const getObserver = (threshold: number): IntersectionObserver => {
  let observer = observers.get(threshold);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Se marca directo en el DOM: evita un re-render de React por cada elemento revelado.
            (entry.target as HTMLElement).dataset.visible = 'true';
            observer!.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    observers.set(threshold, observer);
  }
  return observer;
};

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

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.visible = 'true';
      return;
    }

    const observer = getObserver(threshold);
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [threshold]);

  const [x, y] = OFFSETS[direction] ?? OFFSETS.up;
  const style = {
    width,
    '--rv-x': x,
    '--rv-y': y,
    '--rv-dur': `${duration}s`,
    '--rv-delay': `${delay}s`,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      className={`reveal${blur ? ' reveal-blur' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
