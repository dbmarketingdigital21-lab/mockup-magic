
import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate mockup. Reason: ${errorMessage}`);
  }
};

export const editImage = async (
  baseImage: ImageFile,
  prompt: string,
  overlayImage?: ImageFile
): Promise<string> => {
  try {
    const parts: any[] = [
      {
        inlineData: {
          data: baseImage.base64,
          mimeType: baseImage.mimeType,
        },
      },
    ];

    let fullPrompt = prompt;

    if (overlayImage) {
      parts.push({
        inlineData: {
          data: overlayImage.base64,
          mimeType: overlayImage.mimeType,
        },
      });
      // A more explicit prompt for the model when an overlay image is provided
      fullPrompt = `Take the first image provided (the base image) and apply the second image (the overlay) onto it. Follow this instruction for the placement and style: "${prompt}". The result should be a single, realistic, high-quality image.`;
    }

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No edited image was returned from the model.");
  } catch (error) {
    console.error("Error editing image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to edit image. Reason: ${errorMessage}`);
  }
};
