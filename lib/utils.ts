/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(error: unknown, context: string): string {
  let rawMessage = 'Terjadi kesalahan sistem.';
  if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'string') {
    rawMessage = error;
  } else if (error) {
    rawMessage = String(error);
  }

  // Quota exceeded / 429 rate limit
  if (
    rawMessage.includes("429") ||
    rawMessage.includes("quota") ||
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.includes("rate-limits")
  ) {
    return `Kuota API Gemini tercapai (429 Rate Limit). Model pemrosesan gambar memerlukan API Key dengan penagihan aktif (Settings > Secrets). Silakan coba lagi sebentar atau gunakan model demo.`;
  }

  // Check for specific unsupported MIME type error from Gemini API
  if (rawMessage.includes("Unsupported MIME type")) {
    return `Format file tidak didukung. Harap gunakan format gambar standar seperti JPG, PNG, atau WEBP.`;
  }

  // Missing API Key
  if (rawMessage.includes("API key is not configured") || rawMessage.includes("GEMINI_API_KEY")) {
    return `Kunci API Gemini belum dikonfigurasi. Harap tambahkan GEMINI_API_KEY pada menu Settings > Secrets.`;
  }

  // Safety filter or blocked
  if (rawMessage.includes("blocked") || rawMessage.includes("safety")) {
    return `Gambar tidak dapat diproses karena filter keamanan sistem. Silakan coba dengan foto busana atau pose lain.`;
  }
  
  return `${context}: ${rawMessage.length > 120 ? rawMessage.slice(0, 120) + '...' : rawMessage}`;
}