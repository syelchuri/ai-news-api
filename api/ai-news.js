import { XMLParser } from "fast-xml-parser";

const sources = [
  {
    id: "microsoft",
    name: "Microsoft AI Blog",
    rss: "https://blogs.microsoft.com/ai/feed/"
  },
  {
    id: "openai",
    name: "OpenAI Blog",
    rss: "https://openai.com/feed.xml"
  },
  {
    id: "bensbites",
    name: "Ben's Bites",
    rss: "https://www.bensbites.co/rss"
  },
  {
    id: "therundown",
    name: "The Rundown AI",
    rss: "https://www.therundown.ai/feed"
  },
  {
    id: "huggingface",
    name: "Hugging Face Blog",
    rss: "https://huggingface.co/blog/rss.xml"
  },
  {
    id: "deepmind",
    name: "DeepMind Blog",
    rss: "https://deepmind.google/feed.xml"
  },
  {
    id: "venturebeat",
    name: "VentureBeat AI",
    rss: "https://venturebeat.com/category/ai/feed/"
  },
  {
    id: "lennysnewsletter",
    name: "Lenny’s Newsletter",
    rss: "https://www.lennysnewsletter.com/feed"
  },
  {
    id: "productled",
    name: "Product-Led",
    rss: "https://productled.com/blog/rss/"
  },
  {
    id: "productcoalition",
    name: "Product Coalition",
    rss: "https://productcoalition.com/feed"
  },
  {
    id: "intercom",
    name: "Inside Intercom",
    rss: "https://www.intercom.com/blog/feed/"
  }
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
