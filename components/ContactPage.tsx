
import React from 'react';
import Navbar from './Navbar';
import Contact from './Contact';
import LocationMap from './LocationMap';
import Footer from './Footer';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white font-sans">
      {/* Reutilizamos el Navbar */}
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Sección de Encabezado específica para esta página */}
        <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">Contáctanos</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Esta es una página independiente diseñada exclusivamente para atender tus consultas.
            </p>
        </div>

        {/* Componentes reutilizados */}
        <Contact />
        <LocationMap />
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
