import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { LOCATION, EMAIL, PHONE } from '../constants';
import { Send, MapPin, Mail, Phone, Instagram, Facebook } from 'lucide-react';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createInquiry(form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error("Error submitting inquiry via API:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-24">
          <div className="lg:w-1/3">
            <h2 className="text-6xl font-light mb-8">Let's <span className="italic font-serif text-brand-accent">Connect</span></h2>
            <p className="text-gray-500 font-light text-lg mb-12">
              Our Gastown studio is open for consultations and rituals. Get in touch for bespoke advice.
            </p>
            
            <div className="space-y-6">
              <div className="p-6 bg-brand-ink text-white rounded-3xl group cursor-pointer hover:bg-black transition-all">
                <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest mb-1">Visit Us</p>
                <p className="text-sm font-medium">{LOCATION}</p>
                <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold uppercase underline underline-offset-4 decoration-brand-accent">Get Directions</span>
                  <MapPin size={14} className="text-brand-accent" />
                </div>
              </div>

               <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Inquiries</p>
                <p className="text-sm font-medium mb-1">{EMAIL}</p>
                <p className="text-sm font-medium">{PHONE}</p>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 bg-white p-10 md:p-16 rounded-[40px] shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            
            <h3 className="text-3xl font-light mb-12">Send a Message</h3>
            {sent ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={24} className="text-brand-accent" />
                </div>
                <p className="text-2xl font-light italic font-serif text-brand-accent mb-4">Radiance received.</p>
                <p className="text-gray-500 font-light">We'll reach out within one business cycle.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="input-field"
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="input-field"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Skincare Inquiry</label>
                  <textarea 
                    rows={4}
                    required
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    className="input-field resize-none"
                    placeholder="Describe your skin story..."
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="pill-button-accent md:w-fit px-12 py-5 disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
