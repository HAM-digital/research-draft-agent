import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Search the web for current information on a topic. Returns a few relevant results, each with a title, url, and content snippet. Use this before writing so claims are grounded in real sources.",
  inputSchema: z.object({
    query: z.string().min(1).describe("The search query"),
  }),
  async execute({ query }) {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: 5,
        search_depth: "basic",
      }),
    });

    if (!res.ok) {
      return { error: `Search failed: ${res.status}` };
    }

    const data = await res.json();
    return {
      results: (data.results ?? []).map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
      })),
    };
  },
});
