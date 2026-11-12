/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { WardrobeItem } from './types';

export interface DemoModel {
  id: string;
  name: string;
  gender: 'male' | 'female';
  url: string;
  description: string;
}

export const demoModels: DemoModel[] = [
  {
    id: 'model-male',
    name: 'Model Pria (Arya)',
    gender: 'male',
    url: '/batik/model-male.jpg',
    description: 'Postur tegap pria dengan kaos putih studio',
  },
  {
    id: 'model-female',
    name: 'Model Wanita (Siti)',
    gender: 'female',
    url: '/batik/model-female.jpg',
    description: 'Postur anggun wanita dengan kaos putih studio',
  },
];

// Curated authentic Indonesian Batik wardrobe items
export const defaultWardrobe: WardrobeItem[] = [
  {
    id: 'batik-parang-shirt',
    name: 'Kemeja Batik Parang Rusak',
    motif: 'Parang Rusak',
    category: 'men',
    origin: 'Yogyakarta / Surakarta',
    description: 'Motif agung warisan keraton yang melambangkan ketabahan, kewibawaan, dan semangat yang tak pernah padam.',
    color: 'Cokelat Sogan Klasik',
    url: '/batik/parang-shirt.jpg',
  },
  {
    id: 'batik-megamendung-shirt',
    name: 'Kemeja Batik Mega Mendung',
    motif: 'Mega Mendung',
    category: 'men',
    origin: 'Cirebon, Jawa Barat',
    description: 'Motif awan bergradasi biru royal khas pesisir Cirebon, menyimbolkan ketenangan batin, kelapangan dada, dan kesejukan.',
    color: 'Biru Royal & Cyan',
    url: '/batik/megamendung-shirt.jpg',
  },
  {
    id: 'batik-kawung-shirt',
    name: 'Kemeja Batik Kawung Kasual',
    motif: 'Kawung',
    category: 'men',
    origin: 'Jawa Tengah',
    description: 'Pola geometris buah aren empat penjuru melambangkan kemurnian hati, kesederhanaan, keadilan, dan kerendahan hati.',
    color: 'Krem & Cokelat Karamel',
    url: '/batik/kawung-shirt.jpg',
  },
  {
    id: 'batik-dress-floral',
    name: 'Dress Batik Buketan Pekalongan',
    motif: 'Buketan Flora',
    category: 'women',
    origin: 'Pekalongan, Jawa Tengah',
    description: 'Gaun A-line siluet feminin dengan buket bunga dan burung merak warna terakota hangat serta hijau zamrud.',
    color: 'Terakota & Hijau Zamrud',
    url: '/batik/dress-floral.jpg',
  },
  {
    id: 'batik-kebaya-blouse',
    name: 'Kebaya Kutubaru Brokat Batik',
    motif: 'Kutubaru & Sogan Inset',
    category: 'women',
    origin: 'Solo & Yogyakarta',
    description: 'Perpaduan modern lace brokat anggun dengan panel batik sogan tradisional dan sabuk pinggang keemasan.',
    color: 'Champagne & Sage Green',
    url: '/batik/kebaya-blouse.jpg',
  },
  {
    id: 'batik-outer-kimono',
    name: 'Outer Kimono Batik Indigo',
    motif: 'Parang & Flora Kontemporer',
    category: 'outer',
    origin: 'Pesisir Jawa',
    description: 'Cardigan gaya kimono modern beraksen motif Parang dan sulur bunga indigo. Sangat fleksibel untuk gaya kasual maupun formal.',
    color: 'Biru Indigo & Krem',
    url: '/batik/outer-kimono.jpg',
  },
  {
    id: 'batik-bomber-jacket',
    name: 'Jaket Bomber Batik Truntum Gold',
    motif: 'Truntum & Parang Seling',
    category: 'outer',
    origin: 'Surakarta Kontemporer',
    description: 'Streetwear modern bermotif bintang Truntum berpadu Parang bernuansa emas mewah. Simbol cinta abadi yang terus bersemi.',
    color: 'Hitam & Emas Mewah',
    url: '/batik/bomber-jacket.jpg',
  },
];