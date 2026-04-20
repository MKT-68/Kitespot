export default async function handler(req, res) {
const { type } = req.query;

try {
// ── WEATHER ───────────────────────────────
if (type === 'weather') {
const { lat, lon, days = 1 } = req.body;

```
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${lat},${lon}&days=${days}&aqi=no`;

  const response = await fetch(url);
  const data = await response.json();

  return res.status(response.status).json(data);
}

// ── CLAUDE ───────────────────────────────
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

res.status(response.status).json(data);
```

} catch (err) {
res.status(500).json({
error: 'Server error',
detail: err.message
});
}
}
