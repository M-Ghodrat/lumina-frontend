import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag, Calendar, LogIn, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '../constants';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import AuthModal from './AuthModal';
import AdminDashboard from './AdminDashboard';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Boutique', href: '#products' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4 border-b border-black/5' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {user ? user.displayName?.charAt(0).toUpperCase() || 'L' : 'L'}
            </div>
            <a href="/" className="text-xl font-semibold tracking-tight">
              LUMINA <span className="font-light text-gray-400 uppercase text-xs ml-1">Vancouver</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-gray-500 hover:text-brand-accent transition-colors">
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-8 border-l border-black/5 pl-8">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.email === 'mohsenghodrat2@gmail.com' && (
                    <button 
                      onClick={() => setIsAdminDashboardOpen(true)} 
                      className="text-xs font-bold text-amber-600 uppercase tracking-wider hover:text-amber-700 transition-all flex items-center gap-1.5 border-r border-black/5 pr-4 cursor-pointer"
                    >
                      <ShieldCheck size={14} className="animate-pulse" /> Admin Desk
                    </button>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-ink/60 font-medium">Hello, {user.displayName || 'Guest'}</span>
                    <button onClick={() => signOut(auth)} className="text-xs font-semibold text-gray-400 uppercase tracking-tighter hover:text-brand-accent transition-colors flex items-center gap-1">
                      <LogOut size={12} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="text-xs font-semibold text-gray-400 uppercase tracking-tighter hover:text-brand-accent transition-colors flex items-center gap-1">
                  <LogIn size={12} /> Sign In
                </button>
              )}
              <a href="#booking" className="pill-button-primary">
                Book Treatment
              </a>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-brand-paper border-b border-brand-ink/5 p-6 md:hidden flex flex-col gap-6"
            >
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="font-serif text-2xl">
                  {link.name}
                </a>
              ))}
              <div className="border-t border-brand-ink/5 pt-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    {user.email === 'mohsenghodrat2@gmail.com' && (
                      <button 
                        onClick={() => { setIsAdminDashboardOpen(true); setIsMenuOpen(false); }} 
                        className="w-full text-center py-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 font-bold uppercase text-xs hover:bg-amber-100/50 tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck size={16} /> Operations Admin Desk
                      </button>
                    )}
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-brand-accent mb-1">Hello, {user.displayName || 'Guest'}</p>
                      <button 
                        onClick={() => { signOut(auth); setIsMenuOpen(false); }} 
                        className="text-left py-2 font-semibold text-gray-400 uppercase text-xs hover:text-brand-accent tracking-wider flex items-center gap-2"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} 
                    className="text-left py-2 font-semibold text-gray-400 uppercase text-xs hover:text-brand-accent tracking-wider flex items-center gap-2"
                  >
                    <LogIn size={14} /> Sign In / Register
                  </button>
                )}
              </div>
              <a href="#booking" onClick={() => setIsMenuOpen(false)} className="bg-brand-ink text-brand-paper text-center py-4 uppercase tracking-[0.2em] font-medium text-xs">
                Book Appointment
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal integration */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Admin Dashboard Operations overlay */}
      <AdminDashboard isOpen={isAdminDashboardOpen} onClose={() => setIsAdminDashboardOpen(false)} />
    </>
  );
}
