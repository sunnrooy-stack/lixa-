const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
const model = "google/gemini-2.0-flash-lite-preview-02-05:free";
const apiKey = process.env.OPENROUTER_API_KEY || "";

async function test() {
    const res = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'hello' }]
        }),
    });
    
    if (!res.ok) {
        console.error("Error:", await res.text());
    } else {
        console.log("Success:", await res.json());
    }
}
test();
