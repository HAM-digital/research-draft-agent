import { defineEvalConfig } from "eve/evals";

export default defineEvalConfig({
  judge: { model: "anthropic/claude-haiku-4.5" },
});
