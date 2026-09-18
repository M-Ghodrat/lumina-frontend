import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { SERVICES } from '../constants';
import { api } from '../services/api';

export default function ServicesSection() {
  const [services, setServices] = useState(SERVICES);

  useEffect(() => {
    async function loadServices() {
      try {
        const fetchedServices = await api.getServices();
        if (fetchedServices && fetchedServices.length > 0) {
          setServices(fetchedServices as unknown as typeof SERVICES);
        }
      } catch (error) {
        console.error("Error fetching services from backend: ", error);
      }
    }
    loadServices();
  }, []);

  // Guarantee unique service items to prevent duplicate rendering and non-unique keys
  const uniqueServices = useMemo(() => {
    const seen = new Set<string>();
    return services.filter((item, index) => {
      const identifier = (item as any).id || item.name || `service-${index}`;
      if (seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });
  }, [services]);

  return (
    <section id="services" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <h4 className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-4">Gastown Studio</h4>
            <h2 className="text-5xl md:text-7xl font-light leading-tight">
              Clinical Rituals <br/> 
              <span className="italic font-serif text-brand-accent">for skin longevity.</span>
            </h2>
          </div>
          <p className="text-gray-500 font-light text-lg max-w-sm pb-2">
            Each treatment is a synergy between high-performance botanicals and modern clinical practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {uniqueServices.map((service, index) => (
            <motion.div
              key={(service as any).id ? `${(service as any).id}-${index}` : `${service.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="luxury-card group"
            >
              <div className="aspect-square mb-6 overflow-hidden relative rounded-2xl bg-brand-mute">
                <img 
                  src={service.imageUrl} 
                  alt={service.name} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-medium mb-1">{service.name}</h3>
                <p className="text-xs text-gray-400">Professional {service.category}</p>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-semibold">${service.price}.00</span>
                <a href="#booking" className="w-10 h-10 bg-brand-mute rounded-full flex items-center justify-center text-brand-ink group-hover:bg-brand-accent group-hover:text-white transition-all">
                  →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
