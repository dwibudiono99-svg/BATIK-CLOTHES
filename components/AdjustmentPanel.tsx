/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GarmentTransform } from '../types';
import { SparklesIcon, RotateCcwIcon } from './icons';

interface AdjustmentPanelProps {
  transform: GarmentTransform;
  onChange: (newTransform: GarmentTransform) => void;
  onReset: () => void;
  onPresetBustUp: () => void;
  onPresetFullBody: () => void;
  garmentName?: string;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({
  transform,
  onChange,
  onReset,
  onPresetBustUp,
  onPresetFullBody,
  garmentName,
}) => {
  const update = (partial: Partial<GarmentTransform>) => {
    onChange({ ...transform, ...partial });
  };

  return (
    <div className="bg-stone-900/95 text-stone-100 rounded-2xl p-3.5 sm:p-4 border border-amber-900/50 shadow-2xl backdrop-blur-md w-full max-w-md mx-auto text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold">
            ✂️
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-100 text-sm">
              Penyesuaian Pas Badan (Tailoring)
            </h3>
            {garmentName && (
              <p className="text-[10px] text-amber-300 truncate max-w-[200px]">
                {garmentName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-white px-2 py-1 rounded-md hover:bg-stone-800 transition-colors"
          title="Kembalikan posisi standar"
        >
          <RotateCcwIcon className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Presets for Bust-up vs Full-body */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={onPresetBustUp}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-950/70 border border-amber-700/60 hover:bg-amber-900 text-amber-200 font-semibold text-[11px] transition-all"
        >
          <span>👤 Pas Foto Setengah Badan / Selfie</span>
        </button>
        <button
          onClick={onPresetFullBody}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-stone-800/80 border border-stone-700 hover:bg-stone-700 text-stone-300 font-semibold text-[11px] transition-all"
        >
          <span>🚶 Pas Foto Seluruh Badan</span>
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {/* Scale (Lebar Bahu & Ukuran) */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-300 font-medium">Lebar Bahu / Ukuran:</span>
            <span className="text-amber-400 font-bold">{Math.round(transform.scale * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ scale: Math.max(0.6, transform.scale - 0.04) })}
              className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
            >
              -
            </button>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.01"
              value={transform.scale}
              onChange={(e) => update({ scale: parseFloat(e.target.value) })}
              className="flex-grow accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => update({ scale: Math.min(1.4, transform.scale + 0.04) })}
              className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Y Position (Tinggi Kerah / Naik-Turun) */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-300 font-medium">Posisi Kerah / Vertikal:</span>
            <span className="text-amber-400 font-bold">{Math.round(transform.y)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ y: Math.max(10, transform.y - 2) })}
              className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
              title="Naikkan kerah"
            >
              ▲
            </button>
            <input
              type="range"
              min="10"
              max="65"
              step="0.5"
              value={transform.y}
              onChange={(e) => update({ y: parseFloat(e.target.value) })}
              className="flex-grow accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => update({ y: Math.min(65, transform.y + 2) })}
              className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
              title="Turunkan kerah"
            >
              ▼
            </button>
          </div>
        </div>

        {/* X Position (Posisi Samping Kiri-Kanan) */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-300 font-medium">Posisi Horisontal:</span>
            <span className="text-amber-400 font-bold">{Math.round(transform.x)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update({ x: Math.max(-25, transform.x - 1.5) })}
              className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
              title="Geser ke kiri"
            >
              ◀
            </button>
            <input
              type="range"
              min="-25"
              max="25"
              step="0.5"
              value={transform.x}
              onChange={(e) => update({ x: parseFloat(e.target.value) })}
              className="flex-grow accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => update({ x: Math.min(25, transform.x + 1.5) })}
              className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
              title="Geser ke kanan"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Blend Mode */}
        <div>
          <span className="text-stone-300 font-medium text-[11px] block mb-1.5">
            Gaya Bauran Busana (Blend Mode):
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => update({ blendMode: 'normal' })}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                transform.blendMode === 'normal'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-800'
              }`}
            >
              Pas Badan Nyata
            </button>
            <button
              onClick={() => update({ blendMode: 'multiply' })}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                transform.blendMode === 'multiply'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-800'
              }`}
            >
              Baur Lipatan Baju
            </button>
            <button
              onClick={() => update({ blendMode: 'soft-light' })}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                transform.blendMode === 'soft-light'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-800'
              }`}
            >
              Baur Halus
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
        <span>💡 Tips: Anda juga dapat menyeret (drag) baju langsung di layar!</span>
      </div>
    </div>
  );
};

export default AdjustmentPanel;
