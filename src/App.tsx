/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { SERVICES, PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import ProductSection from './components/ProductSection';
import BookingSection from './components/BookingSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

export default function App() {
  // Seed data if collection is empty (Only if user has permission, though client-side seed is just for demo comfort)
  useEffect(() => {
    const seedInitialData = async () => {
      const servicesSnap = await getDocs(collection(db, 'services'));
      if (servicesSnap.empty) {
        console.log('Seeding initial services...');
        const batch = writeBatch(db);
        SERVICES.forEach(s => {
          // Use name as ID for the booking check in rules
          const sDoc = doc(db, 'services', s.name);
          batch.set(sDoc, s);
        });
        PRODUCTS.forEach(p => {
          const pDoc = doc(collection(db, 'products'));
          batch.set(pDoc, p);
        });
        try {
          await batch.commit();
        } catch (e) {
          console.warn('Seeding failed (likely permissions). Manual setup may be required if admin not initialized.', e);
        }
      }
    };
    seedInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-paper selection:bg-brand-accent/30 selection:text-brand-ink">
      <Navbar />
      
      <main>
        <Hero />
        <ServicesSection />
        <ProductSection />
        <BookingSection />
        <ContactSection />
      </main>

      <Footer />
      
      {/* Floating Elements */}
      <Chatbot />
    </div>
  );
}
