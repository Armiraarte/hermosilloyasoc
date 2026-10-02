import React, { Suspense, useEffect, useRef, useState } from 'react';

interface DeferredSectionProps {
  children: React.ReactNode;
  minHeight?: number | string;
  rootMargin?: string;
}

const getMinHeight = (minHeight: number | string) =>
  typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

const DeferredSection: React.FC<DeferredSectionProps> = ({
  children,
  minHeight = 320,
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

  return (
    <div
      ref={containerRef}
      style={!shouldRender ? { minHeight: getMinHeight(minHeight) } : undefined}
    >
      {shouldRender ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
};

export default DeferredSection;
