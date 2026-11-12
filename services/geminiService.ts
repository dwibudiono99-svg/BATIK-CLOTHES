/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
};

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const anyUrlToPart = async (url: string): Promise<{ inlineData: { mimeType: string; data: string } }> => {
    if (url.startsWith('data:')) {
        return dataUrlToPart(url);
    }
    const response = await fetch(url);
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
    return dataUrlToPart(dataUrl);
};


async function postJson(endpoint: string, body: Record<string, unknown>): Promise<string> {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    if (!data.url) {
        throw new Error("The AI model did not return an image.");
    }
    return data.url;
}

export const generateModelImage = async (userImage: File): Promise<string> => {
    const userImagePart = await fileToPart(userImage);
    return postJson("/api/generate-model", { userImagePart });
};

export const generateVirtualTryOnImage = async (modelImageUrl: string, garmentImage: File): Promise<string> => {
    const modelImagePart = await anyUrlToPart(modelImageUrl);
    const garmentImagePart = await fileToPart(garmentImage);
    return postJson("/api/virtual-try-on", { modelImagePart, garmentImagePart });
};

export const generatePoseVariation = async (tryOnImageUrl: string, poseInstruction: string): Promise<string> => {
    const tryOnImagePart = await anyUrlToPart(tryOnImageUrl);
    return postJson("/api/pose-variation", { tryOnImagePart, poseInstruction });
};
