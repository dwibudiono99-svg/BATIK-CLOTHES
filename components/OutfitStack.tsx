/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { Trash2Icon } from './icons';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onRemoveLastGarment: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onRemoveLastGarment }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
        <h2 className="text-base font-serif font-bold tracking-wide text-stone-900">
          Susunan Busana (Outfit Layer)
        </h2>
        <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          {outfitHistory.length} Lapisan
        </span>
      </div>

      <div className="space-y-2">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm transition-all"
          >
            <div className="flex items-center overflow-hidden min-w-0">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 mr-2.5 text-xs font-bold text-stone-700 bg-stone-100 rounded-full border border-stone-200">
                {index + 1}
              </span>
              {layer.garment ? (
                <img
                  src={layer.garment.url}
                  alt={layer.garment.name}
                  className="flex-shrink-0 w-11 h-11 object-cover rounded-lg mr-2.5 border border-stone-100"
                />
              ) : (
                <div className="flex-shrink-0 w-11 h-11 bg-stone-100 rounded-lg mr-2.5 flex items-center justify-center text-xs text-stone-400">
                  👤
                </div>
              )}
              <div className="overflow-hidden min-w-0">
                <p className="font-semibold text-xs text-stone-900 truncate" title={layer.garment ? layer.garment.name : 'Model Awal'}>
                  {layer.garment ? layer.garment.name : 'Model Awal (Polos)'}
                </p>
                {layer.garment?.motif && (
                  <p className="text-[10px] text-amber-800 truncate font-medium">
                    Motif: {layer.garment.motif}
                  </p>
                )}
              </div>
            </div>

            {index > 0 && index === outfitHistory.length - 1 && (
              <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-stone-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 ml-2"
                aria-label={`Lepas ${layer.garment?.name}`}
                title="Lepas busana ini"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {outfitHistory.length === 1 && (
          <p className="text-center text-xs text-stone-500 pt-2 pb-1">
            Belum ada batik terpasang. Pilih salah satu koleksi batik di bawah untuk mulai virtual try-on!
          </p>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;