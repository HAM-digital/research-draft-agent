# research-draft-agent

A small, real AI agent built on [Vercel eve](https://vercel.com/eve). You give
it a topic. It researches the web, writes a short draft in a fixed house style,
asks for your approval, and saves the result.

It is deliberately small. The point is not to show off what an agent can do.
The point is to understand every file that makes one work, so you can fix it
when it breaks and trust it enough to run for real.

## What it does

1. You send a topic ("write a short post about the latest James Webb images").
2. It calls `web_search` once to gather current sources.
3. It loads the `house-style` skill and writes a short draft.
4. It asks for your approval before saving (a human-in-the-loop gate).
5. On approval, it saves the draft to the sandbox and reads it back to you.

## The files

An eve agent is a directory. Each file is one decision.

    agent/
      agent.ts              # which model the agent runs on
      instructions.md       # the agent's standing behaviour
      tools/
        web_search.ts       # the one real capability (Tavily)
        save_draft.ts       # approval-gated save
        read_draft.ts       # reads the saved file back
        bash.ts             # disabled built-in
        web_fetch.ts        # disabled built-in
        write_file.ts       # disabled built-in
        read_file.ts        # disabled built-in
        glob.ts             # disabled built-in
        grep.ts             # disabled built-in
      skills/
        house-style.md      # writing rules, loaded on demand
      sandbox/
        sandbox.ts          # deny-all network policy
    evals/
      evals.config.ts       # eval defaults
      draft.eval.ts         # tests the path, not just the output

## Running it

Requirements: Node 24 and a [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
key. Search uses [Tavily](https://tavily.com) (free tier).

    nvm use 24
    npm install

    # copy the example and fill in your keys
    cp .env.example .env.local

    npx eve dev        # terminal 1: agent runtime + TUI
    npm run dev        # terminal 2: web chat at localhost:3000

Then ask it to research and draft something. Approve the save when it asks.

> research and write a short post about the latest James Webb images, then save it

### Environment variables

See `.env.example`. You need:

- `AI_GATEWAY_API_KEY` — from the Vercel AI Gateway console.
- `TAVILY_API_KEY` — free tier from tavily.com.

`.env.local` is gitignored and never ships. If you deploy this, set these in
your host's environment (for Vercel: `vercel env add`), not in a committed file.

## A note on the model and cost

The model is set in `agent/agent.ts`. The eve scaffold defaults to a premium
model that is gated on the AI Gateway free tier (you get a 403). This repo uses
a free-tier model instead. The current free-tier list is at
https://vercel.com/ai-gateway/models?freeTier=true.

Three things keep spend predictable, and they are worth understanding before
you run any agent:

- A small tool surface. Most runaway cost is a loop that will not stop. This
  agent has only the tools it needs; the rest are disabled (see below).
- A cheap model. The single biggest cost lever. Swap up only when you need to.
- A budget cap. Set a spend limit on your AI Gateway key in the Vercel
  dashboard and turn auto-top-up off. That is the real ceiling.

## A note on security

This repo is locked down on purpose, and there is one lesson worth stating
plainly: an agent's risk scales with its tool surface, and telling the model
"do not do X" in instructions is guidance, not a control. The only real control
is disabling a capability at the config layer.

What that means here:

- The built-in `bash`, `web_fetch`, `write_file`, `read_file`, `glob`, and
  `grep` tools are disabled. eve ships them by default; an unrestricted
  built-in `write_file` would let the model write any file and bypass the
  approval gate entirely. Each is removed with a one-line `disableTool()` stub.
- The sandbox uses a `deny-all` network policy (`agent/sandbox/sandbox.ts`).
  `web_search` runs in the app runtime, not the sandbox, so it is unaffected.
- `save_draft` requires human approval before it writes.

One limitation, stated honestly: the built-in subagent (`agent`) tool cannot be
disabled the way the others can in this eve version, so it stays live. Its blast
radius is small, because a subagent inherits this agent's already-stripped
toolset (no shell, no file I/O), but it is worth knowing it is there.

## A note on auth (read before deploying)

The channel is locked to local development. Anonymous traffic to a deployed
instance gets a 401. That is the right default for a repo you clone and run
yourself.

Do not switch the channel auth to `none()` to "make the deployed UI work" for
the public. `none()` exposes the agent to anyone. If you deploy this for real
users, wire in real authentication (Auth.js, Clerk, or your own provider) and
add per-user/session scoping. eve handles the loop; the auth model around it is
yours to design.

## Testing it

    npx eve eval

The eval checks the path through the loop, not just the final text: did it
search, did it load the house-style skill, did it park for approval before
saving. It deliberately does not assert on the exact wording of the draft,
because a language model's exact output varies run to run. Test the invariants
that always hold, not the prose of any single run.

## Built with

[Vercel eve](https://vercel.com/eve) (Apache-2.0), the Vercel AI Gateway, and
[Tavily](https://tavily.com) for search.

## License

MIT. Use it, fork it, learn from it.
