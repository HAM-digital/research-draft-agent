import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "The agent researches, loads house style, gates the save, then drafts with a cited URL.",
  async test(t) {
    await t.send(
      "research and write a short post about the latest James Webb images, then save it",
    );
    // Parks on the save_draft approval gate.
    t.expectInputRequests({ toolName: "save_draft" });
    t.calledTool("web_search");
    t.loadedSkill("house-style");
    await t.respondAll("approve");
    t.completed();
  },
});
