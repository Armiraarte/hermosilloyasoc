
import React, { useEffect } from 'react';
import Home from './components/Home';

const App: React.FC = () => {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-gray-700 selection:text-white">
      {/* Estilos Globales y Animaciones */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer-platinum {
          0% { transform: translateX(-150%) skewX(-25deg); }
          15% { transform: translateX(150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
        @keyframes sheen-slide {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 30px 30px; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-grid {
          animation: grid-move 4s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .platinum-shine {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }
        /* Vidrio negro con filo platino (tarjetas flotantes) */
        .platinum-glass {
          position: relative;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(30, 31, 36, 0.92), rgba(8, 8, 10, 0.96));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        .platinum-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, #f4f4f5 0%, #9a9aa0 22%, #3a3a3f 42%, #d8d8dc 60%, #6e6e75 80%, #f4f4f5 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .platinum-text {
          background: linear-gradient(180deg, #ffffff, #e0e3ec 48%, #a7afbf);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .platinum-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4), transparent);
          transform: translateX(-150%) skewX(-25deg);
          animation: shimmer-platinum 4s infinite;
        }
      `}</style>

      {/* Renderizado exclusivo del sitio de abogados */}
      <Home />

    </div>
  );
};

export default App;
