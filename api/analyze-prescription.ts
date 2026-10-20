import { GoogleGenAI, Type } from '@google/genai';

export interface ExtractedPrescriptionPayload {
  doctorName: string;
  clinicName: string;
  patientName: string;
  date: string;
  rawOcrLines: string[];
}

export async function analyzePrescriptionWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedPrescriptionPayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64
          }
        },
        {
          text: `You are an expert medical OCR system for RxLens. Read this handwritten or printed prescription image carefully.
Extract:
1. doctorName (or "Prescribing Physician" if unreadable)
2. clinicName (or "Outpatient Clinic" if unreadable)
3. patientName (or "Patient" if unreadable)
4. date (or today's date if unreadable)
5. rawOcrLines: An array of strings, one per prescribed medication line, formatted as:
   "[Form] [Medicine Name as written] [Dosage] [Frequency in 1-0-1 or OD/BD/TDS/SOS format] x [Duration] [Food instruction]"
   Example: "Tab Amoxicillin 500mg 1-0-1 x 5 days after food"`
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          doctorName: {
            type: Type.STRING,
            description: 'Name and qualification of the prescribing doctor.'
          },
          clinicName: {
            type: Type.STRING,
            description: 'Hospital or clinic name from the prescription header.'
          },
          patientName: {
            type: Type.STRING,
            description: 'Patient name if visible on the prescription.'
          },
          date: {
            type: Type.STRING,
            description: 'Prescription date.'
          },
          rawOcrLines: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: 'Each extracted medicine line in standardized OCR line format.'
          }
        },
        required: ['doctorName', 'clinicName', 'patientName', 'date', 'rawOcrLines']
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response received from Gemini Vision OCR.');
  }

  return JSON.parse(text.trim()) as ExtractedPrescriptionPayload;
}

// Vercel Serverless Function default export
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { imageBase64, mimeType } = req.body || {};
    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 in request body.' });
      return;
    }

    const result = await analyzePrescriptionWithGemini(imageBase64, mimeType || 'image/jpeg');
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Failed to analyze prescription image with Gemini Vision.'
    });
  }
}
