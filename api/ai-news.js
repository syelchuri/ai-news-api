export default async function handler(req, res) {
  const url = 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en';

  try {
    const rss = await fetch(url);
    const text = await rss.text();

    // Note: DOMParser is not available in Node.js environment,
    // so we need an alternative parser like 'xml2js' or 'fast-xml-parser'.

    // To keep it simple, let's parse XML to JSON using 'fast-xml-parser'.

    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser();
    const jsonObj = parser.parse(text);

    const items = jsonObj.rss.channel.item.slice(0, 5);

    const news = items.map(item => ({
      title: item.title,
      link: item.link,
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
