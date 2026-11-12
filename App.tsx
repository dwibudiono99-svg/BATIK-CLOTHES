/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobeModal';
import OutfitStack from './components/OutfitStack';
import { generateVirtualTryOnImage, generatePoseVariation } from './services/geminiService';
import { OutfitLayer, WardrobeItem, GarmentTransform } from './types';
import { ChevronDownIcon, ChevronUpIcon } from './components/icons';
import { defaultWardrobe } from './wardrobe';
import Footer from './components/Footer';
import { getFriendlyErrorMessage } from './lib/utils';
import Spinner from './components/Spinner';

const POSE_INSTRUCTIONS = [
  "Pose tegap formal menghadap depan",
  "Pose 3/4 elegan sedikit menyamping",
  "Pose tangan di saku santai modern",
  "Pose berjalan perlahan ke kamera",
  "Pose profil samping",
  "Pose silang tangan anggun",
];

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};

const App: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(defaultWardrobe);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Dynamic garment tailoring transform (scale, position, blend)
  const [garmentTransform, setGarmentTransform] = useState<GarmentTransform>({
    scale: 1.04,
    x: 0,
    y: 33, // Default position under chin / hijab for bust-up photos
    blendMode: 'normal',
    opacity: 1.0,
  });

  const activeOutfitLayers = useMemo(() => 
    outfitHistory.slice(0, currentOutfitIndex + 1), 
    [outfitHistory, currentOutfitIndex]
  );
  
  const activeGarmentIds = useMemo(() => 
    activeOutfitLayers.map(layer => layer.garment?.id).filter(Boolean) as string[], 
    [activeOutfitLayers]
  );

  const activeGarment = useMemo(() => {
    return activeOutfitLayers[currentOutfitIndex]?.garment ?? null;
  }, [activeOutfitLayers, currentOutfitIndex]);
  
  const displayImageUrl = useMemo(() => {
    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer) return modelImageUrl;

    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    return currentLayer.poseImages[poseInstruction] ?? Object.values(currentLayer.poseImages)[0];
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, modelImageUrl]);

  const availablePoseKeys = useMemo(() => {
    if (outfitHistory.length === 0) return [];
    const currentLayer = outfitHistory[currentOutfitIndex];
    return currentLayer ? Object.keys(currentLayer.poseImages) : [];
  }, [outfitHistory, currentOutfitIndex]);

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    setOutfitHistory([{
      garment: null,
      poseImages: { [POSE_INSTRUCTIONS[0]]: url }
    }]);
    setCurrentOutfitIndex(0);

    // If full-body demo model
    if (url.includes('model-male') || url.includes('model-female')) {
      setGarmentTransform({
        scale: 0.74,
        x: 0,
        y: 22,
        blendMode: 'normal',
        opacity: 1.0,
      });
    } else {
      // Custom user photo (selfie, bust-up, half-body - like image_d51b1d7e.png)
      setGarmentTransform({
        scale: 1.05,
        x: 0,
        y: 33,
        blendMode: 'normal',
        opacity: 1.0,
      });
    }
  };

  const handleStartOver = () => {
    setModelImageUrl(null);
    setOutfitHistory([]);
    setCurrentOutfitIndex(0);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setCurrentPoseIndex(0);
    setIsSheetCollapsed(false);
    setWardrobe(defaultWardrobe);
  };

  const handleGarmentSelect = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem) => {
    if (!modelImageUrl || isLoading) return;

    // Caching check
    const nextLayer = outfitHistory[currentOutfitIndex + 1];
    if (nextLayer && nextLayer.garment?.id === garmentInfo.id) {
      setCurrentOutfitIndex(prev => prev + 1);
      setCurrentPoseIndex(0);
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Menyesuaikan ${garmentInfo.name}...`);

    try {
      const newImageUrl = await generateVirtualTryOnImage(modelImageUrl, garmentFile, garmentTransform);
      const currentPoseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
      
      const newLayer: OutfitLayer = { 
        garment: garmentInfo, 
        poseImages: { [currentPoseInstruction]: newImageUrl },
        transform: garmentTransform,
      };

      setOutfitHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
        return [...newHistory, newLayer];
      });
      setCurrentOutfitIndex(prev => prev + 1);
      
      setWardrobe(prev => {
        if (prev.find(item => item.id === garmentInfo.id)) {
          return prev;
        }
        return [...prev, garmentInfo];
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Gagal memasang busana batik'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [modelImageUrl, isLoading, currentPoseIndex, outfitHistory, currentOutfitIndex, garmentTransform]);

  const handleRemoveLastGarment = () => {
    if (currentOutfitIndex > 0) {
      setCurrentOutfitIndex(prevIndex => prevIndex - 1);
      setCurrentPoseIndex(0);
    }
  };
  
  const handlePoseSelect = useCallback(async (newIndex: number) => {
    if (isLoading || outfitHistory.length === 0 || newIndex === currentPoseIndex) return;
    
    const poseInstruction = POSE_INSTRUCTIONS[newIndex];
    const currentLayer = outfitHistory[currentOutfitIndex];

    if (currentLayer.poseImages[poseInstruction]) {
      setCurrentPoseIndex(newIndex);
      return;
    }

    const baseImageForPoseChange = Object.values(currentLayer.poseImages)[0];
    if (!baseImageForPoseChange) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Mengubah sudut pose ke: "${poseInstruction}"...`);
    
    const prevPoseIndex = currentPoseIndex;
    setCurrentPoseIndex(newIndex);

    try {
      const newImageUrl = await generatePoseVariation(baseImageForPoseChange, poseInstruction);
      setOutfitHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const updatedLayer = newHistory[currentOutfitIndex];
        updatedLayer.poseImages[poseInstruction] = newImageUrl;
        return newHistory;
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Gagal mengubah sudut pose model'));
      setCurrentPoseIndex(prevPoseIndex);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentPoseIndex, outfitHistory, isLoading, currentOutfitIndex]);

  const viewVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <div className="font-sans min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-200">
      <Header />

      <AnimatePresence mode="wait">
        {!modelImageUrl ? (
          <motion.div
            key="start-screen"
            className="flex-grow flex items-center justify-center p-4 pb-20"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <StartScreen onModelFinalized={handleModelFinalized} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            className="relative flex-grow flex flex-col h-[calc(100vh-4rem)] overflow-hidden"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <main className="flex-grow relative flex flex-col md:flex-row overflow-hidden pb-12 sm:pb-8">
              {/* Main fitting canvas */}
              <div className="w-full h-full flex-grow flex items-center justify-center bg-stone-100/70 p-2 sm:p-4 relative">
                <Canvas 
                  displayImageUrl={displayImageUrl}
                  baseImageUrl={modelImageUrl}
                  activeGarment={activeGarment}
                  transform={garmentTransform}
                  onTransformChange={setGarmentTransform}
                  onStartOver={handleStartOver}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  onSelectPose={handlePoseSelect}
                  poseInstructions={POSE_INSTRUCTIONS}
                  currentPoseIndex={currentPoseIndex}
                  availablePoseKeys={availablePoseKeys}
                />
              </div>

              {/* Sidebar Wardrobe & Stack */}
              <aside 
                className={`absolute md:relative md:flex-shrink-0 bottom-0 right-0 h-auto md:h-full w-full md:w-[380px] lg:w-[420px] bg-white/95 backdrop-blur-md flex flex-col border-t md:border-t-0 md:border-l border-stone-200 shadow-xl transition-transform duration-500 ease-in-out z-30 ${
                  isSheetCollapsed ? 'translate-y-[calc(100%-3.5rem)]' : 'translate-y-0'
                } md:translate-y-0`}
              >
                <button 
                  onClick={() => setIsSheetCollapsed(!isSheetCollapsed)} 
                  className="md:hidden w-full h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors"
                  aria-label={isSheetCollapsed ? 'Buka panel busana' : 'Tutup panel busana'}
                >
                  {isSheetCollapsed ? (
                    <ChevronUpIcon className="w-5 h-5 text-stone-600" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-stone-600" />
                  )}
                </button>

                <div className="p-4 sm:p-5 pb-20 overflow-y-auto flex-grow flex flex-col gap-5">
                  {error && (
                    <div className="bg-amber-50 border border-amber-300 text-amber-950 p-3 rounded-xl text-xs relative flex items-start justify-between gap-2 shadow-sm" role="alert">
                      <div>
                        <p className="font-bold text-amber-900 mb-0.5">Pemberitahuan</p>
                        <p className="leading-relaxed text-stone-700">{error}</p>
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="text-stone-400 hover:text-stone-700 p-1 flex-shrink-0"
                        aria-label="Tutup pesan"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <OutfitStack 
                    outfitHistory={activeOutfitLayers}
                    onRemoveLastGarment={handleRemoveLastGarment}
                  />

                  <WardrobePanel
                    onGarmentSelect={handleGarmentSelect}
                    activeGarmentIds={activeGarmentIds}
                    isLoading={isLoading}
                    wardrobe={wardrobe}
                  />
                </div>
              </aside>
            </main>

            {/* Mobile Loading Overlay */}
            <AnimatePresence>
              {isLoading && isMobile && (
                <motion.div
                  className="fixed inset-0 bg-stone-900/70 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs text-center border border-amber-200">
                    <Spinner />
                    <p className="text-sm font-serif font-bold text-stone-900 mt-4">
                      {loadingMessage || 'Menjahit busana batik...'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer isOnDressingScreen={!!modelImageUrl} />
    </div>
  );
};

export default App;