import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Read a saved draft back from disk and return its full contents. Call this after save_draft to show the user the saved file.",
  inputSchema: z.object({
    path: z.string().min(1).describe("The path returned by save_draft"),
  }),
  async execute({ path }, ctx) {
    const sandbox = await ctx.getSandbox();
    const content = await sandbox.readTextFile({ path });
    return { path, content };
  },
});
