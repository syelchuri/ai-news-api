export default async function handler(req, res) {
  const url = 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en';

  try {
    const rss = await fetch(url);
    const text = await rss.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const items = Array.from(xml.querySelectorAll("item")).slice(0, 5);

    const news = items.map(item => ({
      title: item.querySelector("title")?.textContent,
      link: item.querySelector("link")?.textContent,
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
