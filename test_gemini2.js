const GEMINI_API_KEY = 'AIzaSyBYKXlpry1TDBA9iz8_6GfSoGqPCbPVb1g';
const GEMINI_MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.0-pro'
];

async function callGeminiWithRetry(prompt) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
  });

  for (const model of GEMINI_MODELS) {
    console.log(`Trying model ${model}...`);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }
    );

    if (response.status === 429) {
      console.log(`Rate limited on ${model}. Code: 429`);
      continue;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      console.error(`Error on ${model}:`, errData);
      continue;
    }

    const data = await response.json();
    console.log(`Success with ${model}:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
    return;
  }
}

callGeminiWithRetry("What is the capital of France?").then(console.log).catch(console.error);
