import { GoogleGenAI } from "@google/genai";

const getClient = (): GoogleGenAI => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn("API Key not found in environment. AI features will be simulated or fail.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a polite, professional email draft from the client to the photographer
 * based on their selection count and specific editing notes.
 */
export const generateEmailDraft = async (
  clientName: string,
  selectedCount: number,
  userNotes: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Using Flash for speed and standard text generation
    const modelId = 'gemini-2.5-flash';

    const prompt = `
      Anda adalah asisten yang membantu klien fotografi.
      Klien bernama "${clientName}" telah memilih ${selectedCount} foto dari galeri.
      Mereka memberikan catatan pengeditan khusus berikut: "${userNotes}".

      Tolong buatkan draf pesan/email yang sopan, profesional, dan ramah dalam BAHASA INDONESIA dari klien untuk fotografer.
      Pesan tersebut harus:
      1. Mengonfirmasi bahwa mereka telah selesai memilih foto.
      2. Menyebutkan jumlah foto yang dipilih.
      3. Dengan sopan meminta pengeditan berdasarkan catatan mereka.
      4. Menanyakan perkiraan waktu penyelesaian.
      
      Kembalikan HANYA isi pesan tersebut. Jangan sertakan subjek atau placeholder seperti [Nama Anda].
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Tidak dapat membuat draf. Silakan tulis pesan Anda secara manual.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Halo,\n\nSaya telah memilih ${selectedCount} foto. Catatan saya adalah: ${userNotes}.\n\nSaya menantikan hasil editnya!\n\nSalam,\n${clientName}`;
  }
};