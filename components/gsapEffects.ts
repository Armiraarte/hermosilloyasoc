export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Línea de la pantalla en la que se revela cada elemento, en el orden de la página. */
export const SEQUENCE_RATIO = 0.72;
export const SEQUENCE_START = `top ${SEQUENCE_RATIO * 100}%`;
