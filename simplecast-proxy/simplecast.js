export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

  const TOKEN = "eyJhcGlfa2V5IjoiMzVmMTFkM2I1YTY2MmE1YWMxZDM5YjNjYjE0M2ZhMTcifQ==";
  const url = `https://api.simplecast.com/${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
