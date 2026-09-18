import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden pt-20">
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-accent/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#E9EDC9]/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-light leading-[1.05] tracking-tight mb-8">
            Ethical Radiance <br/> 
            <span className="italic font-serif text-brand-accent">from the PNW Coast.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-lg mb-12 leading-relaxed font-light">
            Plant-based, clinical-grade beauty formulated in our Vancouver lab. 
            Experience the synergy of ocean botanicals and modern science.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <a href="#booking" className="pill-button-accent flex items-center justify-center gap-3 py-5 px-10 group">
              Start Your Ritual
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#services" className="font-medium text-sm text-gray-500 hover:text-brand-ink transition-colors flex items-center justify-center gap-2">
              View Collection
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative aspect-square lg:aspect-[4/5] overflow-hidden rounded-[3rem] shadow-2xl"
        >
          <img 
            src="https://picsum.photos/seed/sleekbeauty/1200/1500" 
            alt="Lumina Vancouver Studio"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden lg:flex"
      >
        <span className="micro-label opacity-40">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-brand-ink/20 to-transparent" />
      </motion.div>
    </section>
  );
}
