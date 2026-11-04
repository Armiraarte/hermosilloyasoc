import React, { useEffect, useRef } from 'react';

// Texto animado al hacer scroll: cada letra (titulos) o palabra (parrafos) aparece de forma escalonada
// cuando el bloque entra en pantalla. La animacion es solo CSS (opacity/transform, ver index.css);
// aqui unicamente se parte el texto y se marca data-visible con un observer compartido.

type Unit = 'chars' | 'words';

interface SplitTextProps {
  as?: React.ElementType;
  unit?: Unit;
  /** Segundos de espera antes de empezar (util cuando el bloque ya entra con un fade). */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

let sharedObserver: IntersectionObserver | null = null;

const getObserver = (): IntersectionObserver => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = 'true';
            sharedObserver!.unobserve(entry.target);
          }
        });
      },
      // Se dispara un poco despues que el Reveal del contenedor, para que el fade ya este en marcha.
      { rootMargin: '0px 0px -18% 0px' }
    );
  }
  return sharedObserver;
};

const plainText = (node: React.ReactNode): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    if (element.type === 'br') return ' ';
    return plainText(element.props.children);
  }
  return '';
};

const unitStyle = (index: number) => ({ '--i': index }) as React.CSSProperties;

const split = (node: React.ReactNode, unit: Unit, counter: { n: number }): React.ReactNode => {
  if (node == null || typeof node === 'boolean') return null;
  if (typeof node === 'number') node = String(node);

  if (typeof node === 'string') {
    return node.split(/(\s+)/).map((part, i) => {
      if (part === '') return null;
      if (/^\s+$/.test(part)) return ' ';
      if (unit === 'words') {
        return (
          <span key={i} className="st-unit" style={unitStyle(counter.n++)}>
            {part}
          </span>
        );
      }
      return (
        <span key={i} className="st-word">
          {Array.from(part).map((char, j) => (
            <span key={j} className="st-unit" style={unitStyle(counter.n++)}>
              {char}
            </span>
          ))}
        </span>
      );
    });
  }

  if (Array.isArray(node)) {
    return node.map((child, i) => <React.Fragment key={i}>{split(child, unit, counter)}</React.Fragment>);
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    if (element.props.children === undefined) return element;
    return React.cloneElement(element, undefined, split(element.props.children, unit, counter));
  }

  return node;
};

const SplitText: React.FC<SplitTextProps> = ({ as: Tag = 'span', unit = 'words' as Unit, delay = 0, className = '', children }) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.visible = 'true';
      return;
    }
    const observer = getObserver();
    observer.observe(node);
    return () => observer.unobserve(node);
  }, []);

  const counter = { n: 0 };
  const content = split(children, unit, counter);
  // El tiempo total se limita para que un parrafo largo no tarde demasiado en completarse.
  const baseStep = unit === 'chars' ? 26 : 38;
  const maxTotal = unit === 'chars' ? 1100 : 1300;
  const step = Math.min(baseStep, maxTotal / Math.max(counter.n, 1));

  return (
    <Tag
      ref={ref}
      className={`st ${className}`}
      style={{ '--st-delay': `${delay}s`, '--st-step': `${step.toFixed(1)}ms` } as React.CSSProperties}
    >
      <span className="sr-only">{plainText(children)}</span>
      <span aria-hidden="true">{content}</span>
    </Tag>
  );
};

export default SplitText;
