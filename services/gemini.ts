
import { GoogleGenAI, Type } from "@google/genai";
import { WasteAnalysis, HazardReport, WasteType } from "../types";

/**
 * Converts coordinates to a human-readable address using Gemini + Google Search.
 */
export const getAddressFromCoords = async (lat: number, lng: number): Promise<{address: string, url?: string, title?: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Identify the physical street address and city in South Africa for these GPS coordinates: Latitude ${lat}, Longitude ${lng}. 
    Return ONLY the address in the format 'Street Name, City'. Do not include coordinates or extra text.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const address = response.text?.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const chunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web;

  return { 
    address, 
    url: chunk?.uri,
    title: chunk?.title
  };
};

/**
 * Analyzes multiple frames from a video recording for more accurate waste detection.
 */
export const analyzeVideoWaste = async (frames: string[]): Promise<WasteAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contentParts = frames.map(frame => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: frame,
    },
  }));

  contentParts.push({
    text: `Analyze these video frames for recyclables. 
    STRICT RULE: Determine if they contain recyclable goods (PLASTIC, GLASS, METAL, PAPER, or ELECTRONIC).
    Estimate total weight (kg) and total value (ZAR).
    Return ONLY valid JSON format.`,
  } as any);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: contentParts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['PLASTIC', 'GLASS', 'METAL', 'PAPER', 'ELECTRONIC', 'NON_RECYCLABLE', 'UNKNOWN'] },
          confidence: { type: Type.NUMBER },
          estimatedWeight: { type: Type.NUMBER },
          estimatedValue: { type: Type.NUMBER },
          itemsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["type", "estimatedWeight", "estimatedValue", "itemsDetected"]
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as WasteAnalysis;
  } catch (error) {
    throw new Error("Video analysis failed. Please ensure the footage is clear.");
  }
};

/**
 * Generates an 'Impact Video' using the Veo model.
 */
export const generateImpactVideo = async (wasteType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `A high-quality 1080p video showing a beautiful forest where ${wasteType} products are magically transforming into colorful playground equipment for children. Hopeful, cinematic atmosphere.`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};

export const analyzeWasteImage = async (base64Image: string): Promise<WasteAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `Analyze this image for recyclables. Determine if the image contains recyclable goods (PLASTIC, GLASS, METAL, PAPER, or ELECTRONIC). 
          Estimate weight (kg) and ZAR value (Cans R12/kg, PET R5/kg, Paper R2/kg). 
          Return ONLY valid JSON format.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['PLASTIC', 'GLASS', 'METAL', 'PAPER', 'ELECTRONIC', 'NON_RECYCLABLE', 'UNKNOWN'] },
          confidence: { type: Type.NUMBER },
          estimatedWeight: { type: Type.NUMBER },
          estimatedValue: { type: Type.NUMBER },
          itemsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["type", "estimatedWeight", "estimatedValue", "itemsDetected"]
      },
    },
  });

  return JSON.parse(response.text || "{}") as WasteAnalysis;
};

export const analyzeHazardImage = async (base64Image: string, voiceTranscript?: string): Promise<Partial<HazardReport>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { 
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: `Identify this environmental hazard. Context: "${voiceTranscript || ''}". Return JSON with severity, description, and referenceNumber.` }
      ] 
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          description: { type: Type.STRING },
          referenceNumber: { type: Type.STRING },
          acknowledgmentMessage: { type: Type.STRING }
        },
        required: ["severity", "description", "referenceNumber"]
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Transcribes audio using Gemini's flash model.
 */
export const transcribeAudio = async (base64Audio: string, sampleRate: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: `audio/pcm;rate=${sampleRate}`,
            data: base64Audio,
          },
        },
        { text: "Transcribe this audio recording precisely. It is a description of an environmental hazard. Return only the spoken text." }
      ],
    },
  });

  return response.text?.trim() || "";
};

export const findRecyclingLocations = async (location: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List 4 real recycling drop-off locations near ${location}, South Africa. Return JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            address: { type: Type.STRING },
            phone: { type: Type.STRING },
            type: { type: Type.ARRAY, items: { type: Type.STRING } },
            distance: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
