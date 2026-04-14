import { groq } from "@ai-sdk/groq";
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `Kamu adalah asisten keuangan SmartSpend. 
      Tugasmu HANYA mengekstrak data belanja user ke format: Kategori | Nominal | Nama Barang.
      Contoh: Makanan | 15000 | Nasi Goreng.
      Dilarang memberikan kalimat pembuka, penutup, atau penjelasan apapun.`,
      prompt: prompt,
    });
    // Tambahkan ini untuk debug
    // console.log("Methods available:", Object.getOwnPropertyNames(Object.getPrototypeOf(result)));

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Backend Error:", error);
    return new Response(JSON.stringify({ error: "Gagal memproses data" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}