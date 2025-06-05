import { XMLParser } from "fast-xml-parser";

const SOURCES = [
  {
    name: "Microsoft AI Blog",
    url: "https://blogs.microsoft.com/ai/feed/",
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
  },
  {
    name: "Ben's Bites",
    url: "https://www.bensbites.co/rss",
  },
  {
    name: "The Rundown AI",
    url: "https://therundown.ai/feed",
  },
  {
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/rss.xml",
  },
  {
    name: "DeepMind Blog",
    url: "https://www.deepmind.com/blog/rss.xml",
  },
  {
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
  },
  {
    name: "Lenny’s Newsletter",
    url: "https://www.lennysnewsletter.com/feed",
  },
  {
    name: "Product-Led Blog",
    url: "https://productled.com/blog/rss.xml",
  },
  {
    name: "Product Coalition",
    url: "https://productcoalition.com/feed",
  },
  {
    name: "Inside Intercom",
    url: "https://www.intercom.com/blog/feed/",
  },
];

export default async function handler(req, res) {
  // Read 'sources' query parameter (comma-separated source IDs)
  const { sources } = req.query;

  // Filter trusted sources based on query or use all if none specified
  let selectedSources;
  if (sources) {
    const requested = sources.split(",").map(s => s.trim().toLowerCase());
    selectedSources = SOURCES.filter(src => requested.includes(src.id));
  } else {
    selectedSources = SOURCES;
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });

  try {
    let combinedNews = [];

    for (const source of selectedSources) {
      const response = await fetch(source.url);
      const xmlText = await response.text();
      const json = parser.parse(xmlText);

      // Extract news items from common RSS/Atom structures
      const items = json?.rss?.channel?.item || json?.feed?.entry || [];

      let newsItems = [];

      if (Array.isArray(items)) {
        newsItems = items.map(item => ({
          title: item.title,
          link: item.link?.href || item.link,
          pubDate: item.pubDate || item.published || null
        }));
      } else if (typeof items === "object" && items !== null) {
        newsItems = [{
          title: items.title,
          link: items.link?.href || items.link,
          pubDate: items.pubDate || items.published || null
        }];
      }

      combinedNews = combinedNews.concat(newsItems);
    }

    // Sort combined news by publication date, newest first
    combinedNews.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate) : 0;
      const dateB = b.pubDate ? new Date(b.pubDate) : 0;
      return dateB - dateA;
    });

    // Pick top 5 news items
    const topNews = combinedNews.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link
    }));

    // Allow cross-origin requests (CORS)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(topNews);
  } catch (error) {
    console.error("Error fetching or parsing news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
