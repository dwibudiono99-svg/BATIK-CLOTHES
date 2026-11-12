/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import type { WardrobeItem, BatikCategory } from '../types';
import { UploadCloudIcon, CheckCircleIcon, SparklesIcon } from './icons';

interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
}

const urlToFile = async (url: string, filename: string): Promise<File> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    return new File([blob], filename, { type: mimeType });
  } catch (err) {
    // Canvas fallback if fetch fails
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.setAttribute('crossOrigin', 'anonymous');
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context.'));
        ctx.drawImage(image, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed.'));
          resolve(new File([blob], filename, { type: blob.type || 'image/jpeg' }));
        }, 'image/jpeg');
      };
      image.onerror = (e) => reject(new Error(`Failed to load image from URL: ${e}`));
      image.src = url;
    });
  }
};

const CATEGORIES: { id: BatikCategory; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'men', label: 'Pria' },
  { id: 'women', label: 'Wanita' },
  { id: 'outer', label: 'Outer & Jaket' },
];

const WardrobePanel: React.FC<WardrobePanelProps> = ({
  onGarmentSelect,
  activeGarmentIds,
  isLoading,
  wardrobe,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BatikCategory>('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<WardrobeItem | null>(null);

  const filteredWardrobe = useMemo(() => {
    if (selectedCategory === 'all') return wardrobe;
    return wardrobe.filter((item) => item.category === selectedCategory);
  }, [wardrobe, selectedCategory]);

  const handleGarmentClick = async (item: WardrobeItem) => {
    if (isLoading || activeGarmentIds.includes(item.id)) return;
    setError(null);
    try {
      const safeFilename = `${item.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
      const file = await urlToFile(item.url, safeFilename);
      onGarmentSelect(file, item);
    } catch (err) {
      console.error('Failed to prepare garment file:', err);
      setError('Gagal memuat gambar batik. Silakan coba kembali.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Harap pilih file gambar (JPG, PNG, WebP).');
        return;
      }
      const customGarmentInfo: WardrobeItem = {
        id: `custom-batik-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        motif: 'Koleksi Pribadi',
        category: 'custom',
        description: 'Batik pilihan Anda sendiri.',
        url: URL.createObjectURL(file),
      };
      onGarmentSelect(file, customGarmentInfo);
    }
  };

  return (
    <div className="pt-4 border-t border-stone-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-serif font-bold tracking-wide text-stone-900">
            Koleksi Busana Batik
          </h2>
          <p className="text-xs text-stone-500">Pilih busana untuk dipasang ke model</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg mb-3 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Garments Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredWardrobe.map((item) => {
          const isActive = activeGarmentIds.includes(item.id);
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleGarmentClick(item)}
                onMouseEnter={() => setSelectedDetail(item)}
                disabled={isLoading || isActive}
                className={`w-full aspect-[4/5] border rounded-xl overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-800 text-left relative bg-stone-50 flex flex-col ${
                  isActive
                    ? 'border-amber-700 ring-2 ring-amber-700'
                    : 'border-stone-200 hover:border-amber-600 hover:shadow-md'
                } disabled:cursor-not-allowed`}
                aria-label={`Pilih ${item.name}`}
              >
                <div className="w-full flex-grow relative bg-white overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center text-white">
                      <CheckCircleIcon className="w-7 h-7 text-amber-400 mb-1" />
                      <span className="text-[11px] font-semibold">Sedang Dipakai</span>
                    </div>
                  )}
                </div>

                <div className="p-1.5 bg-white border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-900 truncate" title={item.name}>
                    {item.name}
                  </p>
                  {item.motif && (
                    <span className="inline-block text-[10px] text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded truncate max-w-full">
                      {item.motif}
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}

        {/* Upload Custom Batik Card */}
        <label
          htmlFor="custom-garment-upload"
          className={`aspect-[4/5] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-stone-500 transition-all p-3 text-center ${
            isLoading
              ? 'cursor-not-allowed bg-stone-100 opacity-60'
              : 'hover:border-amber-600 hover:bg-amber-50/40 hover:text-amber-800 cursor-pointer bg-white border-stone-300'
          }`}
        >
          <UploadCloudIcon className="w-6 h-6 mb-1 text-amber-800" />
          <span className="text-xs font-semibold text-stone-800">Unggah Batik</span>
          <span className="text-[10px] text-stone-400 mt-0.5">Baju / Kain Sendiri</span>
          <input
            id="custom-garment-upload"
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Selected Garment Detail Banner */}
      {selectedDetail && (
        <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <span className="truncate">{selectedDetail.name}</span>
          </div>
          {selectedDetail.description && (
            <p className="text-stone-600 text-[11px] mt-1 leading-snug">
              {selectedDetail.description}
            </p>
          )}
          {selectedDetail.origin && (
            <p className="text-[10px] text-amber-800 font-medium mt-1">
              Asal: {selectedDetail.origin}
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-xs mt-3 bg-red-50 p-2 rounded">{error}</p>}
    </div>
  );
};

export default WardrobePanel;