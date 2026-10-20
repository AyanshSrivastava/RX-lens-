
import { GoogleGenAI, Type } from '@google/genai';

export interface ExtractedPrescriptionPayload {
  doctorName: string;
  clinicName: string;
  patientName: string;
  date: string;
  rawOcrLines: string[];
}

const UNKNOWN = 'Unknown';

export async function analyzePrescriptionWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedPrescriptionPayload> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it to your server environment variables.'
    );
  }

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('No valid prescription image was provided.');
  }

  const cleanBase64 = imageBase64.replace(
    /^data:[^;]+;base64,/,
    ''
  );

  const supportedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];

  const normalizedMimeType = supportedMimeTypes.includes(mimeType)
    ? mimeType
    : 'image/jpeg';

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const prompt = `
You are the prescription OCR component of RxLens.

Your task is to transcribe the supplied prescription image as accurately
as possible. This is a transcription task, not a medical decision task.

IMAGE READING:
- Examine the entire image carefully, line by line.
- Read handwritten and printed text, including medicine lines and visible
  patient, doctor, clinic, and date details.
- Pay attention to similar-looking letters, digits, decimal points,
  abbreviations, and dosage units.
- Do not claim the image is readable if the handwriting is unclear.
- Do not invent text that is not visible in the image.

EXTRACTION RULES:
1. doctorName:
   Extract the doctor's name if clearly visible. Otherwise return "Unknown".

2. clinicName:
   Extract the clinic or hospital name if clearly visible.
   Otherwise return "Unknown".

3. patientName:
   Extract the patient's name if clearly visible.
   Otherwise return "Unknown".

4. date:
   Extract the date exactly as written when it is readable.
   If unreadable or absent, return "Unknown".
   Never substitute today's date or infer a missing date.

5. rawOcrLines:
   Return an array containing one string per prescribed medicine line.
   Preserve the wording and abbreviations visible in the image as closely
   as possible.

   Use this format where the information is legible:
   "[Form] [Medicine name] [Dosage] [Frequency] x [Duration] [Food instruction]"

   Example format only:
   "Tab ExampleMedicine 500mg 1-0-1 x 5 days after food"

   Do not use the example as an actual extracted medicine.

MEDICATION SAFETY:
- Never guess or autocomplete a medicine name based on what is commonly
  prescribed.
- Never invent a dose, frequency, duration, route, or food instruction.
- Do not convert an unclear medicine into a different medicine because
  its name looks similar.
- Preserve recognizable original text and append "[uncertain]" to the
  relevant field when the text cannot be read confidently.
- If the medicine line is too illegible to transcribe, return a brief
  description such as "Medicine line unreadable - manual review required".
- If the image contains no visible medicine lines, return an empty array.
- Do not treat instructions, signatures, or stamps as medicines.
- Do not calculate or recommend doses.
- Do not provide a diagnosis or infer the reason for a prescription.

OUTPUT:
Return only the JSON object matching the requested schema.
Use "Unknown" for unreadable or absent doctor, clinic, patient, or date
fields. Mark uncertain medication text explicitly.
`;

  try {
    const response = await ai.models.generateContent({
      // Verify that this model ID is supported by your Gemini API account.
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: normalizedMimeType,
              data: cleanBase64
            }
          },
          {
            text: prompt
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
              description:
                'Doctor name as visible in the image, or Unknown.'
            },
            clinicName: {
              type: Type.STRING,
              description:
                'Clinic or hospital name as visible, or Unknown.'
            },
            patientName: {
              type: Type.STRING,
              description:
                'Patient name as visible in the image, or Unknown.'
            },
            date: {
              type: Type.STRING,
              description:
                'Date exactly as written, or Unknown. Never invent a date.'
            },
            rawOcrLines: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description:
                'Prescription medicine lines transcribed faithfully. ' +
                'Mark uncertain text and never guess medication details.'
            }
          },
          required: [
            'doctorName',
            'clinicName',
            'patientName',
            'date',
            'rawOcrLines'
          ]
        }
      }
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error(
        'Gemini returned an empty response. Try a clearer image.'
      );
    }

    let parsed: ExtractedPrescriptionPayload;

    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      throw new Error(
        'Gemini returned an invalid response. Please retry the image.'
      );
    }

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.rawOcrLines)
    ) {
      throw new Error(
        'Gemini returned an unexpected prescription format.'
      );
    }

    return {
      doctorName:
        typeof parsed.doctorName === 'string'
          ? parsed.doctorName
          : UNKNOWN,
      clinicName:
        typeof parsed.clinicName === 'string'
          ? parsed.clinicName
          : UNKNOWN,
      patientName:
        typeof parsed.patientName === 'string'
          ? parsed.patientName
          : UNKNOWN,
      date:
        typeof parsed.date === 'string'
          ? parsed.date
          : UNKNOWN,
      rawOcrLines: parsed.rawOcrLines.filter(
        (line): line is string =>
          typeof line === 'string' && line.trim().length > 0
      )
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown Gemini API error.';

    console.error('[RxLens OCR] Prescription analysis failed:', message);

    // Preserve actionable configuration and API error messages.
    throw new Error(`Prescription OCR failed: ${message}`);
  }
}

// Vercel Serverless Function handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method Not Allowed'
    });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        error: 'Missing imageBase64 in request body.'
      });
    }

    const result = await analyzePrescriptionWithGemini(
      imageBase64,
      mimeType || 'image/jpeg'
    );

    return res.status(200).json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to analyze prescription image.';

    const status =
      message.includes('GEMINI_API_KEY is not configured')
        ? 503
        : 502;

    return res.status(status).json({
      error: message
    });
  }
}
