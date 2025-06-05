import { XMLParser } from "fast-xml-parser";

export default async function handler(req, res) {
  const url = 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en';

  try {
    const rssResponse = await fetch(url);
    const rssText = await rssResponse.text();

    const parser = new XMLParser();
    const jsonObj = parser.parse(rssText);

    // Navigate to items (news articles)
    const items = jsonObj?.rss?.channel?.item;

    // Take only first 5 articles
    const news = Array.isArray(items) ? items.slice(0, 5) : [];

    // Map to title and link
    const simplifiedNews = news.map(item => ({
      title: item.title,
      link: item.link,
    }));

    // Allow your extension to access this API (CORS)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(simplifiedNews);
  } catch (error) {
    console.error("Error fetching or parsing news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
