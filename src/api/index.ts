import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const api = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

api.post("/generate-feedback", async (req, res) => {
  try {
    const { detailedScores, totalScore } = req.body;
    
    const prompt = `
Anda adalah seorang ahli supervisi pendidikan dan kepala sekolah yang berpengalaman.
Berdasarkan data observasi supervisi pembelajaran berikut, buatkan umpan balik (feedback) dan tindak lanjut (follow-up) yang konstruktif dan profesional untuk guru.

Data Observasi:
- Total Skor: ${totalScore}
- Rincian Skor per Indikator beserta Catatannya: 
${JSON.stringify(detailedScores, null, 2)}

Mohon berikan:
1. Umpan Balik (Feedback) yang mengapresiasi kekuatan dan menyoroti area yang perlu ditingkatkan.
2. Tindak Lanjut (Follow-up) berupa saran langkah konkrit atau pelatihan yang perlu dilakukan guru.

Format jawaban harus dalam bahasa Indonesia yang formal namun membangun.
Kembalikan jawaban HANYA dalam format JSON dengan struktur:
{
  "feedback": "string (umpan balik)",
  "followUp": "string (tindak lanjut)"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
        throw new Error("Failed to generate content");
    }

    let text = response.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(text);
    res.json(result);
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Failed to generate feedback", details: error instanceof Error ? error.message : String(error) });
  }
});

export default api;
