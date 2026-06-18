export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  try {
    // ✅ WEATHER HANDLER
    if (type === 'weather') {
      const { lat, lon, days } = req.body;

      const r = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${lat},${lon}&days=${days}&aqi=no&alerts=no`
      );

      const data = await r.json();

      if (!r.ok) {
        return res.status(r.status).json({ error: data.error?.message });
      }

      return res.status(200).json(data);
    }

    // ✅ CLAUDE HANDLER
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Claude error'
      });
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({
      error: 'Server error',
      detail: err.message
    });
  }
}