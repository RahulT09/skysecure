const GEMINI_API_KEY = 'AIzaSyBYKXlpry1TDBA9iz8_6GfSoGqPCbPVb1g';
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

async function callGeminiWithRetry(prompt) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
  });

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`Trying model ${model}, attempt ${attempt + 1}`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          }
        );

        if (response.status === 429) {
          console.log(`Rate limited on ${model}. Code: ${response.status}`);
          await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
          if (attempt === 2) throw new Error('Rate Limited');
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          console.error(`Error on ${model}:`, errData);
          throw new Error(errData?.error?.message || `API ${response.status}`);
        }

        const data = await response.json();
        console.log(`Success with ${model}:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
      } catch (err) {
        console.error(`Catch block error for ${model}:`, err.message);
        if (attempt === 2) break; // exhausted retries for this model
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1500));
      }
    }
  }

  throw new Error('All models exhausted');
}

callGeminiWithRetry("What is the capital of France?").then(console.log).catch(console.error);
