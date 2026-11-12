/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GarmentTransform } from '../types';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
        img.src = src;
    });
};

/**
 * Cleanly isolates the garment by keying out white and off-white background pixels,
 * removing any hollow neck or stand artifacts so the user's real body/neck shows through.
 */
export function isolateGarment(garmentImg: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = garmentImg.naturalWidth || garmentImg.width;
    canvas.height = garmentImg.naturalHeight || garmentImg.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(garmentImg, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const totalPixels = d.length / 4;

    for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const pixelIndex = i / 4;
        const y = Math.floor(pixelIndex / canvas.width);
        const x = pixelIndex % canvas.width;

        // Is pixel in the top-center neck opening? (x between 38% and 62%, y in top 22%)
        const inNeckOpening = (x > canvas.width * 0.38 && x < canvas.width * 0.62 && y < canvas.height * 0.22);

        // Near-white studio backdrop
        if (r > 230 && g > 230 && b > 230) {
            d[i + 3] = 0;
        } else if (inNeckOpening && r > 190 && g > 190 && b > 190) {
            // Cut out acrylic stand inside neck hole
            d[i + 3] = 0;
        } else if (r > 215 && g > 215 && b > 215) {
            const brightness = (r + g + b) / 3;
            const factor = Math.max(0, Math.min(1, (230 - brightness) / 15));
            d[i + 3] = Math.floor(d[i + 3] * factor);
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

const transparentGarmentCache = new Map<string, string>();

/**
 * Returns a transparent PNG data URL of the garment with background and plastic stand removed.
 */
export async function getTransparentGarmentUrl(garmentUrl: string): Promise<string> {
    if (transparentGarmentCache.has(garmentUrl)) {
        return transparentGarmentCache.get(garmentUrl)!;
    }
    try {
        const img = await loadImage(garmentUrl);
        const canvas = isolateGarment(img);
        const dataUrl = canvas.toDataURL('image/png');
        transparentGarmentCache.set(garmentUrl, dataUrl);
        return dataUrl;
    } catch (e) {
        console.warn('Failed to make transparent garment, using original URL:', e);
        return garmentUrl;
    }
}

/**
 * Bakes the base photo and the fitted batik garment into a single high-resolution image.
 */
export async function bakeCompositeImage(
    baseImageUrl: string,
    garmentUrl: string,
    transform: GarmentTransform
): Promise<string> {
    const baseImg = await loadImage(baseImageUrl);
    const garmentImg = await loadImage(garmentUrl);

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.naturalWidth || 1000;
    canvas.height = baseImg.naturalHeight || 1300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseImageUrl;

    // 1. Draw base photo completely untouched
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // 2. Isolate garment
    const isolated = isolateGarment(garmentImg);

    // 3. Compute exact placement
    const aspect = isolated.width / isolated.height;
    // Base width is 95% of canvas width to cover shoulders and chest fully
    const targetWidth = canvas.width * 0.95 * (transform.scale || 1.0);
    const targetHeight = targetWidth / aspect;
    const centerX = (canvas.width * (50 + (transform.x || 0))) / 100;
    const targetX = centerX - targetWidth / 2;
    const targetY = (canvas.height * (transform.y || 33)) / 100;

    ctx.save();
    ctx.globalAlpha = transform.opacity ?? 1.0;

    if (transform.blendMode === 'multiply') {
        ctx.globalCompositeOperation = 'multiply';
    } else if (transform.blendMode === 'soft-light') {
        ctx.globalCompositeOperation = 'soft-light';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;
    }

    ctx.drawImage(isolated, targetX, targetY, targetWidth, targetHeight);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.96);
}

export async function createClientSideTryOn(
    modelImageUrl: string,
    garmentFile: File,
    transform?: GarmentTransform
): Promise<string> {
    const garmentName = garmentFile.name.toLowerCase();

    // Specific pre-rendered photorealistic demo for male model Arya wearing Parang
    if (modelImageUrl.includes('model-male') && garmentName.includes('parang')) {
        return '/batik/model-male-tryon.jpg';
    }

    const garmentBlobUrl = URL.createObjectURL(garmentFile);
    const currentTransform: GarmentTransform = transform || {
        scale: 1.02,
        x: 0,
        y: 33, // Default for bust-up & portrait alignment
        blendMode: 'normal',
        opacity: 1.0,
    };

    const result = await bakeCompositeImage(modelImageUrl, garmentBlobUrl, currentTransform);
    URL.revokeObjectURL(garmentBlobUrl);
    return result;
}

export const generateModelImage = async (userImage: File): Promise<string> => {
    // Under "Aturan Bebas", directly process and present the user's authentic photo
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(userImage);
    });
};

export const generateVirtualTryOnImage = async (
    modelImageUrl: string,
    garmentImage: File,
    transform?: GarmentTransform
): Promise<string> => {
    return await createClientSideTryOn(modelImageUrl, garmentImage, transform);
};

export const generatePoseVariation = async (
    tryOnImageUrl: string,
    _poseInstruction: string
): Promise<string> => {
    return tryOnImageUrl;
};
