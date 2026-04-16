export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const TOKEN = "eyJhcGlfa2V5IjoiMzVmMTFkM2I1YTY2MmE1YWMxZDM5YjNjYjE0M2ZhMTcifQ==";
  
  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

  // Build full URL including any query params beyond 'endpoint'
  const params = new URLSearchParams(req.query);
  params.delete("endpoint");
  const queryString = params.toString();
  const url = `https://api.simplecast.com/${endpoint}${queryString ? "?" + queryString : ""}`;

  try {
    const response = await fetch(url, {
      headers: { 
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.status(200).json(data);
    } catch {
      res.status(200).json({ raw: text });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
