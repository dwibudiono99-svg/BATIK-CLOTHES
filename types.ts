/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type BatikCategory = 'all' | 'men' | 'women' | 'outer';

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
  motif?: string;
  category?: 'men' | 'women' | 'outer' | 'custom';
  description?: string;
  origin?: string;
  color?: string;
}

export interface GarmentTransform {
  scale: number;
  x: number;
  y: number;
  blendMode: 'normal' | 'multiply' | 'soft-light';
  opacity: number;
}

export interface OutfitLayer {
  garment: WardrobeItem | null; // null represents the base model layer
  poseImages: Record<string, string>; // Maps pose instruction to image URL
  transform?: GarmentTransform;
}



