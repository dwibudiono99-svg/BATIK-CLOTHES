/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, SparklesIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { WardrobeItem, GarmentTransform } from '../types';
import AdjustmentPanel from './AdjustmentPanel';
import { getTransparentGarmentUrl, bakeCompositeImage } from '../services/geminiService';

interface CanvasProps {
  displayImageUrl: string | null;
  baseImageUrl: string | null;
  activeGarment: WardrobeItem | null;
  transform: GarmentTransform;
  onTransformChange: (t: GarmentTransform) => void;
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
  baseImageUrl,
  activeGarment,
  transform,
  onTransformChange,
  onStartOver,
  isLoading,
  loadingMessage,
  onSelectPose,
  poseInstructions,
  currentPoseIndex,
  availablePoseKeys,
}) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);
  const [transparentGarmentUrl, setTransparentGarmentUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load transparent cutout of active garment whenever it changes
  useEffect(() => {
    let isCancelled = false;
    if (activeGarment?.url) {
      getTransparentGarmentUrl(activeGarment.url).then((url) => {
        if (!isCancelled) {
          setTransparentGarmentUrl(url);
        }
      });
    } else {
      setTransparentGarmentUrl(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [activeGarment]);

  // Pointer drag events for direct on-screen garment moving
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeGarment) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: transform.x,
      startY: transform.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;

    const newX = Math.max(-30, Math.min(30, dragStartRef.current.startX + deltaXPercent));
    const newY = Math.max(10, Math.min(70, dragStartRef.current.startY + deltaYPercent));

    onTransformChange({
      ...transform,
      x: Number(newX.toFixed(1)),
      y: Number(newY.toFixed(1)),
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleDownload = async () => {
    const base = baseImageUrl || displayImageUrl;
    if (!base) return;

    setIsDownloading(true);
    try {
      let finalUrl = base;
      if (activeGarment?.url) {
        finalUrl = await bakeCompositeImage(base, activeGarment.url, transform);
      }
      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `batikfit-${activeGarment?.id || 'model'}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setIsDownloading(false);
    }
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

  const activePhoto = baseImageUrl || displayImageUrl;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 relative animate-zoom-in group select-none">
      {/* Top Left: Start Over */}
      <button 
        onClick={onStartOver}
        className="absolute top-4 left-4 z-30 flex items-center justify-center bg-white/80 border border-stone-300 text-stone-800 font-semibold py-2 px-3.5 rounded-full transition-all duration-200 hover:bg-white hover:border-amber-700 active:scale-95 text-xs backdrop-blur-md shadow-sm"
        title="Ganti Model / Mulai Ulang"
      >
        <RotateCcwIcon className="w-3.5 h-3.5 mr-1.5 text-stone-700" />
        <span>Ganti Model</span>
      </button>

      {/* Top Right Controls: Tailoring Button & Download Button */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {activeGarment && (
          <button 
            onClick={() => setShowAdjustPanel(!showAdjustPanel)}
            className={`flex items-center justify-center font-semibold py-2 px-3.5 rounded-full transition-all duration-200 active:scale-95 text-xs backdrop-blur-md shadow-sm ${
              showAdjustPanel
                ? 'bg-amber-900 text-white border border-amber-700'
                : 'bg-white/80 border border-stone-300 text-stone-800 hover:bg-white hover:border-amber-700'
            }`}
            title="Buka panel penyesuaian ukuran & posisi batik"
          >
            <SparklesIcon className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            <span>{showAdjustPanel ? 'Tutup Pas Badan' : 'Atur Pas Badan'}</span>
          </button>
        )}

        {activePhoto && (
          <button 
            onClick={handleDownload}
            disabled={isLoading || isDownloading}
            className="flex items-center justify-center bg-amber-900 text-white font-semibold py-2 px-3.5 rounded-full transition-all duration-200 hover:bg-amber-800 active:scale-95 text-xs backdrop-blur-md shadow-sm disabled:opacity-50"
            title="Unduh Hasil Fitting Batik"
          >
            <DownloadIcon className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            <span>{isDownloading ? 'Menyimpan...' : 'Simpan Foto'}</span>
          </button>
        )}
      </div>

      {/* Main Fitting Canvas Area */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {activePhoto ? (
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`relative max-w-full max-h-[72vh] flex items-center justify-center rounded-2xl shadow-2xl border-4 border-white bg-stone-100 overflow-hidden ${
              activeGarment ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
          >
            {/* Layer 1: Base User/Model Photo (Untouched) */}
            <img
              key={activePhoto}
              src={activePhoto}
              alt="Model Virtual Try-On"
              className="max-w-full max-h-[72vh] object-contain block pointer-events-none select-none transition-opacity duration-300"
            />

            {/* Layer 2: Fitted Transparent Batik Garment */}
            {activeGarment && transparentGarmentUrl && (
              <img
                src={transparentGarmentUrl}
                alt={activeGarment.name}
                className="absolute pointer-events-none select-none transition-transform duration-75"
                style={{
                  top: `${transform.y}%`,
                  left: `${50 + transform.x}%`,
                  transform: `translate(-50%, 0) scale(${transform.scale})`,
                  width: '95%',
                  mixBlendMode: transform.blendMode === 'multiply' ? 'multiply' : transform.blendMode === 'soft-light' ? 'soft-light' : 'normal',
                  filter: transform.blendMode === 'normal' ? 'drop-shadow(0 6px 14px rgba(0,0,0,0.24))' : 'none',
                  opacity: transform.opacity ?? 1.0,
                }}
              />
            )}

            {/* Guidance Badge on Photo */}
            {activeGarment && (
              <div className="absolute top-3 left-3 bg-stone-900/75 text-stone-200 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Geser baju langsung di layar atau gunakan tombol Atur Pas Badan</span>
              </div>
            )}

            {/* Watermark Badge */}
            <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-stone-200 tracking-wider uppercase font-semibold pointer-events-none">
              BatikFit AI
            </div>
          </div>
        ) : (
          <div className="w-[360px] h-[520px] bg-stone-100 border border-stone-200 rounded-2xl flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-sm font-serif text-stone-600 mt-4">Memuat Model...</p>
          </div>
        )}

        {/* Loading Overlay */}
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
                  Menjahit Virtual...
                </p>
                {loadingMessage && (
                  <p className="text-xs text-amber-800 font-medium mt-2">
                    {loadingMessage}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Adjustment Panel */}
      <AnimatePresence>
        {showAdjustPanel && activeGarment && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 sm:bottom-20 z-40 w-full max-w-md px-3"
          >
            <AdjustmentPanel
              transform={transform}
              onChange={onTransformChange}
              garmentName={activeGarment.name}
              onReset={() => onTransformChange({ scale: 1.0, x: 0, y: 34, blendMode: 'normal', opacity: 1.0 })}
              onPresetBustUp={() => onTransformChange({ scale: 1.05, x: 0, y: 33, blendMode: 'normal', opacity: 1.0 })}
              onPresetFullBody={() => onTransformChange({ scale: 0.74, x: 0, y: 22, blendMode: 'normal', opacity: 1.0 })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pose Controls */}
      {activePhoto && !isLoading && !showAdjustPanel && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          onMouseEnter={() => setIsPoseMenuOpen(true)}
          onMouseLeave={() => setIsPoseMenuOpen(false)}
        >
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