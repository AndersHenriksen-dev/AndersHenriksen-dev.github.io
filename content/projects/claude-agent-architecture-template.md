---
title: "Claude Agent Architecture Template"
date: 2026-11-06
author: "Anders Henriksen"
description: "One small example that uses all six ways to build with Claude: rules, skills, hooks, MCP, the API and connectors. It finds the subscriptions on a made-up bank statement."
image: /images/projects/agent-template-card.svg
imageAlt: "A list of the six types and what each does in the example: a rule for Decimal money and no financial advice, a skill with the steps, a hook that denies an overstated saving, five MCP tools over stdio, one API call that cleans merchant names, and three read tools over a connector"
images:
  - /images/projects/agent-template-card.png
badges:
  - "Python"
  - "Agents"
  - "MCP"
  - "Claude"
links:
  - icon: fab fa-github
    name: "View the code on GitHub"
    url: https://github.com/AndersHenriksen-dev/claude-agent-architecture-template
tags: ["LLM", "Agents", "MCP", "Python"]
showInHome: true
toc: true
---

Claude gives you six ways to build an agent: rules, skills, hooks, MCP, the API and connectors. They overlap, and the docs explain each one on its own page. I built one small example that needs all six, so I could see them work together, and I keep it as a template for new projects.

<!--more-->

The example finds the subscriptions on a bank statement. The job splits cleanly: a model reads the merchant names, and code handles the money, because a model should not be trusted to add up or to state a saving nobody checked.

*All the data is made up: the person, the merchants and the amounts.*

## What it does

A bank writes one merchant as `TUNEBOX P2F3A1`, `TNBX*PREMIUM` and `TUNEBOX AB STHLM`. The example works out that these are one subscription, totals the latest charges and writes a summary. Each type has its own part of that job:

- **Rule:** text Claude Code loads and asks the model to follow. Here: use `Decimal` for money, and give no financial advice.
- **Skill:** a procedure that loads only when used. Here: `/find-subscriptions`, with the steps and the format of the summary.
- **Hook:** code Claude Code runs at a fixed moment, whatever the model wants. Here: deny a saving above the latest charge, log every call, and refuse to stop with no summary.
- **MCP:** a standard way to offer tools to any client. Here: five tools over stdio, three that read and two that write.
- **API:** your program calling the model directly. Here: one structured call cleans the merchant names, with no Claude Code around it.
- **Connector:** a remote MCP server, called from Anthropic's cloud. Here: the three read tools over HTTP.

The page I would read first is [docs/types.md](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/docs/types.md). It says when to pick each type over the others, starting with one question: must this happen every time, whatever the model decides? If so, it is a hook.

To start a new project from it, click **Use this template** and follow [docs/adapt.md](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/docs/adapt.md). Most of the change is in one folder, and the tests tell you what you missed.

## Results

**The free demo runs every type for real, with only the model scripted.** The MCP server runs as a subprocess, each hook as a process fed the JSON Claude Code sends, and the connector's server over HTTP on my machine. It stops at the first wrong result, and CI runs it on every pull request. It needs no API key:

```bash
git clone https://github.com/AndersHenriksen-dev/claude-agent-architecture-template.git
cd claude-agent-architecture-template
uv sync
uv run subfinder demo
```

It ends with the four subscriptions on the statement:

| Subscription | DKK a month |
|---|---:|
| CloudVault | 29.00 |
| FitZone | 249.00 |
| Tunebox | 109.00 |
| Viewly | 119.00 |
| **Total if all were cancelled** | **506.00** |

**In a real Claude Code session, the hooks did their job.** The skill reached the right answer, `PostToolUse` logged every call, `PreToolUse` denied a saving of 999.00 on Viewly, and `Stop` sent back a run with no summary.

**One real API run matched.** On Claude Sonnet 5.5 it used 1,118 input and 865 output tokens, which cost USD 0.0109. It found the same four subscriptions and the same 506.00 total, saw that NewsDaily had ended, and agreed with my hand-written answer on 20 of the 22 descriptions.

## What I learned

- **A rule asks and a hook enforces, and only one of them can make a promise.** "Never overstate a saving" appears in the skill, in the tool's description and in a hook. Only the hook holds if the model gets it wrong.
- **A connector goes around your hooks.** Its calls go from Anthropic's cloud straight to the server, so neither my hooks nor my own code see them. That is why the connector here has no tool that writes. It is the design decision the whole type comes down to.
- **Most of the job did not need an agent.** The API path is one model call followed by arithmetic. With the model kept away from the amounts, a wrong answer can put a merchant in the wrong category, but it cannot invent a charge.
- **A guard is not a seventh type.** The Claude docs do not use the word. It usually means a check that can block something, and in Claude Code a hook is what runs it. I wrote the check as a plain function, so the API path can call the same one where no hook exists.
- **The two kinds of config file behave in opposite ways.** Instruction files stack: Claude reads all of them. Settings files override: one value wins, except that lists combine. So an `allow` in my local file does not cancel an `ask` in the team's file.

## Where it breaks

- **The connector has not run from Anthropic's cloud.** I have tested the server over HTTP on my own machine, and the request's shape against the docs. I have not run those steps through a tunnel from Anthropic's cloud, so treat them as a starting point.
- **A custom connector on claude.ai has no fixed token.** It takes no authentication or OAuth, so the steps for it turn authentication off. Only do that with made-up data, and stop the tunnel afterwards.
- **The demo proves the wiring, not the model.** The model is scripted there, so it says nothing about how well a real model does the job.
- **The paid numbers come from one run.** One API call on one small made-up statement is an example, not an evaluation.
- **It is a teaching example.** It reads a statement I made up, so it says nothing about real bank data, and it is not a product.
- **Some rules cannot be enforced.** No code can judge whether a sentence gives financial advice, so that one stays a rule and only asks.
- **It covers six types and no more.** The Agent SDK, Managed Agents, subagents and plugins are not in it. I checked the descriptions against the Claude docs on 2026-11-06, and those docs will change.

## How it works

1. **Always in context.** The rules and `CLAUDE.md` load with the session, and the skill loads when `/find-subscriptions` runs.
2. **Before a tool call.** The `PreToolUse` hook runs the checks. A denied call goes back to the model with the reason, for example that a saving of 529.00 on CloudVault is more than its latest charge of 29.00.
3. **The tool call.** The MCP server over stdio offers all five tools, and `PostToolUse` writes each call to the audit log.
4. **Before stopping.** The `Stop` hook sends the model back if a run has tags but no summary.
5. **Without Claude Code.** The API path makes one structured call and does the rest as arithmetic. No hook runs there, so the code calls the same checks itself.
6. **From outside my machine.** A connector call comes from claude.ai or the API, through Anthropic's cloud, to the three read tools. No hook sees it, so nothing written goes through it.

## Tech stack

Python and uv, the Anthropic SDK, and MCP over stdio and HTTP. The code is checked with ruff, mypy and pytest, and GitHub Actions runs those checks, the demo and a gitleaks secret scan on every pull request. It is MIT licensed.

The [README](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template#readme) has the steps to run it through Claude Code, the API and a connector. The repository also has a [study guide](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/docs/learn/README.md) with one chapter per type, one run traced from start to finish, self-test questions and exercises, and a [record of why it is built this way](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/docs/decisions.md).
