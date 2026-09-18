import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { auth, signInWithGoogle } from '../firebase';
import { api } from '../services/api';
import { SERVICES } from '../constants';
import { Calendar as CalendarIcon, Clock, CheckCircle2, User, Sparkles, LogIn, Chrome, ShieldAlert, BadgeCheck } from 'lucide-react';
import AuthModal from './AuthModal';

export default function BookingSection() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userDetails, setUserDetails] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState(SERVICES);
  const [isLocalAuthOpen, setIsLocalAuthOpen] = useState(false);
  const [localAuthTab, setLocalAuthTab] = useState<'signin' | 'signup'>('signin');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsUserLoggedIn(!!user);
      if (user) {
        setUserDetails({ name: user.displayName || '', email: user.email || '' });
      } else {
        setUserDetails({ name: '', email: '' });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadServices() {
      try {
        const fetchedServices = await api.getServices();
        if (fetchedServices && fetchedServices.length > 0) {
          setServices(fetchedServices as unknown as typeof SERVICES);
        }
      } catch (error) {
        console.error("Error fetching services via backend API in BookingSection: ", error);
      }
    }
    loadServices();
  }, []);

  // Guarantee uniqueness by id or name to eliminate duplicate keys
  const uniqueServices = useMemo(() => {
    const seen = new Set<string>();
    return services.filter((item, index) => {
      const identifier = (item as any).id || item.name || `service-${index}`;
      if (seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });
  }, [services]);

  const handleBooking = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.createAppointment({
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        customerName: userDetails.name,
        customerEmail: userDetails.email,
        status: 'pending',
        userId: auth.currentUser?.uid || undefined,
      });
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocalGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError('Google instant sign in failed.');
    }
  };

  const getServiceName = (id: string) => services.find(s => s.name === id)?.name || id;

  return (
    <section id="booking" className="py-32 bg-brand-paper">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h4 className="text-[10px] uppercase tracking-widest text-brand-accent font-bold mb-4">Gastown Studio</h4>
          <h2 className="text-5xl md:text-7xl font-light mb-6">Online <span className="italic font-serif text-brand-accent">Rituals</span></h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${step >= i ? 'w-16 bg-brand-accent' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <h3 className="text-2xl font-light text-center mb-8">Select a Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uniqueServices.map((s, index) => (
                  <button
                    key={(s as any).id ? `${(s as any).id}-${index}` : `${s.name}-${index}`}
                    onClick={() => { setSelectedService(s.name); setStep(2); }}
                    className={`p-6 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${selectedService === s.name ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-100 hover:border-brand-accent/30 hover:bg-gray-50'}`}
                  >
                    <div className="w-12 h-12 bg-brand-mute rounded-2xl flex-shrink-0 flex items-center justify-center">
                      <Sparkles size={20} className="text-brand-accent" />
                    </div>
                    <div className="flex-grow">
                      <span className="font-medium block">{s.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">${s.price} • {s.duration} MIN</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-3">Preferred Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field text-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-3">Preferred Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 text-xs rounded-xl border transition-all ${selectedTime === t ? 'border-brand-accent bg-brand-accent text-white' : 'border-gray-100 hover:border-brand-accent/30'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedDate && selectedTime && (
                 <button 
                  onClick={() => setStep(3)} 
                  className="pill-button-accent w-full py-5"
                >
                  Confirm Details
                </button>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="max-w-md mx-auto text-center">
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-xs flex gap-2 items-center justify-center">
                    <ShieldAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {isUserLoggedIn ? (
                  <>
                    <div className="mb-6 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-3 px-4 rounded-xl mx-auto w-fit text-xs font-semibold">
                      <BadgeCheck size={16} />
                      <span>Verified Profile Session Active</span>
                    </div>

                    <h4 className="text-2xl font-light mb-8">Confirm Your Details</h4>
                    <div className="space-y-4">
                      <div className="text-left">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2 px-1">Full Name</label>
                        <input 
                          type="text" 
                          value={userDetails.name}
                          onChange={e => setUserDetails({...userDetails, name: e.target.value})}
                          placeholder="Jane Doe"
                          className="input-field"
                        />
                      </div>
                      <div className="text-left">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2 px-1">Email Address</label>
                        <input 
                          type="email" 
                          value={userDetails.email}
                          onChange={e => setUserDetails({...userDetails, email: e.target.value})}
                          placeholder="jane@example.com"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleBooking}
                      disabled={isSubmitting || !userDetails.name || !userDetails.email}
                      className="pill-button-accent w-full py-5 mt-10 disabled:opacity-30"
                    >
                      {isSubmitting ? 'Reserving...' : 'Finalize Appointment'}
                    </button>
                  </>
                ) : (
                  <div className="py-6 px-4">
                    <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center mx-auto mb-6">
                      <User size={28} className="text-brand-accent" />
                    </div>
                    <h3 className="text-2xl font-serif mb-3">Identity Verification Required</h3>
                    <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                      Lumina requires a verified profile to guarantee appointments and avoid automated spam scheduling.
                    </p>

                    <div className="space-y-3.5">
                      <button 
                        onClick={handleLocalGoogleSignIn}
                        className="w-full flex items-center justify-center gap-2.5 p-4 rounded-full border border-gray-100 hover:bg-gray-50 transition-all font-medium text-xs text-gray-600 shadow-sm"
                      >
                        <Chrome size={16} className="text-[#4285F4]" />
                        <span>Verify Instantly via Google (Gmail)</span>
                      </button>

                      <div className="relative my-4 text-center">
                        <hr className="border-gray-100" />
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] uppercase tracking-widest text-gray-400">
                          Or use pass credentials
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => { setLocalAuthTab('signin'); setIsLocalAuthOpen(true); }}
                          className="py-3 bg-brand-ink text-white rounded-full text-xs font-semibold hover:bg-black transition-all flex items-center justify-center gap-1.5"
                        >
                          <LogIn size={14} /> Profile Sign In
                        </button>
                        <button 
                          onClick={() => { setLocalAuthTab('signup'); setIsLocalAuthOpen(true); }}
                          className="py-3 bg-brand-mute hover:opacity-90 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          Register Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} className="text-brand-accent" />
              </div>
              <h3 className="text-3xl font-serif mb-4">Confirmed!</h3>
              <p className="font-serif text-lg opacity-60 mb-8 max-w-sm mx-auto">
                Your ritual for {selectedDate} at {selectedTime} has been reserved. A confirmation email has been sent.
              </p>
              <button 
                onClick={() => setStep(1)} 
                className="micro-label hover:text-brand-accent transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          )}

        </div>
      </div>

      {/* Local Auth Modal triggers */}
      <AuthModal 
        isOpen={isLocalAuthOpen} 
        onClose={() => setIsLocalAuthOpen(false)} 
        initialTab={localAuthTab} 
      />
    </section>
  );
}
