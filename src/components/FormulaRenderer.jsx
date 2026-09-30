import React, { useEffect, useRef } from 'react';
import katex from 'katex';

/**
 * FormulaRenderer renders LaTeX math equations using KaTeX.
 * Example: <FormulaRenderer math="E = \frac{1}{2} m v^2" block={false} />
 */
export default function FormulaRenderer({ math, block = false, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && math) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false
        });
      } catch (e) {
        console.error('KaTeX rendering error:', e);
        containerRef.current.innerText = math;
      }
    }
  }, [math, block]);

  return <span ref={containerRef} className={`formula-container ${className}`} />;
}
