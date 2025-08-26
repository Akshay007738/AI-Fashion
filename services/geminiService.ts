import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { Gender, Occasion } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const styleAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    styleAnalysis: {
      type: Type.STRING,
      description: "A brief, positive, and encouraging analysis of the person's clothing style, color palette, and overall look."
    },
    recommendations: {
        type: Type.ARRAY,
        description: "An array of 3 to 5 complementary fashion item recommendations to complete the outfit. Items can include pants, shoes, watches, or chains. If pants are a suitable recommendation, provide at least two different options.",
        items: {
            type: Type.OBJECT,
            properties: {
                itemName: {
                    type: Type.STRING,
                    description: "The name of a single fashion item (e.g., 'a black leather jacket', 'a pair of white canvas sneakers', 'a silver chain necklace'). Be specific."
                },
                category: {
                    type: Type.STRING,
                    description: "The category of the item (e.g., 'Pants', 'Shoes', 'Watch', 'Accessory')."
                },
                reason: {
                    type: Type.STRING,
                    description: "A short, compelling reason why this item is a good recommendation, explaining how it enhances their current style."
                }
            },
            required: ["itemName", "category", "reason"]
        }
    }
  },
  required: ["styleAnalysis", "recommendations"]
};


export const analyzeClothingAndRecommend = async (base64Image: string, gender: Gender, occasion: Occasion): Promise<AnalysisResult> => {
  if (!API_KEY) throw new Error("API Key is not configured.");

  const imagePart = {
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: 'image/jpeg',
    },
  };

  const textPart = {
    text: `Analyze the person in this image. They have identified as ${gender}. Their current clothing style is visible. Based on this, recommend 3 to 5 complementary fashion items to complete their outfit for a "${occasion}" occasion. Recommendations can include items like pants, shoes, watches, or chains. If you recommend pants, please provide at least two different pant options (e.g., 'dark wash slim-fit jeans' and 'khaki chino pants'). For each item, provide its name, category, and a reason for the recommendation.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: styleAnalysisSchema,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as AnalysisResult;
};

export const generateRecommendedItemImage = async (itemName: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is not configured.");
  
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: `A high-quality, professional e-commerce studio photograph of a single "${itemName}" on a plain, light gray background. The item should be centered and well-lit. Minimalist style. No people or other objects.`,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  }
  throw new Error("Failed to generate an image for the recommended item.");
};