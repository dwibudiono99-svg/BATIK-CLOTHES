/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
}

const Canvas: React.FC<CanvasProps> = ({
  displayImageUrl,
  onStartOver,
  isLoading,
  loadingMessage,
  onSelectPose,
  poseInstructions,
  currentPoseIndex,
  availablePoseKeys,
}) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);

  const handleDownload = () => {
    if (!displayImageUrl) return;
    const link = document.createElement('a');
    link.href = displayImageUrl;
    link.download = `batikfit-tryon-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePreviousPose = () => {
    if (isLoading || availablePoseKeys.length <= 1) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);
    
    if (currentIndexInAvailable === -1) {
      onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length);
      return;
    }

    const prevIndexInAvailable = (currentIndexInAvailable - 1 + availablePoseKeys.length) % availablePoseKeys.length;
    const prevPoseInstruction = availablePoseKeys[prevIndexInAvailable];
    const newGlobalPoseIndex = poseInstructions.indexOf(prevPoseInstruction);
    
    if (newGlobalPoseIndex !== -1) {
      onSelectPose(newGlobalPoseIndex);
    }
  };

  const handleNextPose = () => {
    if (isLoading) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);

    if (currentIndexInAvailable === -1 || availablePoseKeys.length === 0) {
      onSelectPose((currentPoseIndex + 1) % poseInstructions.length);
      return;
    }
    
    const nextIndexInAvailable = currentIndexInAvailable + 1;
    if (nextIndexInAvailable < availablePoseKeys.length) {
      const nextPoseInstruction = availablePoseKeys[nextIndexInAvailable];
      const newGlobalPoseIndex = poseInstructions.indexOf(nextPoseInstruction);
      if (newGlobalPoseIndex !== -1) {
        onSelectPose(newGlobalPoseIndex);
      }
    } else {
      const newGlobalPoseIndex = (currentPoseIndex + 1) % poseInstructions.length;
      onSelectPose(newGlobalPoseIndex);
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative animate-zoom-in group">
      {/* Top Left: Start Over */}
      <button 
        onClick={onStartOver}
        className="absolute top-4 left-4 z-30 flex items-center justify-center bg-white/80 border border-stone-300 text-stone-800 font-semibold py-2 px-3.5 rounded-full transition-all duration-200 hover:bg-white hover:border-amber-700 active:scale-95 text-xs backdrop-blur-md shadow-sm"
        title="Ganti Model / Mulai Ulang"
      >
        <RotateCcwIcon className="w-3.5 h-3.5 mr-1.5 text-stone-700" />
        <span>Ganti Model</span>
      </button>

      {/* Top Right: Download */}
      {displayImageUrl && (
        <button 
          onClick={handleDownload}
          disabled={isLoading}
          className="absolute top-4 right-4 z-30 flex items-center justify-center bg-white/80 border border-stone-300 text-stone-800 font-semibold py-2 px-3.5 rounded-full transition-all duration-200 hover:bg-white hover:border-amber-700 active:scale-95 text-xs backdrop-blur-md shadow-sm disabled:opacity-50"
          title="Unduh Hasil Fitting Batik"
        >
          <DownloadIcon className="w-3.5 h-3.5 mr-1.5 text-amber-800" />
          <span>Simpan Foto</span>
        </button>
      )}

      {/* Image Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        {displayImageUrl ? (
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img
              key={displayImageUrl}
              src={displayImageUrl}
              alt="Virtual try-on model"
              className="max-w-full max-h-[75vh] object-contain transition-opacity duration-500 animate-fade-in rounded-2xl shadow-xl border-4 border-white bg-stone-100"
            />
            {/* Elegant watermark badge */}
            <div className="absolute bottom-3 left-4 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-stone-200 tracking-wider uppercase font-semibold">
              BatikFit AI
            </div>
          </div>
        ) : (
          <div className="w-[360px] h-[520px] bg-stone-100 border border-stone-200 rounded-2xl flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-sm font-serif text-stone-600 mt-4">Memuat Model...</p>
          </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs text-center border border-amber-200">
                <Spinner />
                <p className="text-base font-serif font-bold text-stone-900 mt-4">
                  Sedang Menjahit Virtual...
                </p>
                {loadingMessage && (
                  <p className="text-xs text-amber-800 font-medium mt-2">
                    {loadingMessage}
                  </p>
                )}
                <p className="text-[11px] text-stone-400 mt-2">
                  Gemini sedang menyesuaikan motif dan lekukan kain batik ke tubuh Anda.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pose Controls */}
      {displayImageUrl && !isLoading && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          onMouseEnter={() => setIsPoseMenuOpen(true)}
          onMouseLeave={() => setIsPoseMenuOpen(false)}
        >
          {/* Pose popover menu */}
          <AnimatePresence>
            {isPoseMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-full mb-3 w-72 bg-white/95 backdrop-blur-lg rounded-2xl p-3 border border-stone-300 shadow-xl"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Pilih Sudut / Pose:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {poseInstructions.map((pose, index) => (
                    <button
                      key={pose}
                      onClick={() => onSelectPose(index)}
                      disabled={isLoading || index === currentPoseIndex}
                      className="w-full text-left text-xs font-medium text-stone-800 p-2 rounded-lg hover:bg-amber-50 disabled:bg-amber-100/70 disabled:text-amber-950 disabled:font-bold disabled:cursor-not-allowed transition-colors truncate"
                    >
                      {pose}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center justify-center gap-2 bg-stone-900/90 text-white backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-amber-900/40">
            <button 
              onClick={handlePreviousPose}
              aria-label="Pose sebelumnya"
              className="p-1.5 rounded-full hover:bg-stone-800 active:scale-90 transition-all disabled:opacity-40"
              disabled={isLoading}
            >
              <ChevronLeftIcon className="w-4 h-4 text-stone-200" />
            </button>
            <span
              className="text-xs font-semibold text-stone-100 w-44 text-center truncate"
              title={poseInstructions[currentPoseIndex]}
            >
              {poseInstructions[currentPoseIndex]}
            </span>
            <button 
              onClick={handleNextPose}
              aria-label="Pose berikutnya"
              className="p-1.5 rounded-full hover:bg-stone-800 active:scale-90 transition-all disabled:opacity-40"
              disabled={isLoading}
            >
              <ChevronRightIcon className="w-4 h-4 text-stone-200" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;