import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { PRODUCTS } from '../constants';
import { ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ProductSection() {
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await api.getProducts();
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts as unknown as typeof PRODUCTS);
        }
      } catch (error) {
        console.error("Error fetching products from backend: ", error);
      }
    }
    loadProducts();
  }, []);

  // Guarantee uniqueness by id or name to eliminate duplicate keys
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((item, index) => {
      const identifier = (item as any).id || item.name || `product-${index}`;
      if (seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });
  }, [products]);

  return (
    <section id="products" className="py-32 bg-brand-mute/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 sticky top-32">
            <h4 className="text-[10px] uppercase tracking-widest text-brand-accent font-bold mb-4">Vancouver Formulated</h4>
            <h2 className="text-6xl font-light mb-8">
              Essential <br /><span className="italic font-serif text-brand-accent">Elixirs</span>
            </h2>
            <p className="text-gray-500 font-light text-lg mb-12 leading-relaxed">
              Plant-based, clinical-grade beauty formulated in our local lab. 
              Available at our Gastown studio or shipped nationwide.
            </p>
            <button className="pill-button-primary w-fit flex items-center gap-3">
              Marketplace <ArrowRight size={14} />
            </button>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {uniqueProducts.map((product, index) => (
              <motion.div
                key={(product as any).id ? `${(product as any).id}-${index}` : `${product.name}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-6 items-center group cursor-pointer hover:shadow-md transition-all"
              >
                <div className="w-28 h-28 bg-brand-mute rounded-3xl overflow-hidden flex-shrink-0">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{product.category}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">${product.price}.00</span>
                    <button className="text-[10px] font-bold text-brand-accent uppercase hover:underline">Add</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
