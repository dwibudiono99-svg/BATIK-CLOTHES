/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BATIK_TIPS = [
  "Batik Indonesia diakui UNESCO sebagai Warisan Kemanusiaan untuk Budaya Lisan dan Nonbendawi sejak 2009.",
  "Filosofi Parang Rusak: melambangkan semangat pantang menyerah seperti ombak yang tak henti memecah karang.",
  "Motif Mega Mendung Cirebon: paduan akulturasi budaya Tiongkok dan Nusantara dengan gradasi awan penyejuk jiwa.",
  "Motif Kawung: lambang kesucian hati, keadilan, dan kerendahan hati para ksatria Jawa.",
  "Tips Fitting: Gunakan tombol 'Simpan Foto' di pojok atas untuk mengunduh hasil fitting batik Anda.",
  "Batik Pekalongan: terkenal dengan ragam corak buketan floral nan ceria dan warna-warni pesisiran yang dinamis.",
];

interface FooterProps {
  isOnDressingScreen?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isOnDressingScreen = false }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prevIndex) => (prevIndex + 1) % BATIK_TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 bg-stone-900/90 text-stone-300 backdrop-blur-md border-t border-amber-900/40 p-2.5 z-40 ${
        isOnDressingScreen ? 'hidden sm:block' : ''
      }`}
    >
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between text-xs max-w-7xl px-4 gap-1">
        <p className="text-stone-400">
          <strong className="text-amber-400 font-serif">BatikFit</strong> • Virtual Fitting Room Busana Batik Nusantara
        </p>
        <div className="h-4 flex items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="text-center sm:text-right text-[11px] text-amber-200/90 truncate max-w-md sm:max-w-xl"
            >
              ✦ {BATIK_TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </footer>
  );
};

export default Footer;