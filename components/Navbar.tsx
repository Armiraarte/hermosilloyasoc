import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  // Detectar si es Diciembre (Mes 11 en index 0)
  const isDecember = new Date().getMonth() === 11;
  const isFloatingNavbar = scrolled || mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!navRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (!navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const element = document.querySelector(hash);

    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'INICIO', href: '#inicio' },
    { name: 'QUIENES SOMOS', href: '#nosotros' },
    { name: 'SERVICIOS', href: '#servicios' },
    { name: 'EXPEDIENTES', href: '#sistema-control-expedientes' },
    { name: 'EQUIPO', href: '#equipo' },
    { name: 'INSTALACIONES', href: '#instalaciones' },
  ];

  return (
    <>
      {isDecember && (
        <style>{`
          @keyframes snowfall {
            0% { transform: translateY(-10px) translateX(0); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(100px) translateX(20px); opacity: 0; }
          }
          .snow-flake {
            position: absolute;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            animation: snowfall linear infinite;
          }
        `}</style>
      )}

      <nav
        ref={navRef}
        className={`fixed z-50 overflow-visible transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isFloatingNavbar
            ? 'top-2 md:top-4 left-0 right-0 mx-auto w-[95%] md:w-[90%] max-w-7xl rounded-[2rem] border border-white/10 bg-black py-2 md:py-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)]'
            : 'top-0 left-0 w-full border-b border-white/10 bg-black py-6'
        }`}
      >
        {isDecember && (
          <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${isFloatingNavbar ? 'rounded-[2rem]' : 'rounded-full'}`}>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="snow-flake bg-white/60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}px`,
                  width: `${Math.random() * 3 + 2}px`,
                  height: `${Math.random() * 3 + 2}px`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_10px_white]"></div>
          </div>
        )}

        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-b from-white/6 to-transparent transition-opacity duration-700 ${
            isFloatingNavbar ? 'rounded-[2rem] opacity-60' : 'rounded-full opacity-0'
          }`}
        ></div>

        <div className={`relative flex h-full w-full items-center justify-between px-6 ${mobileMenuOpen ? 'z-[60]' : 'z-10'}`}>
          <div className="flex items-center gap-4">
            <div className={`transition-transform duration-700 ease-out ${scrolled ? 'origin-left scale-90' : 'scale-100'}`}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
              >
                <Logo />
              </a>
            </div>
          </div>

          <div className="hidden items-center gap-4 font-sans text-[10px] font-medium tracking-widest xl:flex xl:gap-8 xl:text-xs">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative py-2 text-gray-400 transition-colors duration-300 hover:text-white"
              >
                <span className="relative z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                  {link.name}
                </span>
                <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-300 ease-out group-hover:w-full group-hover:opacity-100"></span>
              </a>
            ))}

            <a
              href="#contacto"
              onClick={(e) => handleNavClick(e, '#contacto')}
              className="group relative overflow-hidden rounded-full border border-white/30 px-5 py-2 text-[10px] uppercase text-white transition-all duration-500 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] md:rounded-sm xl:text-xs"
            >
              <span className="absolute inset-0 h-full w-full -translate-x-full bg-white transition-transform duration-300 ease-out group-hover:translate-x-0"></span>
              <span className="relative z-10 font-bold transition-colors duration-300 group-hover:text-black">
                CONTACTO
              </span>
            </a>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            className={`xl:hidden rounded-full border p-2 transition-all duration-300 ${
              mobileMenuOpen
                ? 'border-white/20 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.12)]'
                : 'border-transparent text-white hover:border-white/10 hover:bg-white/5 hover:text-gray-200'
            }`}
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div
          className={`absolute left-4 right-4 top-[calc(100%+0.75rem)] z-40 origin-top transition-all duration-500 ease-out xl:hidden ${
            mobileMenuOpen
              ? 'visible translate-y-0 scale-100 opacity-100'
              : 'invisible -translate-y-3 scale-95 opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/92 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="px-5 pb-3 pt-5 text-[11px] uppercase tracking-[0.35em] text-white/45">
              Navegacion
            </div>

            <div className="px-3 pb-3">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="group flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium tracking-[0.24em] text-white/75 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  style={{ transitionDelay: `${index * 45}ms` }}
                >
                  <span>{link.name}</span>
                  <span className="text-base transition-transform duration-300 group-hover:translate-x-1">{'>'}</span>
                </a>
              ))}
            </div>

            <div className="border-t border-white/10 px-5 py-5">
              <a
                href="#contacto"
                onClick={(e) => handleNavClick(e, '#contacto')}
                className="flex items-center justify-center rounded-full border border-white/30 bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.32em] text-black transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
              >
                Contacto
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
