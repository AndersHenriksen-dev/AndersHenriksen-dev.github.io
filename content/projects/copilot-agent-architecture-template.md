---
title: "Copilot Agent Architecture Template"
date: 2026-11-20
weight: 60
author: "Anders Henriksen"
description: "One small example that uses all seven ways to build with GitHub Copilot: instructions, prompt files, skills, custom agents, subagents, hooks and MCP. It solves the same job as my Claude template, so the two can be compared."
image: /images/projects/copilot-agent-template-card.svg
imageAlt: "A list of Copilot's seven types and what each does in the example: instructions scoped by applyTo, a prompt file that checks one claimed saving, a skill with the steps and a script, a read-only custom agent, a subagent that is not a file you write, hooks that deny an overstated saving, and five MCP tools over stdio with three over HTTP"
images:
  - /images/projects/copilot-agent-template-card.png
badges:
  - "Python"
  - "Agents"
  - "MCP"
  - "GitHub Copilot"
links:
  - icon: fab fa-github
    name: "View the code on GitHub"
    url: https://github.com/AndersHenriksen-dev/copilot-agent-architecture-template
tags: ["LLM", "Agents", "MCP", "Python"]
showInHome: true
toc: true
---

GitHub Copilot gives you seven ways to shape what it does: instructions, prompt files, skills, custom agents, subagents, hooks and MCP. The docs explain each one on its own page. I built one small example that uses all of them, so I could see them work together, and I keep it as a template for new projects.

<!--more-->

It solves the same job as my [Claude agent architecture template](/projects/claude-agent-architecture-template/): finding the subscriptions on a made-up bank statement. Same statement, same four subscriptions, same total. Holding the problem still is what makes the two toolkits comparable.

*All the data is made up: the person, the merchants and the amounts.*

## What it does

A bank writes one merchant as `TUNEBOX P2F3A1`, `TNBX*PREMIUM` and `TUNEBOX AB STHLM`. The example works out that these are one subscription, totals the latest charges and writes a summary. A model reads the names, and code handles the money, because a model should not be trusted to add up or to state a saving nobody checked.

Each type has its own part of that job:

- **Instructions:** Markdown Copilot loads and asks the model to follow. Here: use `Decimal` for money, give no financial advice, and three more files scoped with `applyTo` so they load only for the files they are about.
- **Prompt file:** one task, run by hand with an argument. Here: `/review-summary`, which checks one merchant's claimed saving.
- **Skill:** a procedure Copilot loads when it decides the task needs it. Here: the seven steps, the format of the summary, and a script that tallies the audit log.
- **Custom agent:** a persona with its own tool allowlist. Here: an auditor that reads a finished run and cannot change it.
- **Subagent:** a helper with its own context. It is in GitHub's list of seven, and it is the one that is not a file you write, so there is nothing in the repository for it.
- **Hooks:** commands Copilot runs at a fixed event, whatever the model wants. Here: deny a saving above the latest charge, log every call, refuse to stop with no summary, and tell a new session what the last one left behind.
- **MCP:** a standard way to offer tools to any client. Here: five tools over stdio, and the three read tools over HTTP for Copilot running on GitHub's side.

The page I would read first is [docs/types.md](https://github.com/AndersHenriksen-dev/copilot-agent-architecture-template/blob/main/docs/types.md), which says when to pick each type over the others. The page I would read second is [docs/surfaces.md](https://github.com/AndersHenriksen-dev/copilot-agent-architecture-template/blob/main/docs/surfaces.md), because with Copilot the answer to "is this supported" depends entirely on where it is running.

There is also a path with no Copilot in it at all: one call to GitHub Models, with the arithmetic around it in plain code. Nothing is loaded there, hooks included, so that code calls the same checks itself.

## Results

**The free demo runs every type for real, with only the model scripted.** The MCP server runs as a subprocess, each hook as a process fed the JSON Copilot sends, and the HTTP transport over real HTTP on my machine. It stops at the first wrong result, and GitHub Actions runs it on every pull request alongside 188 tests. It needs no token and sends nothing anywhere:

```bash
git clone https://github.com/AndersHenriksen-dev/copilot-agent-architecture-template.git
cd copilot-agent-architecture-template
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

**Several of the demo's checks are about the Copilot files, not the statement.** That both MCP config files launch the same server, that the custom agent's allowlist has nothing that writes, that every hook event wired in the JSON has a handler in the code, and that the three `applyTo` instruction files do not overlap. Those are the mistakes a config file makes silently, so they are the ones worth testing.

**The hooks refuse what they should.** Fed the payload Copilot sends, `preToolUse` denies a saving of 529.00 on CloudVault whose latest charge is 29.00, and returns the reason the model reads. `agentStop` blocks a run that has tags and no summary. `postToolUse` writes both the refused call and the one that ran to the audit log.

## What I learned

- **In Copilot, "is this supported" is not a question you can answer without naming the surface.** Prompt files do not run on github.com or in the CLI. Hooks are in public preview in VS Code but supported in the CLI and on GitHub's side. Path-specific instructions reach the cloud agent and code review but not Chat on github.com. MCP needs a different config file per surface, and the CLI refuses to read VS Code's. One repository, seven types, and no two surfaces that read all of it.
- **Copilot has hooks now, so it can enforce and not only ask, but not where most people work.** A `preToolUse` hook denies a call and fails closed when it crashes. It does not fail closed when it times out, on any event, so a slow hook is an open door rather than a shut one. And the surface where hooks are weakest is the editor. So the same check lives in three places in this repo: the hook, the code in the model path, and the tests.
- **The one thing GitHub does not document turned out to be the thing I needed.** A hook matcher is tested against the tool's name, and the docs name every built-in tool but never say how a tool from an MCP server is spelled. A confident guess would have failed silently, with no hook running and the write going through. So the matcher allows any prefix and the hook works out the name itself. Designing around a documentation gap was the most instructive part of this.
- **Restricting a tool list is an allowlist with no deny syntax.** A custom agent's `tools` field is the whole restriction: leave it out and everything is allowed, and a name it does not recognise is ignored rather than reported. A read-only agent is defined by what is absent from a list, which is worth knowing before trusting one.
- **An annotation I would have read as a hint decides whether a tool exists.** Copilot code review drops any MCP tool that does not declare itself read-only. That is the platform enforcing read-only from its own side, which is the opposite of the usual arrangement where the server has to defend itself.
- **Reaching tools from a vendor's cloud goes around your hooks, whichever vendor it is.** The cloud agent and code review call an MCP server from GitHub's machines, so nothing of mine is in the path. I reached the same conclusion about Anthropic's connectors for the same reason, which suggests it is a property of remote tool calling and not of either product.

## Where it breaks

- **Only the demo and the tests have been run.** Copilot CLI, the cloud agent and Copilot code review have not. The repository lists what has been run and what has not, rather than implying the rest works.
- **The GitHub Models call has not been run either.** `models.github.ai` is unreachable from the machine I built this on: every path returns a bare `OK`. The endpoint, the model id and the request shape come from the documentation, and the tests check the code against a stand-in instead of the live API. The model id is in config and overridable, because catalogs change.
- **A repository MCP server needs a public URL.** The cloud agent reaches one from GitHub's side, which means a tunnel. I have tested the server over HTTP on my own machine and written down the settings JSON, but nothing here has been reached from GitHub.
- **One of the seven types has a removal date.** VS Code says prompt files run only in its Local harness, which is deprecated and due to go in February 2027, and recommends converting them to skills. The type is in the repository because GitHub lists it, and the file says plainly that it is the one to avoid building on.
- **The demo proves the wiring, not the model.** The model is scripted there, so it says nothing about how well a real model does the job.
- **It is a teaching example.** It reads a statement I made up, so it says nothing about real bank data, and it is not a product.
- **Some rules cannot be enforced.** No code can judge whether a sentence gives financial advice, so that one stays an instruction and only asks.
- **The documentation moves.** I checked every claim against the GitHub and VS Code docs on 20 November 2026, and several of the design decisions exist only because something is undocumented today.

## How it works

1. **Before anything is asked.** VS Code starts the MCP server and lists its five tools. The repo-wide instructions and `AGENTS.md` are in context; the three scoped files are not, until a file they cover is in play. The `sessionStart` hook reports what the last run left behind.
2. **The request.** Copilot reads the skill's description, decides the task matches, and loads its steps and the format of the summary.
3. **Reading.** It calls the read tools, and `postToolUse` appends each call to the audit log.
4. **Tagging.** `preToolUse` runs the checks first. A charge that is not on the statement, or already counted under another merchant, comes back denied with the reason.
5. **The summary.** A saving above the merchant's latest charge, a total that does not match its lines, or a claim for a subscription that has already ended are all refused.
6. **Trying to stop early.** `agentStop` sends the model back if the run has tags and no summary, and stands down on the second attempt so a session can always end.
7. **Without Copilot.** One model call cleans the names and the rest is arithmetic. No hook runs there, so the code calls the same checks itself.

## Tech stack

Python and uv, MCP over stdio and HTTP, and the GitHub Models API for the one model call. The code is checked with ruff, mypy and 188 pytest tests, and GitHub Actions runs those checks, the demo and a gitleaks secret scan on every pull request. It is MIT licensed.

The [README](https://github.com/AndersHenriksen-dev/copilot-agent-architecture-template#readme) has the steps to run it. The repository also has a [study guide](https://github.com/AndersHenriksen-dev/copilot-agent-architecture-template/blob/main/docs/learn/README.md) with one chapter per type, one run traced from start to finish, 46 self-test questions and seven exercises, and a [record of why it is built this way](https://github.com/AndersHenriksen-dev/copilot-agent-architecture-template/blob/main/docs/decisions.md).
