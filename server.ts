/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Active image generation and editing model according to @google/genai guidelines
const model = "gemini-3.1-flash-lite-image";

function sanitizeInlineImagePart(part: any): { inlineData: { mimeType: string; data: string } } | null {
  const mimeType = typeof part?.inlineData?.mimeType === "string" ? part.inlineData.mimeType.trim() : "";
  const data = typeof part?.inlineData?.data === "string" ? part.inlineData.data.trim() : "";
  if (!/^image\/(?:png|jpeg|jpg|webp|gif|avif|heic|heif)$/i.test(mimeType)) return null;
  if (!data || data.length > 25 * 1024 * 1024 || !/^[A-Za-z0-9+/=\s]+$/.test(data)) return null;
  return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
  if (response.promptFeedback?.blockReason) {
    const { blockReason, blockReasonMessage } = response.promptFeedback;
    throw new Error(`Permintaan diblokir oleh sistem: ${blockReason}. ${blockReasonMessage || ""}`);
  }

  for (const candidate of response.candidates ?? []) {
    const imagePart = candidate.content?.parts?.find((part) => part.inlineData);
    if (imagePart?.inlineData) {
      const { mimeType, data } = imagePart.inlineData;
      return `data:${mimeType};base64,${data}`;
    }
  }

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    throw new Error(`Pemrosesan gambar berhenti (${finishReason}). Harap coba foto lain.`);
  }

  const textFeedback = response.text?.trim();
  throw new Error(
    textFeedback
      ? `Model menjawab dalam teks: "${textFeedback}"`
      : "Model AI tidak menghasilkan gambar. Harap coba dengan foto yang berbeda."
  );
};

function handleApiError(error: any, res: express.Response, fallbackUrl?: string) {
  const errMsg = error?.message || String(error);

  const isQuota =
    error?.status === "RESOURCE_EXHAUSTED" ||
    error?.code === 429 ||
    errMsg.includes("429") ||
    errMsg.includes("Quota exceeded") ||
    errMsg.includes("RESOURCE_EXHAUSTED");

  if (isQuota) {
    console.log("[Backend] Info: Free Tier image quota limit reached. Using try-on fallback.");
    return res.json({
      url: fallbackUrl || "/batik/model-male-tryon.jpg",
      isFallback: true,
    });
  }

  console.warn("[Backend] Warning:", errMsg);
  return res.json({
    url: fallbackUrl || "/batik/model-male-tryon.jpg",
    isFallback: true,
  });
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 2);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-model", async (req, res): Promise<any> => {
    try {
      const userImagePart = sanitizeInlineImagePart(req.body?.userImagePart);
      if (!userImagePart) {
        return res.status(400).json({ error: "Missing or invalid userImagePart." });
      }

      const ai = getGeminiClient();
      const prompt =
        "You are an expert fashion photographer AI. You will be given a user photo (which can be any style: selfie, close-up, half-body, casual, seated, outdoor, or full-body — 'aturan bebas'). Present the person as an elegant fashion model ready for trying on Indonesian Batik garments, preserving their true identity, facial features, skin tone, hair, and body shape. The final image must be photorealistic. Return ONLY the final image.";
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [userImagePart, { text: prompt }] },
      });
      return res.json({ url: handleApiResponse(response) });
    } catch (error: any) {
      return handleApiError(error, res);
    }
  });

  app.post("/api/virtual-try-on", async (req, res): Promise<any> => {
    try {
      const modelImagePart = sanitizeInlineImagePart(req.body?.modelImagePart);
      const garmentImagePart = sanitizeInlineImagePart(req.body?.garmentImagePart);
      if (!modelImagePart || !garmentImagePart) {
        return res.status(400).json({ error: "Missing or invalid modelImagePart or garmentImagePart." });
      }

      const ai = getGeminiClient();
      const prompt = `You are an expert virtual try-on AI specializing in fashion and authentic Indonesian Batik garments. You will be given a 'model image' and a 'garment image' (such as an Indonesian Batik shirt, kebaya, batik dress, or outer jacket featuring motifs like Parang, Mega Mendung, Kawung, Sekar Jagad, or Buketan).
Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Crucial Rules (Aturan Bebas / Total Photo Flexibility):**
1. **Any Photo Angle & Framing (Aturan Bebas):** The 'model image' can be ANY kind of photo with NO strict constraints — it may be a selfie, close-up, half-body portrait, full-body shot, seated, candid pose, casual clothing, indoor or outdoor setting. Realistically fit and drape the batik garment onto whatever portion of the person's upper body / torso is visible in the frame.
2. **Garment & Motif Fidelity:** Faithfully replicate the exact batik pattern, motif layout (e.g., diagonal parang stripes, megamendung cloud gradients, geometric kawung repeats, floral accents), colors, collar style, and fabric texture from the 'garment image'. The intricate batik motifs must remain crisp, clear, and naturally draped over the body.
3. **Complete Garment Replacement:** Completely REMOVE and REPLACE whatever clothing item the person is wearing with the new batik garment. No parts of the original collar, neck, inner shirt, or cuffs should bleed through.
4. **Preserve Person, Pose, and Environment:** The person's identity, facial expression, skin tone, hair, natural pose, body angle, and exact surrounding background from the 'model image' MUST remain completely unchanged and natural.
5. **Natural Fit & Lighting:** Fit the batik garment realistically onto the person with natural fabric folds, seam lines, buttons, and shadows matching the existing scene lighting and body contour.
6. **Output:** Return ONLY the final, photorealistic image. Do not include any text.`;

      const response = await ai.models.generateContent({
        model,
        contents: { parts: [modelImagePart, garmentImagePart, { text: prompt }] },
      });
      return res.json({ url: handleApiResponse(response) });
    } catch (error: any) {
      return handleApiError(error, res, "/batik/model-male-tryon.jpg");
    }
  });

  app.post("/api/pose-variation", async (req, res): Promise<any> => {
    try {
      const tryOnImagePart = sanitizeInlineImagePart(req.body?.tryOnImagePart);
      const poseInstruction = req.body?.poseInstruction;
      if (!tryOnImagePart || typeof poseInstruction !== "string" || !poseInstruction.trim()) {
        return res.status(400).json({ error: "Missing or invalid tryOnImagePart or poseInstruction." });
      }

      const ai = getGeminiClient();
      const prompt = `You are an expert fashion photographer AI. Take this image and regenerate it from a different perspective. The person, their batik clothing (including exact motifs, colors, and patterns), and background style must remain identical. The new perspective should be: "${poseInstruction}". Return ONLY the final image.`;
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [tryOnImagePart, { text: prompt }] },
      });
      return res.json({ url: handleApiResponse(response) });
    } catch (error: any) {
      return handleApiError(error, res);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(["/server.cjs", "/server.cjs.map"], (_req: any, res: any) => res.status(404).end());
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
