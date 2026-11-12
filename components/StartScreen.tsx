/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, SparklesIcon, CameraIcon, CheckCircleIcon } from './icons';
import { Compare } from './ui/compare';
import { generateModelImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '../lib/utils';
import { demoModels, DemoModel } from '../wardrobe';

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<DemoModel | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Silakan pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    setSelectedDemo(null);
    setSelectedFile(file);
    setError(null);
    setGeneratedModelUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUserImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleGenerateAIStudioModel = async () => {
    if (!selectedFile) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateModelImage(selectedFile);
      setGeneratedModelUrl(result);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Gagal menyempurnakan foto model'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChooseDemo = (demo: DemoModel) => {
    setSelectedDemo(demo);
    setUserImageUrl(null);
    setSelectedFile(null);
    setGeneratedModelUrl(demo.url);
    setError(null);
  };

  const reset = () => {
    setUserImageUrl(null);
    setSelectedFile(null);
    setGeneratedModelUrl(null);
    setSelectedDemo(null);
    setIsGenerating(false);
    setError(null);
  };

  const screenVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <AnimatePresence mode="wait">
      {!userImageUrl && !selectedDemo ? (
        <motion.div
          key="uploader"
          className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14 py-4"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Left Column: Headline, Freedom Rules, Upload Controls */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="max-w-xl">
              {/* Freedom Rules Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold tracking-wide mb-4 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Aturan Foto Bebas Aktif (Tanpa Batasan)</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
                Coba Busana Batik dengan Foto Bebas Anda
              </h1>
              
              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                Gunakan <strong>foto apa saja</strong> tanpa syarat rumit: selfie santai, foto setengah badan, seluruh badan, suasana outdoor, duduk, atau gaya kasual. AI Gemini akan menyesuaikan motif batik secara presisi ke bentuk tubuh dan sudut foto Anda.
              </p>

              {/* Aturan Bebas Highlights Card */}
              <div className="mt-5 p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 mb-1.5">
                  <SparklesIcon className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>Kebebasan Foto di BatikFit:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Selfie & Foto Close-Up</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Foto Setengah / Seluruh Badan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Pose Duduk / Berdiri Bebas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Latar Belakang Ruangan / Outdoor</span>
                  </div>
                </div>
              </div>

              {/* Upload & Camera Buttons */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`mt-6 p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-stone-300 bg-white hover:border-amber-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                  {/* File Upload Button */}
                  <label
                    htmlFor="image-upload-start"
                    className="flex-1 w-full relative flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-stone-900 rounded-xl cursor-pointer group hover:bg-amber-800 transition-colors shadow-sm"
                  >
                    <UploadCloudIcon className="w-4 h-4 mr-2" />
                    Pilih Foto Bebas
                  </label>
                  <input
                    id="image-upload-start"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif"
                    onChange={handleFileChange}
                  />

                  {/* Camera / Selfie Button */}
                  <label
                    htmlFor="camera-capture-start"
                    className="flex-1 w-full relative flex items-center justify-center px-5 py-3 text-sm font-semibold text-stone-800 bg-stone-100 border border-stone-300 rounded-xl cursor-pointer group hover:bg-stone-200 transition-colors shadow-sm"
                  >
                    <CameraIcon className="w-4 h-4 mr-2 text-stone-700" />
                    Ambil Foto / Selfie
                  </label>
                  <input
                    id="camera-capture-start"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileChange}
                  />
                </div>

                <p className="text-[11px] text-stone-400">
                  Atau tarik & letakkan (drag and drop) file foto Anda di sini
                </p>
              </div>

              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

              {/* Demo Models Quick Selection */}
              <div className="mt-6 pt-5 border-t border-stone-200 w-full">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">
                    Atau Coba Cepat dengan Model Siap Pakai:
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium">1-Klik Langsung Coba</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {demoModels.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleChooseDemo(demo)}
                      className="group relative flex items-center gap-3 p-2 bg-white rounded-xl border border-stone-200 hover:border-amber-700 hover:shadow-md transition-all text-left"
                    >
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        <img
                          src={demo.url}
                          alt={demo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-amber-800">
                          {demo.name}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {demo.gender === 'male' ? 'Kemeja & Outer' : 'Dress & Kebaya'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Comparison Preview */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
            <div className="relative group">
              <Compare
                firstImage="/batik/model-male.jpg"
                secondImage="/batik/model-male-tryon.jpg"
                slideMode="drag"
                className="w-[280px] h-[400px] sm:w-[320px] sm:h-[460px] lg:w-[380px] lg:h-[540px] rounded-2xl shadow-xl border-4 border-white bg-stone-100"
              />
              <div className="mt-3 text-center">
                <span className="text-xs font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  ↔ Geser slider: Hasil fitting batik pada foto model
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Photo Confirmation & Freedom Options */
        <motion.div
          key="confirm-screen"
          className="w-full max-w-5xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-6"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold mb-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-700" />
                <span>Foto Bebas Siap Digunakan</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 leading-tight">
                {selectedDemo ? selectedDemo.name : 'Foto Pilihan Anda'}
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {selectedDemo
                  ? `Menggunakan ${selectedDemo.name}. Siap untuk mencoba koleksi busana batik.`
                  : 'Anda dapat langsung menggunakan foto asli ini apa adanya, atau menyempurnakannya ke model studio bila diinginkan.'}
              </p>
            </div>
            
            {isGenerating && (
              <div className="flex items-center gap-3 text-sm text-amber-900 font-medium mt-5 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200 w-full">
                <Spinner />
                <span>Menyempurnakan foto ke gaya studio AI...</span>
              </div>
            )}

            {error && (
              <div className="text-center md:text-left text-red-600 max-w-md mt-4 bg-red-50 p-3 rounded-xl border border-red-200">
                <p className="font-semibold text-xs">Pemberitahuan</p>
                <p className="text-xs mb-2">{error}</p>
                <button onClick={reset} className="text-xs font-semibold text-stone-700 hover:underline">
                  Pilih Foto Lain
                </button>
              </div>
            )}
            
            {/* Action Buttons for Aturan Bebas */}
            <div className="flex flex-col gap-3 mt-6 w-full">
              {/* Primary: Use photo directly as is (Aturan Bebas) */}
              <button 
                onClick={() => onModelFinalized(generatedModelUrl || userImageUrl!)}
                disabled={isGenerating}
                className="w-full relative inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-amber-900 rounded-xl cursor-pointer group hover:bg-amber-800 transition-colors shadow-md disabled:opacity-50"
              >
                <span>Gunakan Foto Ini Langsung &rarr;</span>
              </button>

              {/* Optional: Enhance into Studio Model if user uploaded a custom photo */}
              {userImageUrl && !generatedModelUrl && !isGenerating && (
                <button
                  onClick={handleGenerateAIStudioModel}
                  className="w-full inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-stone-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors gap-2"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ubah ke Latar Belakang Studio AI (Opsional)</span>
                </button>
              )}

              {/* Change photo button */}
              <button 
                onClick={reset}
                disabled={isGenerating}
                className="w-full px-5 py-2.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-xl cursor-pointer hover:bg-stone-200 transition-colors border border-stone-200"
              >
                Ganti Foto / Pilih Ulang
              </button>
            </div>
          </div>

          {/* Right Column: Preview chosen photo */}
          <div className="md:w-1/2 w-full flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-stone-200 max-w-sm w-full aspect-[3/4]">
              {userImageUrl && generatedModelUrl ? (
                <Compare
                  firstImage={userImageUrl}
                  secondImage={generatedModelUrl}
                  slideMode="drag"
                  className="w-full h-full rounded-2xl"
                />
              ) : (
                <img
                  src={generatedModelUrl || userImageUrl || ''}
                  alt="Foto Terpilih"
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
              {/* Badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium">
                {generatedModelUrl ? 'Model Studio AI' : 'Foto Asli (Aturan Bebas)'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartScreen;
