import { XMLParser } from "fast-xml-parser";

const SOURCES = [
  {
    name: "Microsoft AI Blog",
    url: "https://blogs.microsoft.com/ai/feed/",
  },
  {
    name: "Azure AI Blog",
    url: "https://techcommunity.microsoft.com/gxcuf89792/rss/ai",
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
  },
  {
    name: "DeepMind Blog",
    url: "https://www.deepmind.com/blog/rss.xml",
  },
  {
    name: "Google AI Blog",
    url: "https://ai.googleblog.com/feeds/posts/default",
  },
  {
    name: "ProductLed Blog",
    url: "https://productled.com/feed/",
  },
  {
    name: "Mind the Product",
    url: "https://www.mindtheproduct.com/feed/",
  },
  {
    name: "Product Coalition",
    url: "https://medium.com/feed/product-coalition",
  },
  {
    name: "Towards Data Science - AI",
    url: "https://towardsdatascience.com/feed/tagged/artificial-intelligence",
  },
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
  }
];

export default async function handler(req, res) {
  const parser = new XMLParser();
  const allArticles = [];

  for (const source of SOURCES) {
    try {
      const response = await fetch(source.url);
      const text = await response.text();
      const json = parser.parse(text);
      const items = json?.rss?.channel?.item;

      if (Array.isArray(items)) {
        const simplified = items.slice(0, 3).map(item => ({
          title: item.title,
          link: item.link,
          source: source.name,
          pubDate: item.pubDate || "",
        }));
        allArticles.push(...simplified);
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${source.name}:`, error.message);
    }
  }

  // Sort by date (optional but useful)
  const sortedArticles = allArticles
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 10); // Limit to top 10 articles

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(sortedArticles);
}
