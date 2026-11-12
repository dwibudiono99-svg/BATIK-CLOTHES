/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SparklesIcon, XIcon } from './icons';

const MOTIF_GUIDE = [
  {
    name: 'Parang Rusak',
    origin: 'Keraton Mataram / Solo & Yogyakarta',
    meaning: 'Motif ombak tajam melambangkan ketabahan, keberanian spiritual, dan perjuangan hidup yang tidak pernah menyerah.',
  },
  {
    name: 'Mega Mendung',
    origin: 'Cirebon, Jawa Barat',
    meaning: 'Motif awan bergulung dengan gradasi warna biru melambangkan kesabaran, ketenangan batin, serta kepala dingin dalam menghadapi cobaan.',
  },
  {
    name: 'Kawung',
    origin: 'Jawa Tengah',
    meaning: 'Motif geometris buah aren empat penjuru melambangkan kesederhanaan, kemurnian hati nurani, keadilan, dan ketulusan.',
  },
  {
    name: 'Buketan Pekalongan',
    origin: 'Pesisir Pekalongan',
    meaning: 'Motif karangan bunga ceria dan burung merak perpaduan budaya pesisir & Eropa, melambangkan keindahan, keceriaan, dan keharmonisan.',
  },
  {
    name: 'Truntum',
    origin: 'Surakarta / Keraton Solo',
    meaning: 'Diciptakan Kanjeng Ratu Kencana, melambangkan cinta kasih yang tulus, setia, dan senantiasa bersemi kembali sepanjang masa.',
  },
];

const Header: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <header className="w-full py-3.5 px-4 md:px-8 bg-stone-900 text-stone-100 sticky top-0 z-40 border-b border-amber-900/40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-white shadow-inner font-serif font-bold text-lg">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif tracking-wide text-stone-100 font-bold">
                  BatikFit
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Virtual Try-On
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Eksplorasi & Pasang Busana Batik Nusantara dengan AI Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 transition-colors"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Filosofi Motif Batik</span>
            </button>
          </div>
        </div>
      </header>

      {/* Motif Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="bg-stone-900 text-stone-100 border border-amber-800/60 rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-700/40 text-amber-300 flex items-center justify-center">
                  ✨
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-300">
                    Makna & Filosofi Motif Batik
                  </h3>
                  <p className="text-xs text-stone-400">Warisan adi luhur kebudayaan Indonesia</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {MOTIF_GUIDE.map((m) => (
                <div key={m.name} className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-amber-300">{m.name}</h4>
                    <span className="text-[11px] text-stone-400 italic">{m.origin}</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">{m.meaning}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 text-center">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 text-xs font-semibold bg-amber-700 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Tutup & Mulai Mencoba
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;