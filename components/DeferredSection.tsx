import React, { Suspense, useEffect, useRef, useState } from 'react';

interface DeferredSectionProps {
  children: React.ReactNode;
  minHeight?: number | string;
  // Alturas por breakpoint (clases de Tailwind). Si se pasa, tiene prioridad sobre minHeight.
  minHeightClassName?: string;
  rootMargin?: string;
}

const getMinHeight = (minHeight: number | string) =>
  typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

const DeferredSection: React.FC<DeferredSectionProps> = ({
  children,
  minHeight = 320,
  minHeightClassName,
  rootMargin = '350px 0px',
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  const placeholderStyle = minHeightClassName ? undefined : { minHeight: getMinHeight(minHeight) };

  return (
    <div
      ref={containerRef}
      className={!shouldRender ? minHeightClassName : undefined}
      style={!shouldRender ? placeholderStyle : undefined}
    >
      {/* Mientras carga el chunk se conserva la altura reservada para que la pagina no brinque. */}
      {shouldRender ? (
        <Suspense fallback={<div className={minHeightClassName} style={placeholderStyle} />}>{children}</Suspense>
      ) : null}
    </div>
  );
};

export default DeferredSection;
