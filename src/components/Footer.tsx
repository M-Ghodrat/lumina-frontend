import { APP_NAME, LOCATION, EMAIL, PHONE } from '../constants';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-500 py-24 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-brand-accent rounded-full"></div>
              <span className="text-xl font-semibold tracking-tight text-brand-ink">
                LUMINA <span className="font-light text-gray-400 uppercase text-xs ml-1">Vancouver</span>
              </span>
            </div>
            <p className="font-light text-lg max-w-sm mb-12">
              Ethical Radiance from the Pacific Northwest. Plant-based, clinical-grade beauty formulated in Gastown.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-brand-accent font-bold mb-8">Navigation</h4>
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#services" className="hover:text-brand-accent transition-colors">The Collection</a>
              <a href="#products" className="hover:text-brand-accent transition-colors">Skin Rituals</a>
              <a href="#booking" className="hover:text-brand-accent transition-colors">Our Story</a>
              <a href="#contact" className="hover:text-brand-accent transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-brand-accent font-bold mb-8">Studio</h4>
            <div className="space-y-4 text-sm">
              <p>{LOCATION}</p>
              <p>{PHONE}</p>
              <p className="text-brand-ink font-medium">{EMAIL}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-black/5 gap-8">
          <p className="text-[10px] uppercase tracking-widest font-bold">© 2024 {APP_NAME} • Ethical & Clinical</p>
          <div className="flex gap-12">
            <a href="#" className="text-[10px] uppercase font-bold hover:text-brand-ink transition-colors">Privacy</a>
            <a href="#" className="text-[10px] uppercase font-bold hover:text-brand-ink transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
