
import React from 'react';
import { IMAGENES } from '../imagenes_url';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* IMAGEN DEL LOGO */}
      <div className="w-10 h-10 md:w-12 md:h-12 relative flex-shrink-0">
         <img 
            src={IMAGENES.assets.logos.navbar} 
            alt="Logo Grupo Hermosillo" 
            className="w-full h-full object-contain filter brightness-0 invert" 
         />
      </div>

      {/* TEXTO DEL LOGO */}
      <div className="flex flex-col leading-none">
        <span className="font-serif text-xl md:text-2xl font-bold tracking-wider text-white">
          HERMOSILLO
        </span>
        <span className="text-[0.6rem] font-sans tracking-[0.2em] text-gray-400 uppercase">
          y Asociados
        </span>
      </div>
    </div>
  );
};

export default Logo;
