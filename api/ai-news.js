import { XMLParser } from "fast-xml-parser";

const SOURCES = [
  {
    name: "Microsoft AI Blog",
    url: "https://www.microsoft.com/en-us/ai/blog/feed",
  },
  {
    name: "Azure AI Blog",
    url: "https://techcommunity.microsoft.com/gxcuf89792/rss/ai",
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
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
  },
  {
    name: "MIT Technology Review – AI",
    url: "https://www.technologyreview.com/feed/",
  },
  {
    name: "ProductLed Blog",
    url: "https://productled.com/blog/rss.xml",
  },
  {
    name: "Mind the Product",
    url: "https://www.mindtheproduct.com/feed/",
  },
  {
    name: "SVPG (Silicon Valley Product Group)",
    url: "https://www.svpg.com/articles/feed/"
  },
  {
    name: "Product Coalition Podcast",
    url: "https://api.substack.com/feed/podcast/2891139.rss"
  },
  {
    name: "Department of Product",
    url: "https://www.departmentofproduct.com/feed/"
  },
  {
    name: "Inside AI News",
    url: "https://insideainews.com/rss.xml"
  },
  {
    name: "Product Management Today",
    url: "https://www.productmanagementtoday.com/rss"
  }
];

export default async function handler(req, res) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const allArticles = [];

  for (const source of SOURCES) {
    try {
      const response = await fetch(source.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MyExtension/1.0)",
        },
      });
      const text = await response.text();
      const json = parser.parse(text);

      let items =
        json?.rss?.channel?.item ||
        json?.feed?.entry ||
        [];

      if (!Array.isArray(items)) {
        items = [items];
      }

      const parsedItems = items.slice(0, 3).map((item) => ({
        title: item.title?.["#text"] || item.title,
        link:
          item.link?.["@_href"] ||
          item.link?.href ||
          item.link ||
          (typeof item.link === "string" ? item.link : ""),
        source: source.name,
        pubDate: item.pubDate || item.published || item.updated || "",
      }));

      allArticles.push(...parsedItems);
    } catch (error) {
      console.warn(`Failed to fetch from ${source.name}:`, error.message);
    }
  }

  const sortedArticles = allArticles
    .filter(a => a.title && a.link)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 10);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(sortedArticles);
}
