import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

export default defineTool({
  description:
    "Save the finished draft to a file. Only call this once the draft is complete. Requires human approval before it runs.",
  inputSchema: z.object({
    title: z.string().min(1).describe("Short title for the draft"),
    body: z.string().min(1).describe("The full draft text"),
  }),
  needsApproval: always(),
  async execute({ title, body }, ctx) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const path = `drafts/${slug}.md`;
    const sandbox = await ctx.getSandbox();
    await sandbox.writeTextFile({ path, content: `# ${title}\n\n${body}\n` });
    return { saved: true, path, title, draft: `# ${title}\n\n${body}\n` };
  },
});
