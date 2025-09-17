exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const fn = params.fn;

  if (!fn) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'fn parameter required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  if (fn === 'mapbox-token') {
    const token = process.env.MAPBOX_API_KEY;
    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Mapbox token not configured' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ MAPBOX_API_KEY: token }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }

  if (fn === 'openweather-forecast') {
    const lat = params.lat;
    const lon = params.lon;
    if (!lat || !lon) {
      return { statusCode: 400, body: JSON.stringify({ error: 'lat and lon required' }) };
    }
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'OpenWeather API key not configured' }) };
    }
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${apiKey}&units=imperial`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      };
    } catch (err) {
      return { statusCode: 502, body: JSON.stringify({ error: 'proxy error', details: String(err) }) };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'unknown fn' }),
    headers: { 'Content-Type': 'application/json' }
  };
};
