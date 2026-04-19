const cache = new Map();
const TTL = 3 * 60 * 1000; // 3 minutes

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const now = Date.now();

    // ✅ Check cache
    if (cache.has(prompt)) {
      const entry = cache.get(prompt);

      if (now - entry.timestamp < TTL) {
        return res.status(200).json({
          text: entry.data,
          cached: true
        });
      } else {
        cache.delete(prompt);
      }
    }

    // 🤖 Call Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const text = data.content?.map(b => b.text || '').join('');

    // ✅ Store in cache
    cache.set(prompt, {
      data: text,
      timestamp: now
    });

    // 🧹 Prevent memory growth
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return res.status(200).json({
      text,
      cached: false
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}